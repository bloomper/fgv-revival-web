"use client";

import {useMemo, useState, useTransition} from "react";
import Link from "next/link";
import {useLocale, useTranslations} from "next-intl";
import {MoreHorizontal, Pencil, Plus, RotateCcw, Trash2, X} from "lucide-react";
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
import {catalogName} from "@/components/catalog/catalog";
import {pickText} from "@/components/guide/localized";
import {AmountText, type BudgetCategoryValue} from "@/components/budget/budget-labels";
import {
    type BudgetDecisionOption,
    type BudgetEventOption,
    BudgetLineDialog,
    type BudgetLinePrefill,
    type EditableBudgetLine,
    quantityText,
} from "@/components/budget/budget-line-dialog.client";
import {type BudgetLineProposal, BudgetProposals} from "@/components/budget/budget-proposals.client";
import {UrlSwitch} from "@/components/budget/url-switch.client";
import {removeBudgetLineAction, restoreBudgetLineAction} from "@/app/(app)/revivals/[id]/budget/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {amountInputValue} from "@/lib/budget/amount";

export type BudgetLineRow = EditableBudgetLine & {
    amount: string;
    event?: { id: string; title: string; startDate: string } | null;
    logEntry?: { id: string; number: number } | null;
    removed: boolean;
};

/**
 * Every word must appear in the description, the category, the event or the comment; with categories chosen, the line
 * must have one of them.
 */
export function filterBudgetLines(lines: BudgetLineRow[], query: string, categories: Set<string>, locale: string): BudgetLineRow[] {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);

    return lines.filter(line => {
        const text = `${line.description} ${catalogName(line.category, locale)} ${line.event?.title ?? ""} ${line.comment ?? ""}`.toLowerCase();

        return (categories.size === 0 || categories.has(line.category.id)) && words.every(word => text.includes(word));
    });
}

function RowActions({line, revivalId, onEdit}: {
    line: BudgetLineRow;
    revivalId: string;
    onEdit: (line: BudgetLineRow) => void
}) {
    const t = useTranslations("Budget");
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const input = {revivalId, id: line.id, version: line.version};

    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" disabled={pending}
                                                 aria-label={t("rowMenu", {name: line.description})}/>}>
                <MoreHorizontal className="h-4 w-4"/>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {!line.removed &&
                    <DropdownMenuItem onClick={() => onEdit(line)}><Pencil/>{t("edit")}</DropdownMenuItem>}
                {!line.removed && <DropdownMenuSeparator/>}
                {line.removed ? (
                    <DropdownMenuItem onClick={() => startTransition(async () => {
                        feedback(await restoreBudgetLineAction(input), t("lineRestored"));
                    })}><RotateCcw/>{t("restore")}</DropdownMenuItem>
                ) : (
                    <DropdownMenuItem variant="destructive" onClick={() => startTransition(async () => {
                        feedback(await removeBudgetLineAction(input), t("lineRemoved"));
                    })}><Trash2/>{t("remove")}</DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function useColumns(revivalId: string, canWrite: boolean, onEdit: (line: BudgetLineRow) => void) {
    const t = useTranslations("Budget");
    const locale = useLocale();

    const columns: DataTableColumnDef<BudgetLineRow>[] = [
        {
            id: "category",
            accessorFn: line => catalogName(line.category, locale),
            sortFn: "alphanumeric",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("category")}/>,
            cell: ({row}) => <Badge
                variant={row.original.category.kind === "INCOME" ? "secondary" : "outline"}>{catalogName(row.original.category, locale)}</Badge>,
            meta: {className: "hidden md:table-cell"},
        },
        {
            id: "description",
            accessorFn: line => line.description,
            sortFn: "alphanumeric",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()}
                                                  title={t("description")}/>,
            cell: ({row}) => {
                const line = row.original;

                return (
                    <div className="flex min-w-40 flex-col items-start gap-1 whitespace-normal">
                        <span className="flex flex-wrap items-center gap-2">
                            {line.description}
                            {line.removed && <Badge variant="outline">{t("removed")}</Badge>}
                        </span>
                        <span className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                            <span className="md:hidden">{catalogName(line.category, locale)}</span>
                            {line.event && (
                                <Link href={`/revivals/${revivalId}/events`} className="hover:underline"
                                      onClick={click => click.stopPropagation()}>
                                    {line.event.title}
                                </Link>
                            )}
                            {line.logEntry && (
                                <Link href={`/revivals/${revivalId}/log`} className="hover:underline"
                                      onClick={click => click.stopPropagation()}>
                                    {t("decisionNumber", {number: line.logEntry.number})}
                                </Link>
                            )}
                        </span>
                    </div>
                );
            },
        },
        {
            id: "quantity",
            header: () => <span className="block text-right">{t("quantityTimesUnit")}</span>,
            cell: ({row}) => (
                <span className="block text-right whitespace-nowrap tabular-nums text-muted-foreground">
                    {quantityText(row.original.quantity)} × <AmountText value={row.original.unitAmount}/>
                </span>
            ),
            meta: {className: "hidden sm:table-cell"},
        },
        {
            id: "amount",
            accessorFn: line => Number(line.amount),
            sortFn: "basic",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("amount")}/>,
            cell: ({row}) => <AmountText value={row.original.amount} className="block text-right font-medium"/>,
            meta: {className: "text-right"},
        },
    ];

    if (canWrite) {
        columns.push({
            id: "actions",
            header: () => <span className="sr-only">{t("actions")}</span>,
            cell: ({row}) => <RowActions line={row.original} revivalId={revivalId} onEdit={onEdit}/>,
            meta: {className: "w-12 text-right"},
        });
    }
    return columns;
}

/**
 * The budget's lines (M5-FR-4): search, a filter by category, removed ones on request, and a menu per row to edit,
 * remove or restore. Lines are never deleted. Above the table, the lines the events propose for those who may write.
 */
export function BudgetLineTable({revivalId, lines, proposals, categories, events, decisions, canWrite, showRemoved}: {
    revivalId: string;
    lines: BudgetLineRow[];
    proposals: BudgetLineProposal[];
    /** The active categories, for new lines. */
    categories: BudgetCategoryValue[];
    events: BudgetEventOption[];
    decisions: BudgetDecisionOption[];
    canWrite: boolean;
    showRemoved: boolean;
}) {
    const t = useTranslations();
    const locale = useLocale();
    const [query, setQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<Set<string>>(new Set());
    const [editing, setEditing] = useState<BudgetLineRow | null>(null);
    const [adding, setAdding] = useState<{ prefill: BudgetLinePrefill | null } | null>(null);
    const filtered = useMemo(() => filterBudgetLines(lines, query, categoryFilter, locale), [lines, query, categoryFilter, locale]);
    const active = query.trim() !== "" || categoryFilter.size > 0;
    const columns = useColumns(revivalId, canWrite, setEditing);
    const categoryOptions = useMemo(() => {
        const held = new Map(lines.map(line => [line.category.id, line.category]));

        return [...held.values()].map(category => ({
            label: catalogName(category, locale),
            value: category.id,
            groupLabel: t(`Budget.kinds.${category.kind}`)
        }));
    }, [lines, locale, t]);

    return (
        <div className="flex flex-col gap-6">
            {canWrite && <BudgetProposals proposals={proposals} onAdd={proposal => setAdding({
                prefill: {
                    categoryId: proposal.line.category.id,
                    description: pickText(proposal.line.description, locale).text,
                    quantity: quantityText(proposal.quantity) || "1",
                    unitAmount: amountInputValue(proposal.line.unitAmount),
                    eventId: proposal.event.id,
                    eventTypeLineId: proposal.line.id,
                },
            })}/>}
            <DataTable columns={columns} data={filtered} filtered={active}
                       initialSorting={[{id: "category", desc: false}]}
                       onRowClick={canWrite ? (line => !line.removed && setEditing(line)) : undefined}
                       rowClassName={line => line.removed && "text-muted-foreground"}
                       empty={<DataEmpty title={t("Budget.noLines")}
                                         description={canWrite ? t("Budget.noLinesHint") : t("Budget.noLinesReadOnly")}/>}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative w-full sm:w-75">
                            <Input placeholder={t("Budget.filterLines")} value={query}
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
                        {categoryOptions.length > 0 && (
                            <DataFilter title={t("Budget.category")} options={categoryOptions}
                                        selectedValues={categoryFilter}
                                        onSelect={setCategoryFilter} onClear={() => setCategoryFilter(new Set())}/>
                        )}
                        {active && (
                            <Button variant="ghost" onClick={() => {
                                setQuery("");
                                setCategoryFilter(new Set());
                            }} className="h-8 px-2 lg:px-3">
                                <X className="mr-2 h-4 w-4"/>
                                {t("Common.reset")}
                            </Button>
                        )}
                        <UrlSwitch param="removed" shown={showRemoved} label={t("Budget.showRemoved")}/>
                    </div>
                    {canWrite &&
                        <Button onClick={() => setAdding({prefill: null})}><Plus/>{t("Budget.newLine")}</Button>}
                </div>
            </DataTable>
            {(adding || editing) && (
                <BudgetLineDialog key={editing?.id ?? adding?.prefill?.eventTypeLineId ?? "new"} revivalId={revivalId}
                                  categories={categories}
                                  events={events} decisions={decisions} line={editing} prefill={adding?.prefill}
                                  onOpenChange={open => {
                                      if (!open) {
                                          setAdding(null);
                                          setEditing(null);
                                      }
                                  }}/>
            )}
        </div>
    );
}
