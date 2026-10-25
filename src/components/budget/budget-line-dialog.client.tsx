"use client";

import {useId, useTransition} from "react";
import {useTranslations} from "next-intl";
import {useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {NativeSelect} from "@/components/ui/native-select";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle} from "@/components/ui/sheet";
import {Textarea} from "@/components/ui/textarea";
import {AmountText, type BudgetCategoryValue, CategorySelect} from "@/components/budget/budget-labels";
import {createBudgetLineAction, updateBudgetLineAction} from "@/app/(app)/revivals/[id]/budget/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {amountInputValue, lineAmount} from "@/lib/budget/amount";
import {type BudgetLineValues, budgetLineValuesSchema, MAX_BUDGET_COMMENT, MAX_BUDGET_TEXT} from "@/lib/budget/schema";
import {formatDate} from "@/utils/format";

export type BudgetEventOption = { id: string; title: string; startDate: string };
export type BudgetDecisionOption = { id: string; number: number; text: string };

export type EditableBudgetLine = {
    id: string;
    version: number;
    category: BudgetCategoryValue;
    description: string;
    quantity: number;
    unitAmount: string;
    event?: { id: string } | null;
    logEntry?: { id: string } | null;
    comment?: string | null;
};

/** What a proposal fills in, and the event type line it came from. */
export type BudgetLinePrefill = Partial<BudgetLineValues> & { eventTypeLineId?: string };

/** A quantity as people type it: "1,5". */
export const quantityText = (quantity: number | null | undefined) => quantity === null || quantity === undefined ? "" : String(quantity).replace(".", ",");

function initialValues(line: EditableBudgetLine | null, prefill: BudgetLinePrefill | null): BudgetLineValues {
    if (line) {
        return {
            categoryId: line.category.id,
            description: line.description,
            quantity: quantityText(line.quantity),
            unitAmount: amountInputValue(line.unitAmount),
            eventId: line.event?.id ?? "",
            logEntryId: line.logEntry?.id ?? "",
            comment: line.comment ?? "",
        };
    }
    return {
        categoryId: "", description: "", quantity: "1", unitAmount: "", eventId: "", logEntryId: "", comment: "",
        ...prefill,
    };
}

/**
 * Adds a budget line, freely or from an event's proposal, or changes one. The amount follows quantity × unit
 * amount as typed; a line may name the event it belongs to and the DECISION row behind it.
 */
export function BudgetLineDialog({revivalId, categories, events, decisions, line, prefill = null, onOpenChange}: {
    revivalId: string;
    categories: BudgetCategoryValue[];
    events: BudgetEventOption[];
    decisions: BudgetDecisionOption[];
    line: EditableBudgetLine | null;
    prefill?: BudgetLinePrefill | null;
    onOpenChange: (open: boolean) => void;
}) {
    const t = useTranslations();
    const id = useId();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const form = useForm<BudgetLineValues>({
        resolver: zodResolver(budgetLineValuesSchema),
        defaultValues: initialValues(line, prefill)
    });
    const [quantity, unitAmount] = useWatch({control: form.control, name: ["quantity", "unitAmount"]});
    const {errors} = form.formState;
    const error = (message?: string) => message &&
        <p className="text-sm text-destructive">{t(`Validation.${message}`)}</p>;
    const amount = lineAmount(quantity, unitAmount.trim() ? unitAmount : null);

    return (
        <Sheet open onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[600px] flex flex-col gap-0 p-0 h-full">
                <SheetHeader className="p-6 pb-4 shrink-0">
                    <SheetTitle>{line ? t("Budget.editLine") : t("Budget.newLine")}</SheetTitle>
                    <SheetDescription>{t("Budget.lineDescription")}</SheetDescription>
                </SheetHeader>
                <form className="flex min-h-0 flex-1 flex-col overflow-hidden"
                      onSubmit={form.handleSubmit(values => startTransition(async () => {
                          const result = line
                              ? await updateBudgetLineAction({revivalId, id: line.id, version: line.version, values})
                              : await createBudgetLineAction({
                                  revivalId,
                                  eventTypeLineId: prefill?.eventTypeLineId,
                                  values
                              });

                          if (feedback(result, line ? t("Common.saved") : t("Budget.lineCreated"))) {
                              onOpenChange(false);
                          }
                      }))}>
                    <ScrollArea className="min-h-0 flex-1 border-t">
                        <div className="space-y-4 px-6 py-6 pb-12">
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-category`}>{t("Budget.category")}</Label>
                                <CategorySelect id={`${id}-category`} categories={categories} held={line?.category}
                                                aria-invalid={errors.categoryId ? true : undefined} {...form.register("categoryId")}/>
                                {error(errors.categoryId?.message)}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-description`}>{t("Budget.description")}</Label>
                                <Input id={`${id}-description`} maxLength={MAX_BUDGET_TEXT}
                                       aria-invalid={errors.description ? true : undefined}
                                       {...form.register("description")}/>
                                {error(errors.description?.message)}
                            </div>
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-quantity`}>{t("Budget.quantity")}</Label>
                                    <Input id={`${id}-quantity`} inputMode="decimal" autoComplete="off"
                                           className="tabular-nums" {...form.register("quantity")}/>
                                    {error(errors.quantity?.message)}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-unit`}>{t("Budget.unitAmount")}</Label>
                                    <Input id={`${id}-unit`} inputMode="decimal" autoComplete="off"
                                           className="tabular-nums" {...form.register("unitAmount")}/>
                                    {error(errors.unitAmount?.message)}
                                </div>
                                <div className="space-y-2">
                                    <span className="text-sm font-medium">{t("Budget.amount")}</span>
                                    <p className="flex h-9 items-center text-sm font-medium" aria-live="polite"
                                       data-testid="line-amount">
                                        <AmountText value={amount}/>
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-event`}>{t("Budget.event")}</Label>
                                <NativeSelect className="w-full" id={`${id}-event`} {...form.register("eventId")}>
                                    <option value="">{t("Budget.noEvent")}</option>
                                    {events.map(event => <option key={event.id}
                                                                 value={event.id}>{formatDate(event.startDate)} {event.title}</option>)}
                                </NativeSelect>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-decision`}>{t("Budget.decision")}</Label>
                                <NativeSelect className="w-full" id={`${id}-decision`} {...form.register("logEntryId")}>
                                    <option value="">{t("Budget.noDecision")}</option>
                                    {decisions.map(decision => (
                                        <option key={decision.id} value={decision.id}>
                                            #{decision.number} {decision.text.length > 80 ? `${decision.text.slice(0, 79)}…` : decision.text}
                                        </option>
                                    ))}
                                </NativeSelect>
                                <p className="text-xs text-muted-foreground">{t("Budget.decisionHelp")}</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-comment`}>{t("Budget.comment")}</Label>
                                <Textarea id={`${id}-comment`} rows={3}
                                          maxLength={MAX_BUDGET_COMMENT} {...form.register("comment")}/>
                                {error(errors.comment?.message)}
                            </div>
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
