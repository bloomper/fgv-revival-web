"use client";

import {useMemo, useState} from "react";
import Link from "next/link";
import {useTranslations} from "next-intl";
import {Plus, X} from "lucide-react";
import {Button, buttonVariants} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {DataEmpty} from "@/components/data-empty";
import {DataFilter} from "@/components/data-filter";
import {DataTable, type DataTableColumnDef, SortableHeader} from "@/components/data-table.client";
import {type AudienceValue, MailingStatusBadge, useAudienceText} from "@/components/mailing/mailing-labels";
import type {MailingStatus} from "@/gql/graphql";
import {formatInstant} from "@/utils/format";

export type MailingRow = {
    id: string;
    subject: string;
    audience: AudienceValue;
    status: MailingStatus;
    createdAt: string;
    sentAt?: string | null;
    recipients: { status: string }[];
};

const STATUSES: MailingStatus[] = ["DRAFT", "SENT", "CANCELLED"];

/** Every word in the subject or the audience, and one of the chosen statuses. */
export function filterMailings(rows: MailingRow[], query: string, statuses: Set<string>, audienceText: (audience: AudienceValue) => string): MailingRow[] {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);

    return rows.filter(row => {
        const text = `${row.subject} ${audienceText(row.audience)}`.toLowerCase();

        return words.every(word => text.includes(word)) && (statuses.size === 0 || statuses.has(row.status));
    });
}

/**
 * The revival's mailings (M6b), newest first: subject, audience, status, when it was sent and to how many. A row opens
 * the mailing; drafts are edited and sent there.
 */
export function MailingTable({revivalId, mailings, canDraft}: {
    revivalId: string;
    mailings: MailingRow[];
    canDraft: boolean
}) {
    const t = useTranslations();
    const audienceText = useAudienceText();
    const [query, setQuery] = useState("");
    const [statuses, setStatuses] = useState<Set<string>>(new Set());
    const filtered = useMemo(() => filterMailings(mailings, query, statuses, audienceText), [mailings, query, statuses, audienceText]);
    const active = query.trim() !== "" || statuses.size > 0;
    const columns: DataTableColumnDef<MailingRow>[] = [
        {
            id: "subject",
            accessorFn: row => row.subject,
            sortFn: "alphanumeric",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()}
                                                  title={t("Mailings.subject")}/>,
            cell: ({row}) => (
                <Link href={`/revivals/${revivalId}/mailings/${row.original.id}`}
                      className="font-medium whitespace-normal underline-offset-2 hover:underline">
                    {row.original.subject}
                </Link>
            ),
        },
        {
            id: "audience",
            accessorFn: row => audienceText(row.audience),
            header: () => t("Mailings.audience"),
            cell: ({row}) => <span className="whitespace-normal">{audienceText(row.original.audience)}</span>,
            meta: {className: "hidden md:table-cell"},
        },
        {
            id: "status",
            accessorFn: row => STATUSES.indexOf(row.status),
            sortFn: "basic",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()}
                                                  title={t("Mailings.status")}/>,
            cell: ({row}) => <MailingStatusBadge status={row.original.status}/>,
        },
        {
            id: "sentAt",
            accessorFn: row => row.sentAt ?? row.createdAt,
            sortFn: "alphanumeric",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()}
                                                  title={t("Mailings.sentAt")}/>,
            cell: ({row}) => <span className="tabular-nums">{formatInstant(row.original.sentAt) ?? "—"}</span>,
            meta: {className: "hidden sm:table-cell"},
        },
        {
            id: "recipients",
            accessorFn: row => row.recipients.length,
            sortFn: "basic",
            header: () => t("Mailings.recipientCount"),
            cell: ({row}) => <span
                className="tabular-nums">{row.original.status === "SENT" ? row.original.recipients.length : "—"}</span>,
            meta: {className: "text-right"},
        },
    ];

    return (
        <DataTable columns={columns} data={filtered} filtered={active} initialSorting={[{id: "sentAt", desc: true}]}
                   empty={<DataEmpty title={t("Mailings.empty")}
                                     description={canDraft ? t("Mailings.emptyHint") : undefined}/>}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative w-full sm:w-75">
                        <Input placeholder={t("Mailings.filterPlaceholder")} value={query}
                               onChange={change => setQuery(change.target.value)}
                               aria-label={t("Common.search")} className="h-8 pr-8"/>
                        {query && (
                            <Button variant="ghost" size="icon"
                                    className="absolute top-0 right-0 h-8 w-8 hover:bg-transparent"
                                    aria-label={t("Common.clearSearch")} onClick={() => setQuery("")}>
                                <X className="h-3 w-3"/>
                            </Button>
                        )}
                    </div>
                    <DataFilter title={t("Mailings.status")}
                                options={STATUSES.map((status, index) => ({
                                    label: t(`Mailings.statuses.${status}`),
                                    value: status,
                                    sortKey: String(index)
                                }))}
                                selectedValues={statuses} onSelect={setStatuses}
                                onClear={() => setStatuses(new Set())}/>
                    {active && (
                        <Button variant="ghost" onClick={() => {
                            setQuery("");
                            setStatuses(new Set());
                        }} className="h-8 px-2 lg:px-3">
                            <X className="mr-2 h-4 w-4"/>
                            {t("Common.reset")}
                        </Button>
                    )}
                </div>
                {canDraft && (
                    <Link href={`/revivals/${revivalId}/mailings/new`}
                          className={buttonVariants()}><Plus/>{t("Mailings.create")}</Link>
                )}
            </div>
        </DataTable>
    );
}
