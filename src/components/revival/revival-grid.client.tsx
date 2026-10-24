"use client";

import {useTranslations} from "next-intl";
import type {RevivalRole, RevivalSummaryFragment} from "@/gql/graphql";
import {RevivalCard} from "@/components/revival/revival-card.client";
import {RevivalFilterBar, useRevivalFilter} from "@/components/revival/revival-filter.client";
import {DataEmpty} from "@/components/data-empty";

/**
 * The user's revivals as cards under a heading and filters, as on Spexregister's card pages.
 */
export function RevivalGrid({title, revivals, roles}: {
    title: string;
    revivals: RevivalSummaryFragment[];
    roles: Record<string, RevivalRole>
}) {
    const t = useTranslations("Common");
    const filter = useRevivalFilter(revivals);

    return (
        <div className="grid auto-rows-min gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="col-span-full mb-2 flex flex-col gap-4 border-b pb-6">
                <h2 className="text-lg font-bold tracking-tight">{title}</h2>
                <RevivalFilterBar filter={filter}/>
            </div>
            {filter.filtered.length === 0
                ? <DataEmpty title={t("noFilterMatchHeading")} description={t("noFilterMatchDescription")}/>
                : filter.filtered.map(revival => <RevivalCard key={revival.id} revival={revival}
                                                              role={roles[revival.id] ?? null}/>)}
        </div>
    );
}
