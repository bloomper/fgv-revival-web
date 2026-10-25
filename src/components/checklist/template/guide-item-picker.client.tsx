"use client";

import {useEffect, useState} from "react";
import {useTranslations} from "next-intl";
import {X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {type GuideSearchHit, searchGuideAction} from "@/app/(app)/guide/actions.server";
import {GuideTypeBadge} from "@/components/guide/guide-type-badge";

const MIN_QUERY = 2;

/**
 * Picks a guide item in the latest published version through the guide's search.
 */
export function GuideItemPicker({value, label, onChange}: {
    value: string | null;
    label: string | null;
    onChange: (key: string | null, label: string | null) => void;
}) {
    const t = useTranslations("ChecklistTemplate.guideItem");
    const [query, setQuery] = useState("");
    const [hits, setHits] = useState<GuideSearchHit[]>([]);

    useEffect(() => {
        if (query.trim().length < MIN_QUERY) {
            return;
        }

        let cancelled = false;
        const handle = setTimeout(async () => {
            const result = await searchGuideAction(null, query);

            if (!cancelled) {
                setHits(result.ok ? result.data.filter(hit => hit.itemKey) : []);
            }
        }, 300);

        return () => {
            cancelled = true;
            clearTimeout(handle);
        };
    }, [query]);

    return (
        <div className="space-y-2">
            <span className="text-sm font-medium">{t("label")}</span>
            {value ? (
                <div className="flex items-center gap-2 rounded-md border p-2 text-sm">
                    <span className="flex-1">{label ?? value}</span>
                    <Button type="button" size="icon" variant="ghost" aria-label={t("clear")}
                            onClick={() => onChange(null, null)}><X/></Button>
                </div>
            ) : (
                <>
                    <Input type="search" aria-label={t("search")} placeholder={t("search")} value={query}
                           onChange={event => setQuery(event.target.value)}/>
                    {query.trim().length >= MIN_QUERY && hits.length > 0 && (
                        <ul className="max-h-48 divide-y overflow-y-auto rounded-md border" aria-label={t("results")}>
                            {hits.map(hit => (
                                <li key={hit.itemKey}>
                                    <button type="button"
                                            className="flex w-full items-start gap-2 p-2 text-left text-sm hover:bg-accent"
                                            onClick={() => {
                                                onChange(hit.itemKey ?? null, hit.snippet);
                                                setQuery("");
                                            }}>
                                        {hit.itemType && <GuideTypeBadge type={hit.itemType}/>}
                                        <span>{hit.snippet}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </div>
    );
}
