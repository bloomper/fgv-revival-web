"use client";

import * as React from "react";
import {useMemo, useState, useTransition} from "react";
import {useLocale, useTranslations} from "next-intl";
import {ExternalLink, MoreHorizontal, Pencil, Plus, RotateCcw, Trash2, X} from "lucide-react";
import type {MaterialCategory, MaterialVisibility} from "@/gql/graphql";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Input} from "@/components/ui/input";
import {DataEmpty} from "@/components/data-empty";
import {DataFilter} from "@/components/data-filter";
import {DataTable, type DataTableColumnDef, SortableHeader} from "@/components/data-table.client";
import {PlainText} from "@/components/plain-text";
import {catalogName} from "@/components/catalog/catalog";
import {UrlSwitch} from "@/components/budget/url-switch.client";
import {type EditableMaterial, MaterialDialog} from "@/components/material/material-dialog.client";
import {CategoryBadge, type LinkServiceValue, MaterialLink, ServiceBadge, VisibilityLabel} from "@/components/material/material-labels";
import type {PositionValue} from "@/components/participant/participant-labels";
import {removeMaterialAction, restoreMaterialAction} from "@/app/(app)/revivals/[id]/materials/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {hostOf} from "@/lib/material/hosts";
import {MATERIAL_CATEGORIES, MATERIAL_VISIBILITIES} from "@/lib/material/schema";

/** The filter value of links no service recognises. */
export const NO_SERVICE = "-";

export type MaterialRow = EditableMaterial & { removed: boolean };

export type MaterialFilters = { categories: Set<string>; services: Set<string>; visibilities: Set<string> };

/**
 * Every word must appear in the title, the link, the service, the comment or a position; with filters chosen, the
 * material must match one value of each.
 */
export function filterMaterials(materials: MaterialRow[], query: string, filters: MaterialFilters, locale: string): MaterialRow[] {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);

    return materials.filter(material => {
        const service = material.service ? catalogName(material.service, locale) : "";
        const text = `${material.title} ${material.url} ${service} ${material.comment ?? ""} ${material.positions.map(position => position.name).join(" ")}`
            .toLowerCase();

        return (filters.categories.size === 0 || filters.categories.has(material.category))
            && (filters.services.size === 0 || filters.services.has(material.service?.id ?? NO_SERVICE))
            && (filters.visibilities.size === 0 || filters.visibilities.has(material.visibility))
            && words.every(word => text.includes(word));
    });
}

function RowActions({material, revivalId, onEdit}: { material: MaterialRow; revivalId: string; onEdit: (material: MaterialRow) => void }) {
    const t = useTranslations("Material");
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const input = {id: material.id, version: material.version, revivalId};

    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" disabled={pending} aria-label={t("rowMenu", {title: material.title})}/>}>
                <MoreHorizontal className="h-4 w-4"/>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {!material.removed && <DropdownMenuItem onClick={() => onEdit(material)}><Pencil/>{t("edit")}</DropdownMenuItem>}
                <DropdownMenuItem render={<a href={material.url} target="_blank" rel="noopener noreferrer"/>}>
                    <ExternalLink/>{t("open")}
                </DropdownMenuItem>
                <DropdownMenuSeparator/>
                {material.removed ? (
                    <DropdownMenuItem onClick={() => startTransition(async () => {
                        feedback(await restoreMaterialAction(input), t("restored"));
                    })}><RotateCcw/>{t("restore")}</DropdownMenuItem>
                ) : (
                    <DropdownMenuItem variant="destructive" onClick={() => startTransition(async () => {
                        feedback(await removeMaterialAction(input), t("removedDone"));
                    })}><Trash2/>{t("remove")}</DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function useColumns(revivalId: string, canWrite: boolean, onEdit: (material: MaterialRow) => void) {
    const t = useTranslations("Material");
    const locale = useLocale();

    const columns: DataTableColumnDef<MaterialRow>[] = [
        {
            id: "title",
            accessorFn: material => material.title,
            sortFn: "alphanumeric",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("titleLabel")}/>,
            cell: ({row}) => {
                const material = row.original;

                return (
                    <div className="flex min-w-40 flex-col items-start gap-1 whitespace-normal">
                        {/* The row opens the dialog for writers; the link itself opens the material */}
                        <span className="flex flex-wrap items-center gap-2">
                            <MaterialLink title={material.title} url={material.url} onClick={click => click.stopPropagation()}/>
                            {material.removed && <Badge variant="outline">{t("removed")}</Badge>}
                        </span>
                        {/* What the hidden columns show, on narrow screens */}
                        <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground md:hidden">
                            <ServiceBadge service={material.service} url={material.url}/>
                            <span className="sm:hidden"><CategoryBadge category={material.category}/></span>
                            <VisibilityLabel visibility={material.visibility} positions={material.positions}/>
                        </span>
                    </div>
                );
            },
        },
        {
            id: "service",
            accessorFn: material => material.service ? catalogName(material.service, locale) : hostOf(material.url) ?? "",
            sortFn: "alphanumeric",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("service")}/>,
            cell: ({row}) => <ServiceBadge service={row.original.service} url={row.original.url}/>,
            meta: {className: "hidden md:table-cell"},
        },
        {
            id: "category",
            accessorFn: material => t(`categories.${material.category}`),
            sortFn: "alphanumeric",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("category")}/>,
            cell: ({row}) => <CategoryBadge category={row.original.category}/>,
            meta: {className: "hidden sm:table-cell"},
        },
        {
            id: "visibility",
            header: () => t("visibility"),
            cell: ({row}) => <span className="whitespace-normal"><VisibilityLabel visibility={row.original.visibility} positions={row.original.positions}/></span>,
            meta: {className: "hidden md:table-cell"},
        },
        {
            id: "comment",
            header: () => t("comment"),
            cell: ({row}) => row.original.comment
                ? <span className="block max-w-80 whitespace-normal"><PlainText text={row.original.comment}/></span>
                : "—",
            meta: {className: "hidden lg:table-cell"},
        },
    ];

    if (canWrite) {
        columns.push({
            id: "actions",
            header: () => <span className="sr-only">{t("actions")}</span>,
            cell: ({row}) => <RowActions material={row.original} revivalId={revivalId} onEdit={onEdit}/>,
            meta: {className: "w-12 text-right"},
        });
    }
    return columns;
}

const NO_FILTERS: MaterialFilters = {categories: new Set(), services: new Set(), visibilities: new Set()};

/**
 * A revival's materials (M8): links to where scripts, scores, recordings and pictures are kept. Search, filters by
 * category, service and visibility, removed ones on request for writers, and a menu per row to edit, open, remove or
 * restore. Materials are never deleted.
 */
export function MaterialTable({revivalId, materials, services, positions, positionsUnavailable, canWrite, showRemoved}: {
    revivalId: string;
    materials: MaterialRow[];
    /** The active services. */
    services: LinkServiceValue[];
    positions: PositionValue[];
    positionsUnavailable: boolean;
    canWrite: boolean;
    showRemoved: boolean;
}) {
    const t = useTranslations();
    const locale = useLocale();
    const [query, setQuery] = useState("");
    const [filters, setFilters] = useState<MaterialFilters>(NO_FILTERS);
    const [editing, setEditing] = useState<MaterialRow | null>(null);
    const [adding, setAdding] = useState(false);
    const filtered = useMemo(() => filterMaterials(materials, query, filters, locale), [materials, query, filters, locale]);
    const active = query.trim() !== "" || filters.categories.size > 0 || filters.services.size > 0 || filters.visibilities.size > 0;
    const columns = useColumns(revivalId, canWrite, setEditing);
    const serviceOptions = useMemo(() => {
        const held = new Map(materials.filter(material => material.service).map(material => [material.service!.id, material.service!]));

        return [
            ...[...held.values()].map(service => ({label: catalogName(service, locale), value: service.id})),
            ...(materials.some(material => !material.service) ? [{label: t("Material.unknownService"), value: NO_SERVICE, sortKey: "￿"}] : []),
        ];
    }, [materials, locale, t]);
    const set = (key: keyof MaterialFilters) => (values: Set<string>) => setFilters(current => ({...current, [key]: values}));

    return (
        <div className="flex flex-col gap-6">
            <DataTable columns={columns} data={filtered} filtered={active} initialSorting={[{id: "title", desc: false}]}
                       onRowClick={canWrite ? (material => !material.removed && setEditing(material)) : undefined}
                       rowClassName={material => material.removed && "text-muted-foreground"}
                       empty={<DataEmpty title={t("Material.empty")} description={canWrite ? t("Material.emptyHint") : t("Material.emptyReadOnly")}/>}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative w-full sm:w-75">
                            <Input placeholder={t("Material.filterPlaceholder")} value={query} onChange={change => setQuery(change.target.value)}
                                   aria-label={t("Common.search")} className="h-8 pr-8"/>
                            {query && (
                                <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-8 w-8 hover:bg-transparent"
                                        aria-label={t("Common.clearSearch")} onClick={() => setQuery("")}>
                                    <X className="h-3 w-3"/>
                                </Button>
                            )}
                        </div>
                        <DataFilter title={t("Material.category")} selectedValues={filters.categories} onSelect={set("categories")}
                                    onClear={() => set("categories")(new Set())}
                                    options={MATERIAL_CATEGORIES.map((category: MaterialCategory) => ({label: t(`Material.categories.${category}`), value: category}))}/>
                        {serviceOptions.length > 0 && (
                            <DataFilter title={t("Material.service")} options={serviceOptions} selectedValues={filters.services} onSelect={set("services")}
                                        onClear={() => set("services")(new Set())}/>
                        )}
                        <DataFilter title={t("Material.visibility")} selectedValues={filters.visibilities} onSelect={set("visibilities")}
                                    onClear={() => set("visibilities")(new Set())}
                                    options={MATERIAL_VISIBILITIES.map((visibility: MaterialVisibility) => ({label: t(`Material.visibilities.${visibility}`), value: visibility}))}/>
                        {active && (
                            <Button variant="ghost" onClick={() => {
                                setQuery("");
                                setFilters(NO_FILTERS);
                            }} className="h-8 px-2 lg:px-3">
                                <X className="mr-2 h-4 w-4"/>
                                {t("Common.reset")}
                            </Button>
                        )}
                        {canWrite && <UrlSwitch param="removed" shown={showRemoved} label={t("Material.showRemoved")}/>}
                    </div>
                    {canWrite && (
                        <div className="flex flex-wrap items-center gap-2">
                            <Button onClick={() => setAdding(true)}><Plus/>{t("Material.new")}</Button>
                        </div>
                    )}
                </div>
            </DataTable>
            {(adding || editing) && (
                <MaterialDialog key={editing?.id ?? "new"} revivalId={revivalId} services={services} positions={positions}
                                positionsUnavailable={positionsUnavailable} material={editing} onOpenChange={open => {
                    if (!open) {
                        setAdding(false);
                        setEditing(null);
                    }
                }}/>
            )}
        </div>
    );
}
