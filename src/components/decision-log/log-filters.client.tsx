"use client";

import * as React from "react";
import {useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {Search} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {LOG_ENTRY_TYPES, logFilterQuery, type LogFilterValues} from "@/lib/decision-log/schema";

function Toggle({pressed, onClick, children}: { pressed: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <Button type="button" size="sm" variant={pressed ? "default" : "outline"} aria-pressed={pressed} onClick={onClick}>
            {children}
        </Button>
    );
}

function toggled<T>(values: T[] | undefined, value: T): T[] | undefined {
    const next = values?.includes(value) ? values.filter(entry => entry !== value) : [...(values ?? []), value];

    return next.length > 0 ? next : undefined;
}

/**
 * The log's filters: mine, open, overdue, type, meeting, tag and text, in any combination (M3 FR-012). They live in the
 * URL, so a filtered view can be reloaded and shared.
 */
export function LogFilters({filter, tags, meetings}: {
    filter: LogFilterValues;
    tags: string[];
    meetings: { id: string; date: string; title?: string | null }[];
}) {
    const t = useTranslations("Log");
    const router = useRouter();
    const pathname = usePathname();
    const [text, setText] = useState(filter.text ?? "");

    const apply = (next: LogFilterValues) => {
        const query = logFilterQuery(next);

        router.push(query ? `${pathname}?${query}` : pathname);
    };

    return (
        <div className="flex flex-col gap-3" role="group" aria-label={t("filters")}>
            <div className="flex flex-wrap gap-2">
                <Toggle pressed={!!filter.mine} onClick={() => apply({...filter, mine: !filter.mine || undefined})}>{t("filter.mine")}</Toggle>
                <Toggle pressed={!!filter.open} onClick={() => apply({...filter, open: !filter.open || undefined})}>{t("filter.open")}</Toggle>
                <Toggle pressed={!!filter.overdue} onClick={() => apply({...filter, overdue: !filter.overdue || undefined})}>{t("filter.overdue")}</Toggle>
                {LOG_ENTRY_TYPES.map(type => (
                    <Toggle key={type} pressed={!!filter.types?.includes(type)}
                            onClick={() => apply({...filter, types: toggled(filter.types, type)})}>
                        {t(`type.${type}`)}
                    </Toggle>
                ))}
            </div>
            {tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">{t("tags")}:</span>
                    {tags.map(tag => (
                        <Toggle key={tag} pressed={!!filter.tags?.includes(tag)} onClick={() => apply({...filter, tags: toggled(filter.tags, tag)})}>
                            {tag}
                        </Toggle>
                    ))}
                </div>
            )}
            {meetings.length > 0 && (
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    {t("filter.meeting")}:
                    <select className="h-8 rounded-md border border-input bg-background px-2 text-foreground" value={filter.meetingId ?? ""}
                            onChange={event => apply({...filter, meetingId: event.target.value || undefined})}>
                        <option value="">{t("filter.allMeetings")}</option>
                        {meetings.map(meeting => (
                            <option key={meeting.id} value={meeting.id}>{meeting.title ? `${meeting.date} ${meeting.title}` : meeting.date}</option>
                        ))}
                    </select>
                </label>
            )}
            <form className="flex max-w-md gap-2" onSubmit={(event) => {
                event.preventDefault();
                apply({...filter, text: text.trim() || undefined});
            }}>
                <Input value={text} onChange={event => setText(event.target.value)} placeholder={t("searchPlaceholder")} aria-label={t("search")}/>
                <Button type="submit" variant="outline" size="icon" aria-label={t("search")}><Search/></Button>
            </form>
        </div>
    );
}
