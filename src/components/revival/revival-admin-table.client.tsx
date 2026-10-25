"use client";

import * as React from "react";
import {useState, useTransition} from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {MoreHorizontal, Pencil, Trash2} from "lucide-react";
import type {RevivalSummaryFragment} from "@/gql/graphql";
import {DataTable, type DataTableColumnDef, selectColumn, SortableHeader} from "@/components/data-table.client";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
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
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {StatusBadge} from "@/components/revival/status-badge";
import {SpexTitle} from "@/components/revival/spex-title";
import {RevivalPoster} from "@/components/revival/revival-poster.client";
import {REVIVAL_STATUSES, RevivalFilterBar, useRevivalFilter} from "@/components/revival/revival-filter.client";
import {RevivalFormSheet} from "@/components/revival/revival-form-sheet.client";
import {deleteRevivalsAction} from "@/app/(app)/revivals/manage/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {formatInstant} from "@/utils/format";

type Revival = RevivalSummaryFragment;

function useColumns(onEdit: (revival: Revival) => void, onDelete: (revivals: Revival[]) => void): DataTableColumnDef<Revival>[] {
    const t = useTranslations();

    return [
        selectColumn<Revival>({
            all: t("Admin.selectAll"),
            row: revival => t("Admin.selectRow", {title: revival.title})
        }),
        {
            id: "poster",
            header: () => <span className="sr-only">{t("Revival.poster")}</span>,
            cell: ({row}) => <RevivalPoster revivalId={row.original.id} className="h-10 w-7 rounded-sm"/>,
            meta: {className: "w-12"},
        },
        {
            id: "spex",
            accessorFn: revival => revival.spex.title ?? undefined,
            sortFn: "alphanumeric",
            sortUndefined: "last",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()}
                                                  title={t("Revival.spex")}/>,
            cell: ({row}) => (
                <span className="font-medium">
                    <SpexTitle spex={row.original.spex}/>
                    {row.original.spex.year &&
                        <span className="font-normal text-muted-foreground"> ({row.original.spex.year})</span>}
                </span>
            ),
        },
        {
            id: "year",
            accessorFn: revival => revival.year,
            sortFn: "basic",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()}
                                                  title={t("Revival.year")}/>,
        },
        {
            id: "status",
            accessorFn: revival => REVIVAL_STATUSES.indexOf(revival.status),
            sortFn: "basic",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()}
                                                  title={t("Revival.status")}/>,
            cell: ({row}) => (
                <span className="flex flex-wrap items-center gap-1">
                    <StatusBadge status={row.original.status}/>
                    {row.original.anonymizedAt && <Badge variant="outline"
                                                         title={formatInstant(row.original.anonymizedAt) ?? undefined}>{t("Revival.anonymizedBadge")}</Badge>}
                </span>
            ),
        },
        {
            id: "actions",
            header: () => <span className="sr-only">{t("Admin.actions")}</span>,
            cell: ({row}) => {
                const {permissions} = row.original;

                return (permissions.canEditCore || permissions.canDelete) && (
                    <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0"
                                                             aria-label={t("Admin.openMenu", {title: row.original.title})}/>}>
                            <MoreHorizontal className="h-4 w-4"/>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {permissions.canEditCore && (
                                <DropdownMenuItem onClick={() => onEdit(row.original)}>
                                    <Pencil/>
                                    {t("Admin.edit")}
                                </DropdownMenuItem>
                            )}
                            {permissions.canDelete && (
                                <DropdownMenuItem className="text-destructive" onClick={() => onDelete([row.original])}>
                                    <Trash2/>
                                    {t("Admin.delete")}
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
            meta: {className: "w-12 text-right"},
        },
    ];
}

/**
 * Every revival, filterable and sortable, with editing and deleting as in Spexregister's tables. A row
 * opens the revival, where status and members are managed.
 */
export function RevivalAdminTable({revivals, actions}: { revivals: Revival[]; actions?: React.ReactNode }) {
    const t = useTranslations();
    const router = useRouter();
    const feedback = useActionFeedback();
    const filter = useRevivalFilter(revivals);
    const [selected, setSelected] = useState<Revival[]>([]);
    const [editing, setEditing] = useState<Revival | null>(null);
    const [deleting, setDeleting] = useState<Revival[]>([]);
    const [pending, startTransition] = useTransition();
    const columns = useColumns(setEditing, setDeleting);
    const deletable = selected.filter(revival => revival.permissions.canDelete);

    return (
        <>
            <DataTable columns={columns} data={filter.filtered} filtered={filter.active}
                       initialSorting={[{id: "year", desc: true}]}
                       onRowClick={revival => router.push(`/revivals/${revival.id}`)} onSelectionChange={setSelected}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <RevivalFilterBar filter={filter}/>
                        {deletable.length > 0 && (
                            <Button variant="destructive" size="sm" className="h-8"
                                    onClick={() => setDeleting(deletable)}>
                                {t("Admin.deleteSelected", {count: deletable.length})}
                            </Button>
                        )}
                    </div>
                    {actions}
                </div>
            </DataTable>
            {editing && <RevivalFormSheet key={editing.id} revival={editing} open
                                          onOpenChange={open => !open && setEditing(null)}/>}
            <AlertDialog open={deleting.length > 0} onOpenChange={open => !open && setDeleting([])}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("Admin.deleteTitle", {count: deleting.length})}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("Admin.deleteDescription", {titles: deleting.map(revival => revival.title).join(", ")})}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("Common.cancel")}</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" disabled={pending}
                                           onClick={() => startTransition(async () => {
                                               const result = await deleteRevivalsAction(deleting.map(revival => ({
                                                   id: revival.id,
                                                   version: revival.version
                                               })));

                                               if (feedback(result, t("Admin.deleted", {count: deleting.length}))) {
                                                   setDeleting([]);
                                                   router.refresh();
                                               }
                                           })}>
                            {t("Admin.delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
