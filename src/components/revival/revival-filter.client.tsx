"use client";

import {useMemo, useState} from "react";
import {useTranslations} from "next-intl";
import {X} from "lucide-react";
import type {RevivalStatus, RevivalSummaryFragment} from "@/gql/graphql";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {DataFilter} from "@/components/data-filter";

export const REVIVAL_STATUSES: RevivalStatus[] = ["PROPOSED", "APPROVED", "REJECTED", "ORGANISING", "OPEN", "CLOSING", "SETTLING", "ARCHIVED"];

/**
 * Every word must appear in the title, the spex title, the year or the original year.
 */
export function filterRevivals(revivals: RevivalSummaryFragment[], query: string, statuses: Set<RevivalStatus>): RevivalSummaryFragment[] {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);

    return revivals.filter(revival => {
        const text = [revival.title, revival.spex.title, revival.year, revival.spex.year].filter(Boolean).join(" ").toLowerCase();

        return statuses.has(revival.status) && words.every(word => text.includes(word));
    });
}

export function useRevivalFilter(revivals: RevivalSummaryFragment[]) {
    const [query, setQuery] = useState("");
    const [statuses, setStatuses] = useState<Set<RevivalStatus>>(new Set(REVIVAL_STATUSES));
    const filtered = useMemo(() => filterRevivals(revivals, query, statuses), [revivals, query, statuses]);
    const active = query.trim() !== "" || statuses.size < REVIVAL_STATUSES.length;

    return {
        query,
        setQuery,
        statuses,
        setStatuses,
        filtered,
        active,
        reset: () => {
            setQuery("");
            setStatuses(new Set(REVIVAL_STATUSES));
        },
    };
}

/**
 * A search field and a status filter, as on Spexregister's list pages.
 */
export function RevivalFilterBar({filter}: { filter: ReturnType<typeof useRevivalFilter> }) {
    const t = useTranslations();

    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-75">
                <Input placeholder={t("Revival.filterPlaceholder")} value={filter.query} onChange={event => filter.setQuery(event.target.value)}
                       aria-label={t("Common.search")} className="h-8 pr-8"/>
                {filter.query && (
                    <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-8 w-8 hover:bg-transparent"
                            aria-label={t("Common.clearSearch")} onClick={() => filter.setQuery("")}>
                        <X className="h-3 w-3"/>
                    </Button>
                )}
            </div>
            <DataFilter title={t("Revival.status")}
                        options={REVIVAL_STATUSES.map((status, index) => ({label: t(`Status.${status}`), value: status, sortKey: String(index)}))}
                        selectedValues={filter.statuses}
                        onSelect={values => filter.setStatuses(values as Set<RevivalStatus>)}
                        onClear={() => filter.setStatuses(new Set(REVIVAL_STATUSES))}/>
            {filter.active && (
                <Button variant="ghost" onClick={filter.reset} className="h-8 px-2 lg:px-3">
                    <X className="mr-2 h-4 w-4"/>
                    {t("Common.reset")}
                </Button>
            )}
        </div>
    );
}
