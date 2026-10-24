"use client";

import * as React from "react";
import {useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {DataFilter} from "@/components/data-filter";
import {isLogFiltered, LOG_ENTRY_TYPES, logFilterQuery, type LogFilterValues} from "@/lib/decision-log/schema";
import {formatDate} from "@/utils/format";

const QUICK = ["mine", "open", "overdue"] as const;

type Quick = (typeof QUICK)[number];

function listOrUndefined<T>(values: Set<T>): T[] | undefined {
    return values.size > 0 ? [...values] : undefined;
}

/**
 * The log's filters, as on the other list pages: a search field and a filter per kind — mine, open and overdue; type;
 * tag; meeting — in any combination (M3 FR-012). They live in the URL, so a filtered view can be reloaded and shared,
 * and the server does the filtering.
 */
export function LogFilters({filter, tags, meetings}: {
    filter: LogFilterValues;
    tags: string[];
    meetings: { id: string; date: string; title?: string | null }[];
}) {
    const t = useTranslations();
    const router = useRouter();
    const pathname = usePathname();
    const [text, setText] = useState(filter.text ?? "");

    const apply = (next: LogFilterValues) => {
        const query = logFilterQuery(next);

        router.push(query ? `${pathname}?${query}` : pathname);
    };
    const search = (value: string) => apply({...filter, text: value.trim() || undefined});
    const quick = new Set<Quick>(QUICK.filter(key => filter[key]));

    return (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t("Log.filters")}>
            <form className="relative w-full sm:w-75" onSubmit={(event) => {
                event.preventDefault();
                search(text);
            }}>
                <Input value={text} onChange={event => setText(event.target.value)}
                       onBlur={() => text.trim() !== (filter.text ?? "") && search(text)}
                       placeholder={t("Log.searchPlaceholder")} aria-label={t("Log.search")} className="h-8 pr-8"/>
                {text && (
                    <Button type="button" variant="ghost" size="icon"
                            className="absolute top-0 right-0 h-8 w-8 hover:bg-transparent"
                            aria-label={t("Common.clearSearch")} onClick={() => {
                        setText("");
                        search("");
                    }}>
                        <X className="h-3 w-3"/>
                    </Button>
                )}
            </form>
            <DataFilter title={t("Log.filter.show")}
                        options={QUICK.map((key, index) => ({
                            label: t(`Log.filter.${key}`),
                            value: key,
                            sortKey: String(index)
                        }))}
                        selectedValues={quick}
                        onSelect={values => apply({
                            ...filter, mine: values.has("mine") || undefined, open: values.has("open") || undefined,
                            overdue: values.has("overdue") || undefined
                        })}
                        onClear={() => apply({...filter, mine: undefined, open: undefined, overdue: undefined})}/>
            <DataFilter title={t("Log.typeLabel")}
                        options={LOG_ENTRY_TYPES.map((type, index) => ({
                            label: t(`Log.type.${type}`),
                            value: type,
                            sortKey: String(index)
                        }))}
                        selectedValues={new Set(filter.types)}
                        onSelect={values => apply({
                            ...filter,
                            types: listOrUndefined(values as Set<(typeof LOG_ENTRY_TYPES)[number]>)
                        })}
                        onClear={() => apply({...filter, types: undefined})}/>
            {tags.length > 0 && (
                <DataFilter title={t("Log.tags")} options={tags.map(tag => ({label: tag, value: tag}))}
                            selectedValues={new Set(filter.tags)}
                            onSelect={values => apply({...filter, tags: listOrUndefined(values)})}
                            onClear={() => apply({...filter, tags: undefined})}/>
            )}
            {meetings.length > 0 && (
                <DataFilter title={t("Log.filter.meeting")}
                            options={meetings.map(meeting => ({
                                label: [formatDate(meeting.date), meeting.title].filter(Boolean).join(" "),
                                value: meeting.id,
                                sortKey: meeting.date,
                            }))}
                            selectedValues={new Set(filter.meetingId ? [filter.meetingId] : [])}
                    // One meeting at a time: the one just ticked replaces the one before
                            onSelect={values => apply({
                                ...filter,
                                meetingId: [...values].find(id => id !== filter.meetingId)
                            })}
                            onClear={() => apply({...filter, meetingId: undefined})}/>
            )}
            {isLogFiltered(filter) && (
                <Button variant="ghost" onClick={() => {
                    setText("");
                    apply({});
                }} className="h-8 px-2 lg:px-3">
                    <X className="mr-2 h-4 w-4"/>
                    {t("Common.reset")}
                </Button>
            )}
        </div>
    );
}
