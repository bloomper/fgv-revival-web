"use client";

import {useMemo, useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {History, MoreHorizontal, Pencil, Plus, Trash2, X} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Input} from "@/components/ui/input";
import {DataEmpty} from "@/components/data-empty";
import {DataFilter} from "@/components/data-filter";
import {DataTable, type DataTableColumnDef, SortableHeader} from "@/components/data-table.client";
import {HistoryDialog} from "@/components/history/history-dialog.client";
import {NewsDialog} from "@/components/news/news-dialog.client";
import {type NewsItem, type NewsState, newsState} from "@/components/news/news";
import {deleteNewsAction} from "@/app/(app)/admin/news/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {formatDate} from "@/utils/format";

const STATES: NewsState[] = ["PUBLISHED", "SCHEDULED", "DRAFT", "WITHDRAWN"];

type NewsRow = NewsItem & { state: NewsState };

export function NewsStateBadge({state}: { state: NewsState }) {
    const t = useTranslations("News");

    return <Badge variant={state === "PUBLISHED" ? "default" : "outline"}>{t(`states.${state}`)}</Badge>;
}

/**
 * Every word must appear in the subject or the text; with states chosen, the piece must be in one of them.
 */
export function filterNews<T extends NewsItem & { state: NewsState }>(news: T[], query: string, states: Set<string>): T[] {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);

    return news.filter(piece => (states.size === 0 || states.has(piece.state))
        && words.every(word => `${piece.subject} ${piece.text}`.toLowerCase().includes(word)));
}

function RowActions({news, onEdit, onDelete, onHistory}: {
    news: NewsRow;
    onEdit: (news: NewsRow) => void;
    onDelete: (news: NewsRow) => void;
    onHistory: (news: NewsRow) => void;
}) {
    const t = useTranslations();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0"
                                                 aria-label={t("News.rowMenu", {subject: news.subject})}/>}>
                <MoreHorizontal className="h-4 w-4"/>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(news)}><Pencil/>{t("Common.edit")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onHistory(news)}><History/>{t("History.menu")}</DropdownMenuItem>
                <DropdownMenuSeparator/>
                <DropdownMenuItem variant="destructive" onClick={() => onDelete(news)}><Trash2/>{t("Common.delete")}</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function DeleteDialog({news, onOpenChange}: { news: NewsRow; onOpenChange: (open: boolean) => void }) {
    const t = useTranslations();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();

    return (
        <AlertDialog open onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("News.deleteTitle", {subject: news.subject})}</AlertDialogTitle>
                    <AlertDialogDescription>{t("News.deleteDescription")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t("Common.cancel")}</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" disabled={pending} onClick={() => startTransition(async () => {
                        if (feedback(await deleteNewsAction({id: news.id, version: news.version}), t("News.deleted"))) {
                            onOpenChange(false);
                        }
                    })}>{t("Common.delete")}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

/**
 * The super admin's news, drafts first as the server sorts them: search, a filter by state and a menu per row to edit,
 * read the history or delete. Clicking a row edits it.
 */
export function NewsTable({news}: { news: NewsItem[] }) {
    const t = useTranslations();
    const [query, setQuery] = useState("");
    const [states, setStates] = useState<Set<string>>(new Set());
    const [editing, setEditing] = useState<NewsRow | null>(null);
    const [adding, setAdding] = useState(false);
    const [deleting, setDeleting] = useState<NewsRow | null>(null);
    const [history, setHistory] = useState<NewsRow | null>(null);
    const rows = useMemo(() => news.map(piece => ({...piece, state: newsState(piece)})), [news]);
    const filtered = useMemo(() => filterNews(rows, query, states), [rows, query, states]);
    const active = query.trim() !== "" || states.size > 0;
    const columns: DataTableColumnDef<NewsRow>[] = [
        {
            id: "subject",
            accessorFn: piece => piece.subject,
            sortFn: "alphanumeric",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("News.subject")}/>,
            cell: ({row}) => (
                <div className="flex min-w-48 flex-col items-start gap-1 whitespace-normal">
                    <span className="font-medium">{row.original.subject}</span>
                    <span className="line-clamp-1 text-xs text-muted-foreground">{row.original.text}</span>
                </div>
            ),
        },
        {
            id: "state",
            accessorFn: piece => STATES.indexOf(piece.state),
            sortFn: "basic",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("News.state")}/>,
            cell: ({row}) => <NewsStateBadge state={row.original.state}/>,
        },
        {
            id: "visibleFrom",
            accessorFn: piece => piece.visibleFrom ?? undefined,
            sortFn: "alphanumeric",
            sortUndefined: "last",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("News.visibleFrom")}/>,
            cell: ({row}) => <span className="whitespace-nowrap tabular-nums">{formatDate(row.original.visibleFrom) ?? "—"}</span>,
            meta: {className: "hidden sm:table-cell"},
        },
        {
            id: "visibleTo",
            accessorFn: piece => piece.visibleTo ?? undefined,
            sortFn: "alphanumeric",
            sortUndefined: "last",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("News.visibleTo")}/>,
            cell: ({row}) => <span className="whitespace-nowrap tabular-nums">{formatDate(row.original.visibleTo) ?? "—"}</span>,
            meta: {className: "hidden md:table-cell"},
        },
        {
            id: "actions",
            header: () => <span className="sr-only">{t("News.actions")}</span>,
            cell: ({row}) => <RowActions news={row.original} onEdit={setEditing} onDelete={setDeleting} onHistory={setHistory}/>,
            meta: {className: "w-12 text-right"},
        },
    ];

    return (
        <>
            <DataTable columns={columns} data={filtered} filtered={active} onRowClick={setEditing}
                       empty={<DataEmpty title={t("News.empty")} description={t("News.emptyHint")}/>}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative w-full sm:w-75">
                            <Input placeholder={t("News.filterPlaceholder")} value={query}
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
                        <DataFilter title={t("News.state")}
                                    options={STATES.map(state => ({label: t(`News.states.${state}`), value: state}))}
                                    selectedValues={states} onSelect={setStates} onClear={() => setStates(new Set())}/>
                        {active && (
                            <Button variant="ghost" onClick={() => {
                                setQuery("");
                                setStates(new Set());
                            }} className="h-8 px-2 lg:px-3">
                                <X className="mr-2 h-4 w-4"/>
                                {t("Common.reset")}
                            </Button>
                        )}
                    </div>
                    <Button onClick={() => setAdding(true)}><Plus/>{t("News.create")}</Button>
                </div>
            </DataTable>
            {(adding || editing) && <NewsDialog key={editing?.id ?? "new"} news={editing} onOpenChange={open => {
                if (!open) {
                    setAdding(false);
                    setEditing(null);
                }
            }}/>}
            {deleting && <DeleteDialog news={deleting} onOpenChange={open => !open && setDeleting(null)}/>}
            {history && <HistoryDialog key={history.id} target={{type: "NEWS", id: history.id, title: history.subject}}
                                       onOpenChange={open => !open && setHistory(null)}/>}
        </>
    );
}
