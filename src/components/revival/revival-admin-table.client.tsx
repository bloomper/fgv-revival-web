"use client";

import * as React from "react";
import {useRouter} from "next/navigation";
import {useLocale, useTranslations} from "next-intl";
import type {RevivalSummaryFragment} from "@/gql/graphql";
import {DataTable, type DataTableColumnDef, SortableHeader} from "@/components/data-table.client";
import {StatusBadge} from "@/components/revival/status-badge";
import {SpexTitle} from "@/components/revival/spex-title";
import {REVIVAL_STATUSES, RevivalFilterBar, useRevivalFilter} from "@/components/revival/revival-filter.client";
import {formatDate} from "@/utils/format";

function useColumns(): DataTableColumnDef<RevivalSummaryFragment>[] {
    const t = useTranslations();
    const locale = useLocale();

    return [
        {
            id: "workingTitle",
            accessorFn: revival => revival.workingTitle,
            sortFn: "alphanumeric",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("Revival.workingTitle")}/>,
            cell: ({row}) => <span className="font-medium">{row.original.workingTitle}</span>,
        },
        {
            id: "spex",
            accessorFn: revival => revival.spex.title ?? undefined,
            sortFn: "alphanumeric",
            sortUndefined: "last",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("Revival.spex")}/>,
            cell: ({row}) => (
                <>
                    <SpexTitle spex={row.original.spex}/>
                    {row.original.spex.year && <span className="text-muted-foreground"> ({row.original.spex.year})</span>}
                </>
            ),
            meta: {className: "hidden md:table-cell"},
        },
        {
            id: "year",
            accessorFn: revival => revival.year,
            sortFn: "basic",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("Revival.year")}/>,
        },
        {
            id: "status",
            accessorFn: revival => REVIVAL_STATUSES.indexOf(revival.status),
            sortFn: "basic",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("Revival.status")}/>,
            cell: ({row}) => <StatusBadge status={row.original.status}/>,
        },
        {
            id: "premiereDate",
            accessorFn: revival => revival.premiereDate ?? undefined,
            sortFn: "basic",
            sortUndefined: "last",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("Revival.premiereDate")}/>,
            cell: ({row}) => formatDate(row.original.premiereDate, locale) ?? "–",
        },
        {
            id: "directeurs",
            header: () => t("Revival.directeurs"),
            cell: ({row}) => {
                const directeurs = row.original.members.filter(member => member.role === "DIRECTEUR");

                return directeurs.length === 0 ? "–" : directeurs.map(member => (
                    <div key={member.id}>
                        {member.displayName ?? member.email ?? t("Members.waitingPerson")}
                        {member.state === "WAITING" && <span className="text-muted-foreground"> ({t("MemberState.WAITING")})</span>}
                    </div>
                ));
            },
            meta: {className: "hidden lg:table-cell"},
        },
    ];
}

/**
 * Every revival, filterable and sortable (FR-021, FR-022). A row opens the revival, where status and members are
 * managed.
 */
export function RevivalAdminTable({revivals, actions}: { revivals: RevivalSummaryFragment[]; actions?: React.ReactNode }) {
    const router = useRouter();
    const filter = useRevivalFilter(revivals);
    const columns = useColumns();

    return (
        <DataTable columns={columns} data={filter.filtered} filtered={filter.active} initialSorting={[{id: "premiereDate", desc: true}]}
                   onRowClick={revival => router.push(`/revivals/${revival.id}`)}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <RevivalFilterBar filter={filter}/>
                {actions}
            </div>
        </DataTable>
    );
}
