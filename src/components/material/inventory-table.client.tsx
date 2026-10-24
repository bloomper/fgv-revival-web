"use client";

import * as React from "react";
import {useMemo, useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {MoreHorizontal, Pencil, Plus, RotateCcw, Trash2, X} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Input} from "@/components/ui/input";
import {DataEmpty} from "@/components/data-empty";
import {DataFilter} from "@/components/data-filter";
import {DataTable, type DataTableColumnDef, SortableHeader} from "@/components/data-table.client";
import {PlainText} from "@/components/plain-text";
import {UrlSwitch} from "@/components/budget/url-switch.client";
import {OwnerLabel} from "@/components/owner/owner-label";
import type {OwnerMember} from "@/components/owner/owner-field.client";
import {type EditableInventoryItem, InventoryDialog, type MaterialOption} from "@/components/material/inventory-dialog.client";
import {InventoryStatusBadge, LocationLabel, MaterialLink} from "@/components/material/material-labels";
import {removeInventoryItemAction, restoreInventoryItemAction} from "@/app/(app)/revivals/[id]/materials/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {ACTION_STATUSES, INVENTORY_KINDS, INVENTORY_LOCATIONS, INVENTORY_STATUSES} from "@/lib/material/schema";

/** The filter value of items with no location. */
export const NO_LOCATION = "-";

export type InventoryRow = EditableInventoryItem & { removed: boolean };

export type InventoryFilters = { kinds: Set<string>; statuses: Set<string>; locations: Set<string> };

/**
 * Every word must appear in the name, the location note, the owner, the material or the comment; with filters chosen,
 * the item must match one value of each.
 */
export function filterInventory(items: InventoryRow[], query: string, filters: InventoryFilters): InventoryRow[] {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);

    return items.filter(item => {
        const owner = item.owner?.person?.displayName ?? item.owner?.name ?? "";
        const text = `${item.name} ${item.locationNote ?? ""} ${owner} ${item.material?.title ?? ""} ${item.comment ?? ""}`.toLowerCase();

        return (filters.kinds.size === 0 || filters.kinds.has(item.kind))
            && (filters.statuses.size === 0 || filters.statuses.has(item.status))
            && (filters.locations.size === 0 || filters.locations.has(item.location ?? NO_LOCATION))
            && words.every(word => text.includes(word));
    });
}

function RowActions({item, revivalId, onEdit}: { item: InventoryRow; revivalId: string; onEdit: (item: InventoryRow) => void }) {
    const t = useTranslations("Inventory");
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const input = {id: item.id, version: item.version, revivalId};

    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" disabled={pending} aria-label={t("rowMenu", {name: item.name})}/>}>
                <MoreHorizontal className="h-4 w-4"/>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {!item.removed && <DropdownMenuItem onClick={() => onEdit(item)}><Pencil/>{t("edit")}</DropdownMenuItem>}
                {!item.removed && <DropdownMenuSeparator/>}
                {item.removed ? (
                    <DropdownMenuItem onClick={() => startTransition(async () => {
                        feedback(await restoreInventoryItemAction(input), t("restored"));
                    })}><RotateCcw/>{t("restore")}</DropdownMenuItem>
                ) : (
                    <DropdownMenuItem variant="destructive" onClick={() => startTransition(async () => {
                        feedback(await removeInventoryItemAction(input), t("removedDone"));
                    })}><Trash2/>{t("remove")}</DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function useColumns(revivalId: string, canWrite: boolean, onEdit: (item: InventoryRow) => void) {
    const t = useTranslations("Inventory");

    const columns: DataTableColumnDef<InventoryRow>[] = [
        {
            id: "name",
            accessorFn: item => item.name,
            sortFn: "alphanumeric",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("name")}/>,
            cell: ({row}) => {
                const item = row.original;

                return (
                    <div className="flex min-w-40 flex-col items-start gap-1 whitespace-normal">
                        <span className="flex flex-wrap items-center gap-2 font-medium">
                            {item.name}
                            {item.removed && <Badge variant="outline">{t("removed")}</Badge>}
                        </span>
                        {/* What the hidden columns show, on narrow screens */}
                        <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground md:hidden">
                            <span>{t(`kinds.${item.kind}`)}</span>
                            <span className="sm:hidden"><InventoryStatusBadge status={item.status}/></span>
                            {item.location && <span>{t(`locations.${item.location}`)}</span>}
                        </span>
                    </div>
                );
            },
        },
        {
            id: "kind",
            accessorFn: item => t(`kinds.${item.kind}`),
            sortFn: "alphanumeric",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("kind")}/>,
            cell: ({row}) => t(`kinds.${row.original.kind}`),
            meta: {className: "hidden md:table-cell"},
        },
        {
            id: "quantity",
            accessorFn: item => item.quantity,
            sortFn: "basic",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("quantity")}/>,
            cell: ({row}) => <span className="tabular-nums">{row.original.quantity}</span>,
            meta: {className: "w-20"},
        },
        {
            id: "status",
            // Items that need someone to act sort first
            accessorFn: item => `${ACTION_STATUSES.has(item.status) ? 0 : 1}${INVENTORY_STATUSES.indexOf(item.status)}`,
            sortFn: "alphanumeric",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("status")}/>,
            cell: ({row}) => <InventoryStatusBadge status={row.original.status}/>,
            meta: {className: "hidden sm:table-cell"},
        },
        {
            id: "location",
            header: () => t("location"),
            cell: ({row}) => <LocationLabel location={row.original.location} note={row.original.locationNote}/>,
            meta: {className: "hidden md:table-cell"},
        },
        {
            id: "owner",
            header: () => t("owner"),
            cell: ({row}) => <OwnerLabel owner={row.original.owner}/>,
            meta: {className: "hidden lg:table-cell"},
        },
        {
            id: "material",
            header: () => t("material"),
            cell: ({row}) => row.original.material
                ? <MaterialLink title={row.original.material.title} url={row.original.material.url} onClick={click => click.stopPropagation()}/>
                : "—",
            meta: {className: "hidden lg:table-cell"},
        },
        {
            id: "comment",
            header: () => t("comment"),
            cell: ({row}) => row.original.comment
                ? <span className="block max-w-64 whitespace-normal"><PlainText text={row.original.comment}/></span>
                : "—",
            meta: {className: "hidden xl:table-cell"},
        },
    ];

    if (canWrite) {
        columns.push({
            id: "actions",
            header: () => <span className="sr-only">{t("actions")}</span>,
            cell: ({row}) => <RowActions item={row.original} revivalId={revivalId} onEdit={onEdit}/>,
            meta: {className: "w-12 text-right"},
        });
    }
    return columns;
}

const NO_FILTERS: InventoryFilters = {kinds: new Set(), statuses: new Set(), locations: new Set()};

/**
 * A revival's inventory (M8-FR-4): the props, costumes, scores and technology it has or needs, where each is kept and
 * who has it. Items that must be found, bought or built stand out. Search, filters by kind, status and location,
 * removed items on request, and a menu per row to edit, remove or restore. Items are never deleted.
 */
export function InventoryTable({revivalId, items, members, materials, canWrite, showRemoved}: {
    revivalId: string;
    items: InventoryRow[];
    members: OwnerMember[];
    materials: MaterialOption[];
    canWrite: boolean;
    showRemoved: boolean;
}) {
    const t = useTranslations();
    const [query, setQuery] = useState("");
    const [filters, setFilters] = useState<InventoryFilters>(NO_FILTERS);
    const [editing, setEditing] = useState<InventoryRow | null>(null);
    const [adding, setAdding] = useState(false);
    const filtered = useMemo(() => filterInventory(items, query, filters), [items, query, filters]);
    const active = query.trim() !== "" || filters.kinds.size > 0 || filters.statuses.size > 0 || filters.locations.size > 0;
    const columns = useColumns(revivalId, canWrite, setEditing);
    const needAction = items.filter(item => !item.removed && ACTION_STATUSES.has(item.status)).length;
    const set = (key: keyof InventoryFilters) => (values: Set<string>) => setFilters(current => ({...current, [key]: values}));

    return (
        <div className="flex flex-col gap-4">
            {needAction > 0 && <p className="text-sm text-muted-foreground" role="status">{t("Inventory.needAction", {count: needAction})}</p>}
            <DataTable columns={columns} data={filtered} filtered={active} initialSorting={[{id: "name", desc: false}]}
                       onRowClick={canWrite ? (item => !item.removed && setEditing(item)) : undefined}
                       rowClassName={item => item.removed && "text-muted-foreground"}
                       empty={<DataEmpty title={t("Inventory.empty")} description={canWrite ? t("Inventory.emptyHint") : t("Inventory.emptyReadOnly")}/>}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative w-full sm:w-75">
                            <Input placeholder={t("Inventory.filterPlaceholder")} value={query} onChange={change => setQuery(change.target.value)}
                                   aria-label={t("Common.search")} className="h-8 pr-8"/>
                            {query && (
                                <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-8 w-8 hover:bg-transparent"
                                        aria-label={t("Common.clearSearch")} onClick={() => setQuery("")}>
                                    <X className="h-3 w-3"/>
                                </Button>
                            )}
                        </div>
                        <DataFilter title={t("Inventory.kind")} selectedValues={filters.kinds} onSelect={set("kinds")} onClear={() => set("kinds")(new Set())}
                                    options={INVENTORY_KINDS.map(kind => ({label: t(`Inventory.kinds.${kind}`), value: kind}))}/>
                        <DataFilter title={t("Inventory.status")} selectedValues={filters.statuses} onSelect={set("statuses")} onClear={() => set("statuses")(new Set())}
                                    options={INVENTORY_STATUSES.map(status => ({label: t(`Inventory.statuses.${status}`), value: status}))}/>
                        <DataFilter title={t("Inventory.location")} selectedValues={filters.locations} onSelect={set("locations")}
                                    onClear={() => set("locations")(new Set())}
                                    options={[
                                        ...INVENTORY_LOCATIONS.map(location => ({label: t(`Inventory.locations.${location}`), value: location})),
                                        {label: t("Inventory.noLocation"), value: NO_LOCATION, sortKey: "￿"},
                                    ]}/>
                        {active && (
                            <Button variant="ghost" onClick={() => {
                                setQuery("");
                                setFilters(NO_FILTERS);
                            }} className="h-8 px-2 lg:px-3">
                                <X className="mr-2 h-4 w-4"/>
                                {t("Common.reset")}
                            </Button>
                        )}
                        {canWrite && <UrlSwitch param="removed" shown={showRemoved} label={t("Inventory.showRemoved")}/>}
                    </div>
                    {canWrite && (
                        <div className="flex flex-wrap items-center gap-2">
                            <Button onClick={() => setAdding(true)}><Plus/>{t("Inventory.new")}</Button>
                        </div>
                    )}
                </div>
            </DataTable>
            {(adding || editing) && (
                <InventoryDialog key={editing?.id ?? "new"} revivalId={revivalId} members={members} materials={materials} item={editing}
                                 onOpenChange={open => {
                                     if (!open) {
                                         setAdding(false);
                                         setEditing(null);
                                     }
                                 }}/>
            )}
        </div>
    );
}
