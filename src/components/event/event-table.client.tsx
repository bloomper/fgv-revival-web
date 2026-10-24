"use client";

import * as React from "react";
import {useId, useMemo, useOptimistic, useState, useTransition} from "react";
import Link from "next/link";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useLocale, useTranslations} from "next-intl";
import {Ban, ClipboardCheck, MoreHorizontal, Pencil, Plus, RotateCcw, X} from "lucide-react";
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
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {DataEmpty} from "@/components/data-empty";
import {DataFilter} from "@/components/data-filter";
import {DataTable, type DataTableColumnDef, SortableHeader} from "@/components/data-table.client";
import {catalogName} from "@/components/catalog/catalog";
import {
    type EditableEvent,
    EventDialog,
    type EventPrefill,
    type EventTypeOption
} from "@/components/event/event-dialog.client";
import {CancelledBadge, PremiereDistanceLabel} from "@/components/event/event-labels";
import {type EventProposal, EventProposals} from "@/components/event/event-proposals.client";
import {formatEventDates} from "@/components/event/timeline";
import {cancelEventAction, restoreEventAction} from "@/app/(app)/revivals/[id]/events/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";

/** The filter value of events added without a type. */
export const NO_TYPE = "-";

export type EventRow = EditableEvent & {
    daysFromPremiere?: number | null;
    checklist?: { id: string; openCount: number; totalCount: number; cancelled: boolean } | null;
    cancelled: boolean;
};

/**
 * Every word must appear in the title, the type, the location or the dates; with types chosen, the event must have one
 * of them.
 */
export function filterEvents(events: EventRow[], query: string, types: Set<string>, locale: string): EventRow[] {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);

    return events.filter(event => {
        const type = event.type ? catalogName(event.type, locale) : "";
        const text = `${event.title} ${type} ${event.location ?? ""} ${event.startDate} ${event.endDate}`.toLowerCase();

        return (types.size === 0 || types.has(event.type?.id ?? NO_TYPE)) && words.every(word => text.includes(word));
    });
}

/**
 * Shows or hides cancelled events. The choice lives in the URL ({@code ?cancelled=1}) so the server fetches them; the
 * view stays as it is.
 */
function ShowCancelledSwitch({shown}: { shown: boolean }) {
    const t = useTranslations("Event");
    const id = useId();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [, startTransition] = useTransition();
    const [checked, setChecked] = useOptimistic(shown);

    return (
        <div className="flex items-center gap-2">
            <Switch id={id} checked={checked} onCheckedChange={next => startTransition(() => {
                const params = new URLSearchParams(searchParams);

                setChecked(next);
                if (next) {
                    params.set("cancelled", "1");
                } else {
                    params.delete("cancelled");
                }
                router.push(params.size ? `${pathname}?${params}` : pathname);
            })}/>
            <Label htmlFor={id}>{t("showCancelled")}</Label>
        </div>
    );
}

function RowActions({event, revivalId, onEdit, onCancel}: {
    event: EventRow;
    revivalId: string;
    onEdit: (event: EventRow) => void;
    onCancel: (event: EventRow) => void;
}) {
    const t = useTranslations("Event");
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" disabled={pending}
                                                 aria-label={t("rowMenu", {title: event.title})}/>}>
                <MoreHorizontal className="h-4 w-4"/>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {!event.cancelled &&
                    <DropdownMenuItem onClick={() => onEdit(event)}><Pencil/>{t("edit")}</DropdownMenuItem>}
                {event.checklist && (
                    <DropdownMenuItem render={<Link href={`/revivals/${revivalId}/checklists/${event.checklist.id}`}/>}>
                        <ClipboardCheck/>{t("openChecklist")}
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator/>
                {event.cancelled ? (
                    <DropdownMenuItem onClick={() => startTransition(async () => {
                        feedback(await restoreEventAction({
                            id: event.id,
                            version: event.version,
                            revivalId
                        }), t("restored"));
                    })}><RotateCcw/>{t("restore")}</DropdownMenuItem>
                ) : (
                    <DropdownMenuItem variant="destructive" onClick={() => onCancel(event)}><Ban/>{t("cancel")}
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function CancelDialog({event, revivalId, onOpenChange}: {
    event: EventRow;
    revivalId: string;
    onOpenChange: (open: boolean) => void
}) {
    const t = useTranslations();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();

    return (
        <AlertDialog open onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("Event.cancelTitle", {title: event.title})}</AlertDialogTitle>
                    <AlertDialogDescription>{event.checklist ? t("Event.cancelWithChecklist") : t("Event.cancelDescription")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t("Common.cancel")}</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" disabled={pending}
                                       onClick={() => startTransition(async () => {
                                           if (feedback(await cancelEventAction({
                                               id: event.id,
                                               version: event.version,
                                               revivalId
                                           }), t("Event.cancelled"))) {
                                               onOpenChange(false);
                                           }
                                       })}>
                        {t("Event.cancel")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function ChecklistLink({revivalId, checklist}: { revivalId: string; checklist: NonNullable<EventRow["checklist"]> }) {
    const t = useTranslations("Event");

    return (
        <Link href={`/revivals/${revivalId}/checklists/${checklist.id}`}
              className="whitespace-nowrap tabular-nums hover:underline"
              aria-label={t("checklistLink", {open: checklist.openCount, total: checklist.totalCount})}
              onClick={click => click.stopPropagation()}>
            <ClipboardCheck className="mr-1 inline size-4 align-text-bottom"/>
            {checklist.openCount}/{checklist.totalCount}
        </Link>
    );
}

function useColumns(revivalId: string, canWrite: boolean, onEdit: (event: EventRow) => void, onCancel: (event: EventRow) => void) {
    const t = useTranslations("Event");
    const locale = useLocale();

    const columns: DataTableColumnDef<EventRow>[] = [
        {
            id: "date",
            accessorFn: event => `${event.startDate} ${event.startTime ?? ""}`,
            sortFn: "alphanumeric",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("dates")}/>,
            cell: ({row}) => <span
                className="whitespace-nowrap font-medium tabular-nums">{formatEventDates(row.original)}</span>,
            meta: {className: "w-48"},
        },
        {
            id: "title",
            accessorFn: event => event.title,
            sortFn: "alphanumeric",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()}
                                                  title={t("titleLabel")}/>,
            cell: ({row}) => {
                const event = row.original;

                return (
                    <div className="flex min-w-40 flex-col items-start gap-1 whitespace-normal">
                        <span className="flex flex-wrap items-center gap-2">
                            {event.title}
                            {event.type && <Badge variant="secondary">{catalogName(event.type, locale)}</Badge>}
                            {event.cancelled && <CancelledBadge/>}
                        </span>
                        {/* What the hidden columns show, on narrow screens */}
                        <span className="flex flex-wrap gap-x-3 text-xs text-muted-foreground md:hidden">
                            {event.location && <span>{event.location}</span>}
                            <span className="sm:hidden"><PremiereDistanceLabel days={event.daysFromPremiere}/></span>
                            {event.checklist && <ChecklistLink revivalId={revivalId} checklist={event.checklist}/>}
                        </span>
                    </div>
                );
            },
        },
        {
            id: "location",
            accessorFn: event => event.location ?? undefined,
            sortFn: "alphanumeric",
            sortUndefined: "last",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("location")}/>,
            cell: ({row}) => row.original.location ?? "—",
            meta: {className: "hidden md:table-cell"},
        },
        {
            id: "premiere",
            accessorFn: event => event.daysFromPremiere ?? undefined,
            sortFn: "basic",
            sortUndefined: "last",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()}
                                                  title={t("toPremiere")}/>,
            cell: ({row}) => <PremiereDistanceLabel days={row.original.daysFromPremiere}/>,
            meta: {className: "hidden sm:table-cell"},
        },
        {
            id: "checklist",
            header: () => t("checklist"),
            cell: ({row}) => row.original.checklist ?
                <ChecklistLink revivalId={revivalId} checklist={row.original.checklist}/> : "—",
            meta: {className: "hidden md:table-cell"},
        },
    ];

    if (canWrite) {
        columns.push({
            id: "actions",
            header: () => <span className="sr-only">{t("actions")}</span>,
            cell: ({row}) => <RowActions event={row.original} revivalId={revivalId} onEdit={onEdit}
                                         onCancel={onCancel}/>,
            meta: {className: "w-12 text-right"},
        });
    }
    return columns;
}

/**
 * A revival's events as the other tables are: search, a filter by type, cancelled ones on request, and a menu per row
 * to edit, open the checklist, cancel or restore. Events are never deleted (M4-FR-3). Above the table, the proposals
 * from the premiere for those who may add events.
 */
export function EventTable({revivalId, events, types, proposals, canWrite, showCancelled, actions}: {
    revivalId: string;
    events: EventRow[];
    /** The active types, for new events. */
    types: EventTypeOption[];
    proposals: EventProposal[];
    canWrite: boolean;
    showCancelled: boolean;
    actions?: React.ReactNode;
}) {
    const t = useTranslations();
    const locale = useLocale();
    const [query, setQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set());
    const [editing, setEditing] = useState<EventRow | null>(null);
    const [adding, setAdding] = useState<{ prefill: EventPrefill | null } | null>(null);
    const [cancelling, setCancelling] = useState<EventRow | null>(null);
    const filtered = useMemo(() => filterEvents(events, query, typeFilter, locale), [events, query, typeFilter, locale]);
    const active = query.trim() !== "" || typeFilter.size > 0;
    const columns = useColumns(revivalId, canWrite, setEditing, setCancelling);
    const typeOptions = useMemo(() => {
        const held = new Map(events.filter(event => event.type).map(event => [event.type!.id, event.type!]));

        return [
            ...[...held.values()].map(type => ({label: catalogName(type, locale), value: type.id})),
            ...(events.some(event => !event.type) ? [{label: t("Event.otherType"), value: NO_TYPE, sortKey: "￿"}] : []),
        ];
    }, [events, locale, t]);

    return (
        <div className="flex flex-col gap-6">
            {canWrite && <EventProposals proposals={proposals} onAdd={proposal => setAdding({
                prefill: {typeId: proposal.type.id, startDate: proposal.startDate, endDate: proposal.endDate},
            })}/>}
            <DataTable columns={columns} data={filtered} filtered={active} initialSorting={[{id: "date", desc: false}]}
                       onRowClick={canWrite ? (event => !event.cancelled && setEditing(event)) : undefined}
                       rowClassName={event => event.cancelled && "text-muted-foreground"}
                       empty={<DataEmpty title={t("Event.empty")}
                                         description={canWrite ? t("Event.emptyHint") : t("Event.emptyReadOnly")}/>}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative w-full sm:w-75">
                            <Input placeholder={t("Event.filterPlaceholder")} value={query}
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
                        {typeOptions.length > 0 && (
                            <DataFilter title={t("Event.type")} options={typeOptions} selectedValues={typeFilter}
                                        onSelect={setTypeFilter} onClear={() => setTypeFilter(new Set())}/>
                        )}
                        {active && (
                            <Button variant="ghost" onClick={() => {
                                setQuery("");
                                setTypeFilter(new Set());
                            }} className="h-8 px-2 lg:px-3">
                                <X className="mr-2 h-4 w-4"/>
                                {t("Common.reset")}
                            </Button>
                        )}
                        <ShowCancelledSwitch shown={showCancelled}/>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {/* A lone child: an element from the server page can arrive lazy, and React then asks for a key. */}
                        <>{actions}</>
                        {canWrite &&
                            <Button onClick={() => setAdding({prefill: null})}><Plus/>{t("Event.new")}</Button>}
                    </div>
                </div>
            </DataTable>
            {(adding || editing) && (
                <EventDialog key={editing?.id ?? adding?.prefill?.typeId ?? "new"} revivalId={revivalId} types={types}
                             event={editing}
                             prefill={adding?.prefill} open onOpenChange={open => {
                    if (!open) {
                        setAdding(null);
                        setEditing(null);
                    }
                }}/>
            )}
            {cancelling && <CancelDialog event={cancelling} revivalId={revivalId}
                                         onOpenChange={open => !open && setCancelling(null)}/>}
        </div>
    );
}
