"use client";

import {Fragment, useState} from "react";
import {useLocale, useTranslations} from "next-intl";
import {ChevronDown, ChevronRight} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {catalogName} from "@/components/catalog/catalog";
import {AmountText, type BudgetCategoryValue, KindBadge} from "@/components/budget/budget-labels";
import {fromOre, subtractAmounts, toOre} from "@/lib/budget/amount";

export type ReferenceFigureView = {
    label: string;
    year: number;
    participants?: number | null;
    budgeted?: string | null;
    actual?: string | null;
    budgetedPerParticipant?: string | null;
    actualPerParticipant?: string | null;
};

export type BudgetCategorySummary = {
    category: BudgetCategoryValue;
    budgeted: string;
    actual: string;
    references: ReferenceFigureView[];
};

/**
 * The difference between what came in or went out and what was budgeted, signed so that a positive number is good for
 * the result: more income, or less cost, than budgeted.
 */
export function categoryDifference({
                                       category,
                                       budgeted,
                                       actual
                                   }: Pick<BudgetCategorySummary, "category" | "budgeted" | "actual">): string | null {
    return category.kind === "INCOME" ? subtractAmounts(actual, budgeted) : subtractAmounts(budgeted, actual);
}

function sum(rows: BudgetCategorySummary[], key: "budgeted" | "actual") {
    return fromOre(rows.reduce((total, row) => total + (toOre(row[key]) ?? 0), 0));
}

function References({references}: { references: ReferenceFigureView[] }) {
    const t = useTranslations("Budget");

    if (references.length === 0) {
        return <p className="text-sm text-muted-foreground">{t("noReferences")}</p>;
    }

    return (
        <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
            <tr>
                <th className="py-1 text-left font-normal">{t("reference")}</th>
                <th className="py-1 text-right font-normal">{t("budgeted")}</th>
                <th className="py-1 text-right font-normal">{t("actual")}</th>
                <th className="hidden py-1 text-right font-normal sm:table-cell">{t("perParticipant")}</th>
            </tr>
            </thead>
            <tbody>
            {references.map(reference => (
                <tr key={`${reference.label}-${reference.year}`}>
                    <td className="py-1">
                        {reference.label}
                        {reference.participants ? <span
                            className="text-muted-foreground"> · {t("participantCount", {count: reference.participants})}</span> : null}
                    </td>
                    <td className="py-1 text-right"><AmountText value={reference.budgeted}/></td>
                    <td className="py-1 text-right"><AmountText value={reference.actual}/></td>
                    <td className="hidden py-1 text-right text-muted-foreground sm:table-cell">
                        <AmountText value={reference.actualPerParticipant ?? reference.budgetedPerParticipant}/>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}

/**
 * Per category: budgeted, actual and the difference, income first and then costs, each with a subtotal. A
 * row opens to show earlier revivals' figures for the category, in total and per participant.
 */
export function BudgetCategoryTable({categories}: { categories: BudgetCategorySummary[] }) {
    const t = useTranslations("Budget");
    const locale = useLocale();
    const [open, setOpen] = useState<Set<string>>(new Set());
    const toggle = (id: string) => setOpen(previous => {
        const next = new Set(previous);

        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        return next;
    });

    if (categories.length === 0) {
        return <p className="text-sm text-muted-foreground">{t("noCategories")}</p>;
    }

    return (
        <div className="rounded-md border">
            <Table aria-label={t("categories")}>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t("category")}</TableHead>
                        <TableHead className="text-right">{t("budgeted")}</TableHead>
                        <TableHead className="text-right">{t("actual")}</TableHead>
                        <TableHead className="hidden text-right sm:table-cell">{t("difference")}</TableHead>
                    </TableRow>
                </TableHeader>
                {(["INCOME", "COST"] as const).map(kind => {
                    const rows = categories.filter(row => row.category.kind === kind);

                    if (rows.length === 0) {
                        return null;
                    }
                    return (
                        <TableBody key={kind}>
                            {rows.map(row => {
                                const name = catalogName(row.category, locale);
                                const expanded = open.has(row.category.id);

                                return (
                                    <Fragment key={row.category.id}>
                                        <TableRow>
                                            <TableCell>
                                                <Button variant="ghost" size="sm"
                                                        className="-ml-2 h-auto px-2 py-1 font-normal"
                                                        aria-expanded={expanded}
                                                        aria-label={t("showReferences", {name})}
                                                        onClick={() => toggle(row.category.id)}>
                                                    {expanded ? <ChevronDown/> : <ChevronRight/>}
                                                    <span className="whitespace-normal text-left">{name}</span>
                                                </Button>
                                            </TableCell>
                                            <TableCell className="text-right"><AmountText
                                                value={row.budgeted}/></TableCell>
                                            <TableCell className="text-right"><AmountText
                                                value={row.actual}/></TableCell>
                                            <TableCell className="hidden text-right sm:table-cell"><AmountText
                                                value={categoryDifference(row)} signed/></TableCell>
                                        </TableRow>
                                        {expanded && (
                                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                                <TableCell colSpan={4} className="whitespace-normal">
                                                    <References references={row.references}/>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </Fragment>
                                );
                            })}
                            <TableRow className="font-medium hover:bg-transparent">
                                <TableCell><span className="flex items-center gap-2">{t("subtotal")} <KindBadge
                                    kind={kind}/></span></TableCell>
                                <TableCell className="text-right"><AmountText
                                    value={sum(rows, "budgeted")}/></TableCell>
                                <TableCell className="text-right"><AmountText value={sum(rows, "actual")}/></TableCell>
                                <TableCell className="hidden sm:table-cell"/>
                            </TableRow>
                        </TableBody>
                    );
                })}
                <TableFooter>
                    <TableRow>
                        <TableCell>{t("result")}</TableCell>
                        {(["budgeted", "actual"] as const).map(key => {
                            const income = categories.filter(row => row.category.kind === "INCOME");
                            const cost = categories.filter(row => row.category.kind === "COST");

                            return (
                                <TableCell key={key} className="text-right">
                                    <AmountText value={subtractAmounts(sum(income, key), sum(cost, key))} signed/>
                                </TableCell>
                            );
                        })}
                        <TableCell className="hidden sm:table-cell"/>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    );
}
