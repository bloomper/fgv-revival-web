"use client";

import * as React from "react";
import {useId, useState, useTransition} from "react";
import {useLocale, useTranslations} from "next-intl";
import {Controller, useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {NativeSelect} from "@/components/ui/native-select";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle} from "@/components/ui/sheet";
import {DateInput} from "@/components/date-input.client";
import {OwnerField, type OwnerMember} from "@/components/owner/owner-field.client";
import {catalogName} from "@/components/catalog/catalog";
import {type BudgetCategoryValue, CategorySelect} from "@/components/budget/budget-labels";
import {uploadReceipt} from "@/components/budget/receipt";
import {useReceiptFeedback} from "@/components/budget/use-receipt-feedback.client";
import {createTransactionAction, updateTransactionAction} from "@/app/(app)/revivals/[id]/budget/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {amountInputValue} from "@/lib/budget/amount";
import {MAX_BUDGET_TEXT, receiptProblem, RECEIPT_TYPES, type TransactionValues, transactionValuesSchema} from "@/lib/budget/schema";
import {track} from "@/utils/umami";

export type BudgetLineOption = { id: string; description: string; category: { id: string } };

export type EditableTransaction = {
    id: string;
    version: number;
    date: string;
    amount: string;
    category: BudgetCategoryValue;
    description: string;
    budgetLine?: { id: string; description: string } | null;
    paidBy?: { person?: { id: string; displayName?: string | null } | null; name?: string | null } | null;
};

const today = () => new Date().toLocaleDateString("sv-SE", {timeZone: "Europe/Stockholm"});

function initialValues(transaction: EditableTransaction | null): TransactionValues {
    return {
        date: transaction?.date ?? today(),
        amount: amountInputValue(transaction?.amount),
        categoryId: transaction?.category.id ?? "",
        description: transaction?.description ?? "",
        budgetLineId: transaction?.budgetLine?.id ?? "",
        paidBy: transaction?.paidBy?.person ? {personId: transaction.paidBy.person.id} : transaction?.paidBy?.name ? {name: transaction.paidBy.name} : null,
    };
}

/**
 * Adds a transaction or changes one (M5): a cost or income on a date, in a category, optionally against a budget line.
 * For a cost, who paid it out of their own pocket; a receipt can be chosen here and is uploaded right after saving.
 */
export function TransactionDialog({revivalId, categories, lines, members, transaction, onOpenChange}: {
    revivalId: string;
    categories: BudgetCategoryValue[];
    lines: BudgetLineOption[];
    members: OwnerMember[];
    transaction: EditableTransaction | null;
    onOpenChange: (open: boolean) => void;
}) {
    const t = useTranslations();
    const id = useId();
    const locale = useLocale();
    const feedback = useActionFeedback();
    const receiptFeedback = useReceiptFeedback();
    const [pending, startTransition] = useTransition();
    const [file, setFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const form = useForm<TransactionValues>({resolver: zodResolver(transactionValuesSchema), defaultValues: initialValues(transaction)});
    const categoryId = useWatch({control: form.control, name: "categoryId"});
    const {errors} = form.formState;
    const error = (message?: string | null) => message && <p className="text-sm text-destructive">{t(`Validation.${message}`)}</p>;
    const category = categories.find(candidate => candidate.id === categoryId) ?? (transaction?.category.id === categoryId ? transaction.category : undefined);
    const cost = category?.kind === "COST";
    const categoryNames = new Map(categories.map(candidate => [candidate.id, catalogName(candidate, locale)]));

    return (
        <Sheet open onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[600px] flex flex-col gap-0 p-0 h-full">
                <SheetHeader className="p-6 pb-4 shrink-0">
                    <SheetTitle>{transaction ? t("Budget.editTransaction") : t("Budget.newTransaction")}</SheetTitle>
                    <SheetDescription>{t("Budget.transactionDescription")}</SheetDescription>
                </SheetHeader>
                <form className="flex min-h-0 flex-1 flex-col overflow-hidden" onSubmit={form.handleSubmit(values => startTransition(async () => {
                    if (file && receiptProblem(file)) {
                        return;
                    }

                    const result = transaction
                        ? await updateTransactionAction({revivalId, id: transaction.id, version: transaction.version, cost, values})
                        : await createTransactionAction({revivalId, cost, values});

                    if (!feedback(result, transaction ? t("Common.saved") : t("Budget.transactionCreated"))) {
                        return;
                    }
                    if (!transaction) {
                        track("transaction-create", {receipt: !!file});
                    }

                    const transactionId = transaction?.id ?? (result.data as { id: string } | null)?.id;

                    if (file && transactionId) {
                        receiptFeedback(await uploadReceipt(transactionId, file), t("Budget.receiptUploaded"));
                    }
                    onOpenChange(false);
                }))}>
                    <ScrollArea className="min-h-0 flex-1 border-t">
                        <div className="space-y-4 px-6 py-6 pb-12">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-date`}>{t("Budget.date")}</Label>
                                    <DateInput id={`${id}-date`} {...form.register("date")}/>
                                    {error(errors.date?.message)}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-amount`}>{t("Budget.amount")}</Label>
                                    <Input id={`${id}-amount`} inputMode="decimal" autoComplete="off" className="tabular-nums"
                                           aria-invalid={errors.amount ? true : undefined} {...form.register("amount")}/>
                                    {error(errors.amount?.message)}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-category`}>{t("Budget.category")}</Label>
                                <CategorySelect id={`${id}-category`} categories={categories} held={transaction?.category}
                                                aria-invalid={errors.categoryId ? true : undefined} {...form.register("categoryId")}/>
                                {error(errors.categoryId?.message)}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-description`}>{t("Budget.description")}</Label>
                                <Input id={`${id}-description`} maxLength={MAX_BUDGET_TEXT} aria-invalid={errors.description ? true : undefined}
                                       {...form.register("description")}/>
                                {error(errors.description?.message)}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-line`}>{t("Budget.budgetLine")}</Label>
                                <NativeSelect className="w-full" id={`${id}-line`} {...form.register("budgetLineId")}>
                                    <option value="">{t("Budget.noBudgetLine")}</option>
                                    {transaction?.budgetLine && !lines.some(line => line.id === transaction.budgetLine?.id) && (
                                        <option value={transaction.budgetLine.id}>{transaction.budgetLine.description}</option>
                                    )}
                                    {lines.map(line => (
                                        <option key={line.id} value={line.id}>
                                            {categoryNames.get(line.category.id) ? `${categoryNames.get(line.category.id)}: ` : ""}{line.description}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </div>
                            {cost && (
                                <Controller control={form.control} name="paidBy" render={({field}) => (
                                    <div className="space-y-1">
                                        <OwnerField members={members} value={field.value ?? null} onChange={field.onChange} current={transaction?.paidBy?.person}
                                                    label={t("Budget.paidBy")} noneLabel={t("Budget.paidFromAccount")}/>
                                        <p className="text-xs text-muted-foreground">{t("Budget.paidByHelp")}</p>
                                        {error(errors.paidBy?.name?.message)}
                                    </div>
                                )}/>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-receipt`}>{t("Budget.receipt")}</Label>
                                <Input id={`${id}-receipt`} type="file" accept={RECEIPT_TYPES.join(",")}
                                       onChange={(change: React.ChangeEvent<HTMLInputElement>) => {
                                           const chosen = change.target.files?.[0] ?? null;

                                           setFile(chosen);
                                           setFileError(chosen ? receiptProblem(chosen) : null);
                                       }}/>
                                <p className="text-xs text-muted-foreground">{t("Budget.receiptHelp")}</p>
                                {error(fileError)}
                            </div>
                        </div>
                    </ScrollArea>
                    <SheetFooter className="p-6 pt-4 border-t bg-muted/30 shrink-0 mt-auto">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("Common.cancel")}</Button>
                        <Button type="submit" disabled={pending}>{t("Common.save")}</Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
