"use client";

import {useEffect, useState} from "react";
import {useLocale, useTranslations} from "next-intl";
import {Search} from "lucide-react";
import {Input} from "@/components/ui/input";
import {type GuideSearchHit, searchGuideAction} from "@/app/(app)/guide/actions.server";
import {GuideTypeBadge} from "@/components/guide/guide-type-badge";
import {pickText} from "@/components/guide/localized";

const MIN_QUERY = 2;

function anchorOf(hit: GuideSearchHit) {
    if (hit.itemKey) {
        return `#item-${hit.itemKey}`;
    }
    if (hit.sectionKey) {
        return `#section-${hit.sectionKey}`;
    }
    return hit.phase ? `#chapter-${hit.phase}` : "#";
}

/**
 * Searches the version shown (FR-021). Results link to the matching place on the page.
 */
export function GuideSearch({versionId}: { versionId: string }) {
    const t = useTranslations("Guide.search");
    const locale = useLocale();
    const [query, setQuery] = useState("");
    const [hits, setHits] = useState<GuideSearchHit[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (query.trim().length < MIN_QUERY) {
            return;
        }

        let cancelled = false;
        const handle = setTimeout(async () => {
            const result = await searchGuideAction(versionId, query);

            if (cancelled) {
                return;
            }
            if (result.ok) {
                setHits(result.data);
                setError(null);
            } else {
                setHits(null);
                setError(result.message);
            }
        }, 300);

        return () => {
            cancelled = true;
            clearTimeout(handle);
        };
    }, [query, versionId]);

    const active = query.trim().length >= MIN_QUERY;

    return (
        <div className="space-y-2">
            <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground"/>
                <Input
                    type="search"
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    placeholder={t("placeholder")}
                    aria-label={t("placeholder")}
                    className="pl-8"
                />
            </div>
            {active && error && <p className="text-sm text-destructive" role="alert">{error}</p>}
            {active && hits && (
                hits.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("noHits")}</p>
                ) : (
                    <ul className="max-h-80 divide-y overflow-y-auto rounded-md border" aria-label={t("results")}>
                        {hits.map((hit, index) => (
                            <li key={`${hit.itemKey ?? hit.sectionKey ?? hit.phase}-${index}`}>
                                <a href={anchorOf(hit)} className="block space-y-1 px-3 py-2 text-sm hover:bg-accent">
                                    <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                        {hit.phase && <span>{hit.phase}. {hit.chapterTitle ? pickText(hit.chapterTitle, locale).text : ""}</span>}
                                        {hit.sectionTitle && <span>› {pickText(hit.sectionTitle, locale).text}</span>}
                                        {hit.itemType && hit.itemType !== "TEXT" && <GuideTypeBadge type={hit.itemType}/>}
                                    </span>
                                    <span className="block">{hit.snippet}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                )
            )}
        </div>
    );
}
