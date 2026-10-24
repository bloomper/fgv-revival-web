"use client";

import {useId, useState, useTransition} from "react";
import {useLocale, useTranslations} from "next-intl";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Pencil, Plus, Trash2} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle} from "@/components/ui/sheet";
import {Textarea} from "@/components/ui/textarea";
import {catalogName} from "@/components/catalog/catalog";
import {AmountText, type BudgetCategoryValue} from "@/components/budget/budget-labels";
import {
    createReferenceRevivalAction,
    deleteReferenceRevivalAction,
    updateReferenceRevivalAction,
} from "@/app/(app)/admin/reference-figures/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {amountInputValue, fromOre, toOre} from "@/lib/budget/amount";
import {
    MAX_BUDGET_COMMENT,
    MAX_REFERENCE_LABEL,
    type ReferenceRevivalValues,
    referenceRevivalValuesSchema
} from "@/lib/budget/schema";

export type ReferenceRevivalRow = {
    id: string;
    label: string;
    year: number;
    participants?: number | null;
    comment?: string | null;
    automatic: boolean;
    figures: { category: BudgetCategoryValue; budgeted?: string | null; actual?: string | null }[];
    version: number;
};

/**
 * The categories a reference's grid shows: every active one, in list order, and the retired ones it holds figures for.
 */
export function gridCategories(categories: BudgetCategoryValue[], reference: ReferenceRevivalRow | null): BudgetCategoryValue[] {
    const held = new Set(reference?.figures.map(figure => figure.category.id) ?? []);

    return categories.filter(category => !category.retired || held.has(category.id));
}

function initialValues(reference: ReferenceRevivalRow | null, categories: BudgetCategoryValue[]): ReferenceRevivalValues {
    const figures = new Map(reference?.figures.map(figure => [figure.category.id, figure]) ?? []);

    return {
        label: reference?.label ?? "",
        year: reference?.year?.toString() ?? "",
        participants: reference?.participants?.toString() ?? "",
        comment: reference?.comment ?? "",
        figures: categories.map(category => ({
            categoryId: category.id,
            budgeted: amountInputValue(figures.get(category.id)?.budgeted),
            actual: amountInputValue(figures.get(category.id)?.actual),
        })),
    };
}

function total(reference: ReferenceRevivalRow, kind: "INCOME" | "COST", key: "budgeted" | "actual") {
    const figures = reference.figures.filter(figure => figure.category.kind === kind && figure[key]);

    return figures.length ? fromOre(figures.reduce((sum, figure) => sum + (toOre(figure[key]) ?? 0), 0)) : null;
}

function ReferenceSheet({reference, categories, onOpenChange}: {
    reference: ReferenceRevivalRow | null;
    categories: BudgetCategoryValue[];
    onOpenChange: (open: boolean) => void;
}) {
    const t = useTranslations();
    const id = useId();
    const locale = useLocale();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const rows = gridCategories(categories, reference);
    const form = useForm<ReferenceRevivalValues>({
        resolver: zodResolver(referenceRevivalValuesSchema),
        defaultValues: initialValues(reference, rows)
    });
    const {errors} = form.formState;
    const error = (message?: string) => message &&
        <p className="text-sm text-destructive">{t(`Validation.${message}`)}</p>;
    const figureError = Array.isArray(errors.figures)
        ? errors.figures.map(figure => figure?.budgeted?.message ?? figure?.actual?.message).find(Boolean)
        : undefined;

    return (
        <Sheet open onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[720px] flex flex-col gap-0 p-0 h-full">
                <SheetHeader className="p-6 pb-4 shrink-0">
                    <SheetTitle>{reference ? t("ReferenceAdmin.editTitle") : t("ReferenceAdmin.create")}</SheetTitle>
                    <SheetDescription>{t("ReferenceAdmin.dialogDescription")}</SheetDescription>
                </SheetHeader>
                <form className="flex min-h-0 flex-1 flex-col overflow-hidden"
                      onSubmit={form.handleSubmit(values => startTransition(async () => {
                          const result = reference
                              ? await updateReferenceRevivalAction({
                                  id: reference.id,
                                  version: reference.version,
                                  values
                              })
                              : await createReferenceRevivalAction({values});

                          if (feedback(result, t("Common.saved"))) {
                              onOpenChange(false);
                          }
                      }))}>
                    <ScrollArea className="min-h-0 flex-1 border-t">
                        <div className="space-y-4 px-6 py-6 pb-12">
                            <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-label`}>{t("ReferenceAdmin.label")}</Label>
                                    <Input id={`${id}-label`} maxLength={MAX_REFERENCE_LABEL}
                                           placeholder={t("ReferenceAdmin.labelPlaceholder")}
                                           aria-invalid={errors.label ? true : undefined} {...form.register("label")}/>
                                    {error(errors.label?.message)}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-year`}>{t("ReferenceAdmin.year")}</Label>
                                    <Input id={`${id}-year`} className="w-24 tabular-nums" inputMode="numeric"
                                           maxLength={4} autoComplete="off" {...form.register("year")}/>
                                    {error(errors.year?.message)}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-participants`}>{t("ReferenceAdmin.participants")}</Label>
                                    <Input id={`${id}-participants`} className="w-24 tabular-nums" inputMode="numeric"
                                           autoComplete="off" {...form.register("participants")}/>
                                    {error(errors.participants?.message)}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-comment`}>{t("ReferenceAdmin.comment")}</Label>
                                <Textarea id={`${id}-comment`} rows={2}
                                          maxLength={MAX_BUDGET_COMMENT} {...form.register("comment")}/>
                            </div>
                            <fieldset className="space-y-2">
                                <legend className="text-sm font-medium">{t("ReferenceAdmin.figures")}</legend>
                                <p className="text-xs text-muted-foreground">{t("ReferenceAdmin.figuresHelp")}</p>
                                <table className="w-full text-sm">
                                    <thead className="text-xs text-muted-foreground">
                                    <tr>
                                        <th className="py-1 text-left font-normal">{t("Budget.category")}</th>
                                        <th className="py-1 text-left font-normal">{t("Budget.budgeted")}</th>
                                        <th className="py-1 text-left font-normal">{t("Budget.actual")}</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {rows.map((category, index) => {
                                        const name = catalogName(category, locale);
                                        const rowErrors = errors.figures?.[index];

                                        return (
                                            <tr key={category.id}>
                                                <td className="py-1 pr-2">
                                                    {name}
                                                    <span
                                                        className="ml-1 text-xs text-muted-foreground">{t(`Budget.kinds.${category.kind}`)}</span>
                                                </td>
                                                <td className="py-1 pr-2">
                                                    <Input className="h-8 tabular-nums" inputMode="decimal"
                                                           autoComplete="off"
                                                           aria-label={t("ReferenceAdmin.budgetedFor", {name})}
                                                           aria-invalid={rowErrors?.budgeted ? true : undefined}
                                                           {...form.register(`figures.${index}.budgeted`)}/>
                                                </td>
                                                <td className="py-1">
                                                    <Input className="h-8 tabular-nums" inputMode="decimal"
                                                           autoComplete="off"
                                                           aria-label={t("ReferenceAdmin.actualFor", {name})}
                                                           aria-invalid={rowErrors?.actual ? true : undefined}
                                                           {...form.register(`figures.${index}.actual`)}/>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                                {error(figureError)}
                            </fieldset>
                        </div>
                    </ScrollArea>
                    <SheetFooter className="p-6 pt-4 border-t bg-muted/30 shrink-0 mt-auto">
                        <Button type="button" variant="outline"
                                onClick={() => onOpenChange(false)}>{t("Common.cancel")}</Button>
                        <Button type="submit" disabled={pending}>{t("Common.save")}</Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}

/**
 * The reference library (M5-FR-2): each earlier revival with its participants and totals, added, changed and deleted
 * by the super admin. Those made automatically from a deleted revival are marked.
 */
export function ReferenceRevivalEditor({references, categories}: {
    references: ReferenceRevivalRow[];
    categories: BudgetCategoryValue[]
}) {
    const t = useTranslations();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const [editing, setEditing] = useState<ReferenceRevivalRow | null>(null);
    const [adding, setAdding] = useState(false);

    return (
        <div className="space-y-3">
            <Button onClick={() => setAdding(true)}><Plus/>{t("ReferenceAdmin.create")}</Button>
            {references.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("ReferenceAdmin.empty")}</p>
            ) : (
                <ul className="space-y-2" aria-label={t("ReferenceAdmin.title")}>
                    {references.map(reference => (
                        <li key={reference.id} className="flex gap-3 rounded-lg border p-3">
                            <div className="min-w-0 flex-1 space-y-1">
                                <p className="font-medium">{reference.label}</p>
                                <div className="flex flex-wrap gap-2 text-sm">
                                    <Badge variant="secondary">{reference.year}</Badge>
                                    {reference.participants ? <Badge
                                        variant="secondary">{t("Budget.participantCount", {count: reference.participants})}</Badge> : null}
                                    {reference.automatic &&
                                        <Badge variant="outline">{t("ReferenceAdmin.automatic")}</Badge>}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {t("ReferenceAdmin.totals")} <AmountText
                                    value={total(reference, "INCOME", "actual") ?? total(reference, "INCOME", "budgeted")}/>
                                    {" / "}<AmountText
                                    value={total(reference, "COST", "actual") ?? total(reference, "COST", "budgeted")}/>
                                </p>
                                {reference.comment &&
                                    <p className="text-sm text-muted-foreground">{reference.comment}</p>}
                            </div>
                            <div className="flex shrink-0 items-start gap-1">
                                <Button size="icon" variant="ghost"
                                        aria-label={t("ReferenceAdmin.edit", {label: reference.label})}
                                        onClick={() => setEditing(reference)}>
                                    <Pencil/>
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger render={<Button size="icon" variant="ghost"
                                                                        aria-label={t("ReferenceAdmin.delete", {label: reference.label})}
                                                                        disabled={pending}/>}>
                                        <Trash2/>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>{t("ReferenceAdmin.deleteTitle", {label: reference.label})}</AlertDialogTitle>
                                            <AlertDialogDescription>{t("ReferenceAdmin.deleteDescription")}</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>{t("Common.cancel")}</AlertDialogCancel>
                                            <AlertDialogAction variant="destructive" disabled={pending}
                                                               onClick={() => startTransition(async () => {
                                                                   feedback(await deleteReferenceRevivalAction({
                                                                       id: reference.id,
                                                                       version: reference.version
                                                                   }), t("ReferenceAdmin.deleted"));
                                                               })}>
                                                {t("Common.delete")}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {(adding || editing) && (
                <ReferenceSheet key={editing?.id ?? "new"} reference={editing} categories={categories}
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
