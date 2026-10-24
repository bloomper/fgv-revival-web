"use client";

import {useId, useState, useTransition} from "react";
import {useLocale, useTranslations} from "next-intl";
import {useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Pencil, Plus, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {NativeSelect} from "@/components/ui/native-select";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle} from "@/components/ui/sheet";
import {type LocalizedTextValue, pickText} from "@/components/guide/localized";
import {AmountText, type BudgetCategoryValue, CategorySelect} from "@/components/budget/budget-labels";
import {quantityText} from "@/components/budget/budget-line-dialog.client";
import {
    createEventTypeBudgetLineAction,
    removeEventTypeBudgetLineAction,
    updateEventTypeBudgetLineAction,
} from "@/app/(app)/admin/event-types/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {amountInputValue} from "@/lib/budget/amount";
import {
    BUDGET_LINE_QUANTITIES,
    type EventTypeBudgetLineValues,
    eventTypeBudgetLineValuesSchema,
    MAX_BUDGET_TEXT,
} from "@/lib/budget/schema";

export type EventTypeBudgetLineRow = {
    id: string;
    category: BudgetCategoryValue;
    description: LocalizedTextValue;
    quantityRule: "FIXED" | "PER_PARTICIPANT";
    quantity?: number | null;
    unitAmount: string;
    version: number;
};

function LineSheet({eventTypeId, line, categories, onOpenChange}: {
    eventTypeId: string;
    line: EventTypeBudgetLineRow | null;
    categories: BudgetCategoryValue[];
    onOpenChange: (open: boolean) => void;
}) {
    const t = useTranslations();
    const id = useId();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const form = useForm<EventTypeBudgetLineValues>({
        resolver: zodResolver(eventTypeBudgetLineValuesSchema),
        defaultValues: {
            categoryId: line?.category.id ?? "",
            description: {sv: line?.description.sv ?? "", en: line?.description.en ?? ""},
            quantityRule: line?.quantityRule ?? "PER_PARTICIPANT",
            quantity: quantityText(line?.quantity),
            unitAmount: amountInputValue(line?.unitAmount),
        },
    });
    const rule = useWatch({control: form.control, name: "quantityRule"});
    const {errors} = form.formState;
    const error = (message?: string) => message &&
        <p className="text-sm text-destructive">{t(`Validation.${message}`)}</p>;

    return (
        <Sheet open onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[600px] flex flex-col gap-0 p-0 h-full">
                <SheetHeader className="p-6 pb-4 shrink-0">
                    <SheetTitle>{line ? t("EventType.editBudgetLine") : t("EventType.newBudgetLine")}</SheetTitle>
                    <SheetDescription>{t("EventType.budgetLinesHelp")}</SheetDescription>
                </SheetHeader>
                <form className="flex min-h-0 flex-1 flex-col overflow-hidden"
                      onSubmit={form.handleSubmit(values => startTransition(async () => {
                          const result = line
                              ? await updateEventTypeBudgetLineAction({id: line.id, version: line.version, values})
                              : await createEventTypeBudgetLineAction({eventTypeId, values});

                          if (feedback(result, t("Common.saved"))) {
                              onOpenChange(false);
                          }
                      }))}>
                    <ScrollArea className="min-h-0 flex-1 border-t">
                        <div className="space-y-4 px-6 py-6 pb-12">
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-category`}>{t("Budget.category")}</Label>
                                <CategorySelect id={`${id}-category`} categories={categories}
                                                held={line?.category} {...form.register("categoryId")}/>
                                {error(errors.categoryId?.message)}
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-sv`}>{t("EventType.budgetLineSv")}</Label>
                                    <Input id={`${id}-sv`}
                                           maxLength={MAX_BUDGET_TEXT} {...form.register("description.sv")}/>
                                    {error(errors.description?.sv?.message)}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-en`}>{t("EventType.budgetLineEn")}</Label>
                                    <Input id={`${id}-en`}
                                           maxLength={MAX_BUDGET_TEXT} {...form.register("description.en")}/>
                                    {error(errors.description?.en?.message)}
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-rule`}>{t("EventType.quantityRule")}</Label>
                                    <NativeSelect className="w-full"
                                                  id={`${id}-rule`} {...form.register("quantityRule")}>
                                        {BUDGET_LINE_QUANTITIES.map(option => <option key={option}
                                                                                      value={option}>{t(`EventType.quantityRules.${option}`)}</option>)}
                                    </NativeSelect>
                                </div>
                                {rule === "FIXED" && (
                                    <div className="space-y-2">
                                        <Label htmlFor={`${id}-quantity`}>{t("Budget.quantity")}</Label>
                                        <Input id={`${id}-quantity`} inputMode="decimal"
                                               autoComplete="off" {...form.register("quantity")}/>
                                        {error(errors.quantity?.message)}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-unit`}>{t("Budget.unitAmount")}</Label>
                                    <Input id={`${id}-unit`} inputMode="decimal"
                                           autoComplete="off" {...form.register("unitAmount")}/>
                                    {error(errors.unitAmount?.message)}
                                </div>
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

/**
 * The budget lines an event type proposes when a revival has an event of it (M5-FR-3, FR-9): each with its category,
 * a fixed quantity or one per planned participant, and the unit amount.
 */
export function EventTypeBudgetLines({eventTypeId, typeName, lines, categories}: {
    eventTypeId: string;
    typeName: string;
    lines: EventTypeBudgetLineRow[];
    categories: BudgetCategoryValue[];
}) {
    const t = useTranslations();
    const locale = useLocale();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const [editing, setEditing] = useState<EventTypeBudgetLineRow | null>(null);
    const [adding, setAdding] = useState(false);

    return (
        <div className="space-y-1">
            {lines.length > 0 && (
                <ul className="space-y-1 text-sm" aria-label={t("EventType.budgetLinesOf", {name: typeName})}>
                    {lines.map(line => {
                        const description = pickText(line.description, locale).text;

                        return (
                            <li key={line.id} className="flex flex-wrap items-center gap-x-2">
                                <span>{description}</span>
                                <span className="text-muted-foreground">
                                    {line.quantityRule === "FIXED" ? `${quantityText(line.quantity)} ×` : t("EventType.perParticipant")}{" "}
                                    <AmountText value={line.unitAmount}/>
                                </span>
                                <Button size="icon" variant="ghost" className="size-7"
                                        aria-label={t("EventType.editBudgetLineNamed", {name: description})}
                                        onClick={() => setEditing(line)}><Pencil/></Button>
                                <Button size="icon" variant="ghost" className="size-7" disabled={pending}
                                        aria-label={t("EventType.removeBudgetLine", {name: description})}
                                        onClick={() => startTransition(async () => {
                                            feedback(await removeEventTypeBudgetLineAction({
                                                id: line.id,
                                                version: line.version
                                            }), t("EventType.budgetLineRemoved"));
                                        })}><Trash2/></Button>
                            </li>
                        );
                    })}
                </ul>
            )}
            <Button size="sm" variant="ghost" className="-ml-2" onClick={() => setAdding(true)}
                    aria-label={t("EventType.addBudgetLineTo", {name: typeName})}>
                <Plus/>{t("EventType.addBudgetLine")}
            </Button>
            {(adding || editing) && (
                <LineSheet key={editing?.id ?? "new"} eventTypeId={eventTypeId} line={editing} categories={categories}
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
