"use client";

import * as React from "react";
import {useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {X} from "lucide-react";
import type {MeetingStatus} from "@/gql/graphql";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {DataEmpty} from "@/components/data-empty";
import {DataFilter} from "@/components/data-filter";
import {DataTable, type DataTableColumnDef, SortableHeader} from "@/components/data-table.client";
import {MeetingStatusBadge} from "@/components/meeting/meeting-mode.client";
import {formatDate} from "@/utils/format";

export const MEETING_STATUSES: MeetingStatus[] = ["PLANNED", "IN_PROGRESS", "CLOSED", "CANCELLED"];

export type MeetingRow = {
    id: string;
    date: string;
    title?: string | null;
    status: MeetingStatus;
};

/**
 * Every word must appear in the title or the date.
 */
export function filterMeetings(meetings: MeetingRow[], query: string, statuses: Set<MeetingStatus>, untitled: string): MeetingRow[] {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);

    return meetings.filter(meeting => {
        const text = `${meeting.title ?? untitled} ${meeting.date}`.toLowerCase();

        return statuses.has(meeting.status) && words.every(word => text.includes(word));
    });
}

/**
 * A revival's meetings as the other tables are: search, a status filter, sortable columns and pages, newest first. A
 * row opens the meeting.
 */
export function MeetingTable({revivalId, meetings, actions}: { revivalId: string; meetings: MeetingRow[]; actions?: React.ReactNode }) {
    const t = useTranslations();
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [statuses, setStatuses] = useState<Set<MeetingStatus>>(new Set(MEETING_STATUSES));
    const untitled = t("Meeting.untitled");
    const filtered = useMemo(() => filterMeetings(meetings, query, statuses, untitled), [meetings, query, statuses, untitled]);
    const active = query.trim() !== "" || statuses.size < MEETING_STATUSES.length;

    const columns: DataTableColumnDef<MeetingRow>[] = [
        {
            id: "date",
            accessorFn: meeting => meeting.date,
            sortFn: "alphanumeric",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("Meeting.date")}/>,
            cell: ({row}) => <span className="whitespace-nowrap font-medium">{formatDate(row.original.date)}</span>,
            meta: {className: "w-32"},
        },
        {
            id: "title",
            accessorFn: meeting => meeting.title ?? untitled,
            sortFn: "alphanumeric",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("Meeting.titleLabel")}/>,
        },
        {
            id: "status",
            accessorFn: meeting => MEETING_STATUSES.indexOf(meeting.status),
            sortFn: "basic",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("Meeting.statusLabel")}/>,
            cell: ({row}) => <MeetingStatusBadge status={row.original.status}/>,
        },
    ];

    return (
        <DataTable columns={columns} data={filtered} filtered={active} initialSorting={[{id: "date", desc: true}]}
                   onRowClick={meeting => router.push(`/revivals/${revivalId}/meetings/${meeting.id}`)}
                   empty={<DataEmpty title={t("Meeting.empty")} description={t("Meeting.emptyHint")}/>}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative w-full sm:w-75">
                        <Input placeholder={t("Meeting.filterPlaceholder")} value={query} onChange={event => setQuery(event.target.value)}
                               aria-label={t("Common.search")} className="h-8 pr-8"/>
                        {query && (
                            <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-8 w-8 hover:bg-transparent"
                                    aria-label={t("Common.clearSearch")} onClick={() => setQuery("")}>
                                <X className="h-3 w-3"/>
                            </Button>
                        )}
                    </div>
                    <DataFilter title={t("Meeting.statusLabel")}
                                options={MEETING_STATUSES.map((status, index) => ({label: t(`Meeting.status.${status}`), value: status, sortKey: String(index)}))}
                                selectedValues={statuses}
                                onSelect={values => setStatuses(values as Set<MeetingStatus>)}
                                onClear={() => setStatuses(new Set(MEETING_STATUSES))}/>
                    {active && (
                        <Button variant="ghost" onClick={() => {
                            setQuery("");
                            setStatuses(new Set(MEETING_STATUSES));
                        }} className="h-8 px-2 lg:px-3">
                            <X className="mr-2 h-4 w-4"/>
                            {t("Common.reset")}
                        </Button>
                    )}
                </div>
                {actions}
            </div>
        </DataTable>
    );
}
