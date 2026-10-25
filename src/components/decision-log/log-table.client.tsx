"use client";

import * as React from "react";
import {useState, useTransition} from "react";
import Link from "next/link";
import {useTranslations} from "next-intl";
import {Check, CircleDashed, History, MessageSquareReply, MoreHorizontal, Pencil, Plus, RotateCcw, X} from "lucide-react";
import type {SortingState} from "@tanstack/react-table";
import type {LogEntryFieldsFragment, LogEntryStatus} from "@/gql/graphql";
import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {DataTable, type DataTableColumnDef, SortableHeader} from "@/components/data-table.client";
import {DataEmpty} from "@/components/data-empty";
import {HistoryDialog} from "@/components/history/history-dialog.client";
import {OwnerLabel} from "@/components/owner/owner-label";
import type {OwnerMember} from "@/components/owner/owner-field.client";
import {PlainText} from "@/components/plain-text";
import {LogAnswerDialog} from "@/components/decision-log/log-answer-dialog.client";
import {LogEntryDialog} from "@/components/decision-log/log-entry-dialog.client";
import {LogStatusBadge} from "@/components/decision-log/log-status-badge";
import {LogTypeBadge} from "@/components/decision-log/log-type-badge";
import {OverdueBadge} from "@/components/decision-log/overdue-badge";
import {updateLogEntryAction} from "@/app/(app)/revivals/[id]/log/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {LOG_ENTRY_STATUSES, LOG_ENTRY_TYPES} from "@/lib/decision-log/schema";
import {formatDate} from "@/utils/format";

type Entry = LogEntryFieldsFragment;

const STATUS_ICONS: Record<LogEntryStatus, React.ComponentType> = {
    OPEN: RotateCcw,
    WAITING: CircleDashed,
    DONE: Check,
    CANCELLED: X
};

function closed(entry: Entry) {
    return entry.status === "DONE" || entry.status === "CANCELLED";
}

function answerable(entry: Entry) {
    return entry.type === "QUESTION" && (entry.status === "OPEN" || entry.status === "WAITING") && !entry.answeredBy;
}

function Links({entry, revivalId}: { entry: Entry; revivalId: string }) {
    const t = useTranslations("Log");

    return (
        <>
            {entry.answers && <span
                className="text-xs text-muted-foreground">{t("answersRow", {number: entry.answers.number})}</span>}
            {entry.answeredBy && <span
                className="text-xs text-muted-foreground">{t("answeredByRow", {number: entry.answeredBy.number})}</span>}
            {entry.meeting && (
                <Link href={`/revivals/${revivalId}/log?meeting=${entry.meeting.id}`}
                      className="text-xs text-muted-foreground hover:underline"
                      onClick={event => event.stopPropagation()}>
                    {t("fromMeeting", {date: formatDate(entry.meeting.date) ?? entry.meeting.date})}
                </Link>
            )}
        </>
    );
}

/**
 * A row's menu: edit, answer a question, and set another status, for those who write; its history for every reader.
 * Status changes are sent with the version shown.
 */
function RowActions({entry, revivalId, meetingId, canWrite, onEdit, onAnswer, onHistory}: {
    entry: Entry;
    revivalId: string;
    meetingId?: string | null;
    canWrite: boolean;
    onEdit: (entry: Entry) => void;
    onAnswer: (entry: Entry) => void;
    onHistory: (entry: Entry) => void;
}) {
    const t = useTranslations("Log");
    const tHistory = useTranslations("History");
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();

    const setStatus = (status: LogEntryStatus) => startTransition(async () => {
        feedback(await updateLogEntryAction({
                id: entry.id,
                version: entry.version,
                revivalId,
                meetingId,
                values: {status}
            }),
            t("statusChanged", {number: entry.number}));
    });

    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" disabled={pending}
                                                 aria-label={t("rowMenu", {number: entry.number})}/>}>
                <MoreHorizontal className="h-4 w-4"/>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {canWrite && (
                    <DropdownMenuItem onClick={() => onEdit(entry)}><Pencil/>{t("editRow", {number: entry.number})}
                    </DropdownMenuItem>
                )}
                {canWrite && answerable(entry) && (
                    <DropdownMenuItem
                        onClick={() => onAnswer(entry)}><MessageSquareReply/>{t("answerRow", {number: entry.number})}
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onHistory(entry)}><History/>{tHistory("menu")}</DropdownMenuItem>
                {canWrite && (
                    <>
                        <DropdownMenuSeparator/>
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>{t("setStatus")}</DropdownMenuLabel>
                            {LOG_ENTRY_STATUSES.filter(status => status !== entry.status).map(status => {
                                const Icon = STATUS_ICONS[status];

                                return <DropdownMenuItem key={status}
                                                         onClick={() => setStatus(status)}><Icon/>{t(`status.${status}`)}
                                </DropdownMenuItem>;
                            })}
                        </DropdownMenuGroup>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function useColumns({revivalId, canWrite, meetingId, onEdit, onAnswer, onHistory}: {
    revivalId: string;
    canWrite: boolean;
    meetingId?: string | null;
    onEdit: (entry: Entry) => void;
    onAnswer: (entry: Entry) => void;
    onHistory: (entry: Entry) => void;
}): DataTableColumnDef<Entry>[] {
    const t = useTranslations("Log");

    const columns: DataTableColumnDef<Entry>[] = [
        {
            id: "number",
            accessorFn: entry => entry.number,
            sortFn: "basic",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("number")}/>,
            cell: ({row}) => <span className="font-medium">{row.original.number}</span>,
            meta: {className: "w-16"},
        },
        {
            id: "date",
            accessorFn: entry => entry.date,
            sortFn: "alphanumeric",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("date")}/>,
            cell: ({row}) => <span className="whitespace-nowrap">{formatDate(row.original.date)}</span>,
            meta: {className: "hidden md:table-cell"},
        },
        {
            id: "type",
            accessorFn: entry => LOG_ENTRY_TYPES.indexOf(entry.type),
            sortFn: "basic",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()}
                                                  title={t("typeLabel")}/>,
            cell: ({row}) => <LogTypeBadge type={row.original.type}/>,
            meta: {className: "hidden sm:table-cell"},
        },
        {
            id: "text",
            header: () => t("text"),
            cell: ({row}) => {
                const entry = row.original;

                return (
                    <div className="flex min-w-60 flex-col gap-1 whitespace-normal">
                        <PlainText text={entry.text}/>
                        {entry.comment && <PlainText className="text-xs text-muted-foreground" text={entry.comment}/>}
                        {entry.tags.length > 0 &&
                            <span className="text-xs text-muted-foreground">{entry.tags.join(", ")}</span>}
                        <Links entry={entry} revivalId={revivalId}/>
                        {/* What the hidden columns show, on narrow screens */}
                        <div
                            className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground md:hidden">
                            <span className="sm:hidden"><LogTypeBadge type={entry.type}/></span>
                            <span>{t("owner")}: <OwnerLabel owner={entry.owner}/></span>
                            {entry.deadline && <span>{t("deadline")}: {formatDate(entry.deadline)}</span>}
                        </div>
                    </div>
                );
            },
            meta: {className: "w-2/5"},
        },
        {
            id: "owner",
            accessorFn: entry => entry.owner?.person?.displayName ?? entry.owner?.name ?? undefined,
            sortFn: "alphanumeric",
            sortUndefined: "last",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("owner")}/>,
            cell: ({row}) => <OwnerLabel owner={row.original.owner}/>,
            meta: {className: "hidden md:table-cell"},
        },
        {
            id: "deadline",
            accessorFn: entry => entry.deadline ?? undefined,
            sortFn: "alphanumeric",
            sortUndefined: "last",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("deadline")}/>,
            cell: ({row}) => (
                <div className="flex flex-col items-start gap-1 whitespace-nowrap">
                    {formatDate(row.original.deadline) ?? "—"}
                    {row.original.overdue && <OverdueBadge/>}
                </div>
            ),
            meta: {className: "hidden md:table-cell"},
        },
        {
            id: "statusValue",
            accessorFn: entry => LOG_ENTRY_STATUSES.indexOf(entry.status),
            sortFn: "basic",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()}
                                                  title={t("statusLabel")}/>,
            cell: ({row}) => (
                <div className="flex flex-col items-start gap-1">
                    <LogStatusBadge status={row.original.status}/>
                    {row.original.overdue && <span className="md:hidden"><OverdueBadge/></span>}
                </div>
            ),
        },
    ];

    columns.push({
        id: "actions",
        header: () => <span className="sr-only">{t("actions")}</span>,
        cell: ({row}) => <RowActions entry={row.original} revivalId={revivalId} meetingId={meetingId} canWrite={canWrite}
                                     onEdit={onEdit} onAnswer={onAnswer} onHistory={onHistory}/>,
        meta: {className: "w-12 text-right"},
    });
    return columns;
}

/**
 * The decision log as the other tables are: sortable columns, pages, a toolbar and a menu per row. A closed row is
 * greyed, as in the Excel log, and clicking a row edits it. There is no delete. The page filters the rows;
 * its filters go in {@code toolbar} and other buttons in {@code actions}.
 */
export function LogTable({
                             revivalId,
                             entries,
                             members,
                             tags,
                             canWrite,
                             meetingId,
                             emptyMessage,
                             editingId,
                             onEditingIdChange,
                             toolbar,
                             actions,
                             filtered = false,
                             initialSorting = [{id: "number", desc: false}],
                         }: {
    revivalId: string;
    entries: Entry[];
    members: OwnerMember[];
    tags: string[];
    canWrite: boolean;
    meetingId?: string | null;
    emptyMessage?: string;
    editingId?: string | null;
    onEditingIdChange?: (id: string | null) => void;
    toolbar?: React.ReactNode;
    actions?: React.ReactNode;
    filtered?: boolean;
    initialSorting?: SortingState;
}) {
    const t = useTranslations("Log");
    const [ownEditing, setOwnEditing] = useState<Entry | null>(null);
    const editing = onEditingIdChange ? entries.find(entry => entry.id === editingId) ?? null : ownEditing;
    const setEditing = (entry: Entry | null) => onEditingIdChange ? onEditingIdChange(entry?.id ?? null) : setOwnEditing(entry);
    const [adding, setAdding] = useState(false);
    const [answering, setAnswering] = useState<Entry | null>(null);
    const [history, setHistory] = useState<Entry | null>(null);
    const columns = useColumns({revivalId, canWrite, meetingId, onEdit: setEditing, onAnswer: setAnswering, onHistory: setHistory});

    return (
        <>
            <DataTable columns={columns} data={entries} filtered={filtered} initialSorting={initialSorting}
                       onRowClick={canWrite ? setEditing : undefined}
                       rowClassName={entry => closed(entry) && "text-muted-foreground"}
                       empty={<DataEmpty title={emptyMessage ?? t("empty")}
                                         description={canWrite ? t("emptyHint") : t("emptyReadOnly")}/>}>
                {(toolbar || actions || canWrite) && (
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>{toolbar}</div>
                        <div className="flex flex-wrap items-center gap-2">
                            {actions}
                            {canWrite && <Button onClick={() => setAdding(true)}><Plus/>{t("add")}</Button>}
                        </div>
                    </div>
                )}
            </DataTable>
            {(adding || editing) && (
                <LogEntryDialog revivalId={revivalId} entry={editing} members={members} tags={tags}
                                meetingId={meetingId} open
                                onOpenChange={(open) => {
                                    if (!open) {
                                        setAdding(false);
                                        setEditing(null);
                                    }
                                }}/>
            )}
            {answering && (
                <LogAnswerDialog revivalId={revivalId} question={answering} members={members} meetingId={meetingId} open
                                 onOpenChange={(open) => !open && setAnswering(null)}/>
            )}
            {history && (
                <HistoryDialog key={history.id} target={{type: "LOG_ENTRY", id: history.id, title: t("rowTitle", {number: history.number})}}
                               onOpenChange={open => !open && setHistory(null)}/>
            )}
        </>
    );
}
