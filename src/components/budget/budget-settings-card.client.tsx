"use client";

import {useId, useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Pencil} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardAction, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {DateInput} from "@/components/date-input.client";
import {AmountText} from "@/components/budget/budget-labels";
import {updateBudgetSettingsAction} from "@/app/(app)/revivals/[id]/budget/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {amountInputValue} from "@/lib/budget/amount";
import {type BudgetSettingsValues, budgetSettingsValuesSchema} from "@/lib/budget/schema";
import {formatDate} from "@/utils/format";

export type BudgetSettingsValue = {
    participantsPlanned?: number | null;
    participationFee?: string | null;
    loanAmount?: string | null;
    loanReceivedOn?: string | null;
    loanRepaidOn?: string | null;
    version: number;
};

function SettingsDialog({revivalId, settings, onOpenChange}: { revivalId: string; settings: BudgetSettingsValue; onOpenChange: (open: boolean) => void }) {
    const t = useTranslations();
    const id = useId();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const form = useForm<BudgetSettingsValues>({
        resolver: zodResolver(budgetSettingsValuesSchema),
        defaultValues: {
            participantsPlanned: settings.participantsPlanned?.toString() ?? "",
            participationFee: amountInputValue(settings.participationFee),
            loanAmount: amountInputValue(settings.loanAmount),
            loanReceivedOn: settings.loanReceivedOn ?? "",
            loanRepaidOn: settings.loanRepaidOn ?? "",
        },
    });
    const {errors} = form.formState;
    const error = (message?: string) => message && <p className="text-sm text-destructive">{t(`Validation.${message}`)}</p>;

    return (
        <Dialog open onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("Budget.settingsTitle")}</DialogTitle>
                    <DialogDescription>{t("Budget.settingsDescription")}</DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={form.handleSubmit(values => startTransition(async () => {
                    if (feedback(await updateBudgetSettingsAction({revivalId, version: settings.version, values}), t("Common.saved"))) {
                        onOpenChange(false);
                    }
                }))}>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor={`${id}-participants`}>{t("Budget.participantsPlanned")}</Label>
                            <Input id={`${id}-participants`} inputMode="numeric" autoComplete="off" {...form.register("participantsPlanned")}/>
                            {error(errors.participantsPlanned?.message)}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`${id}-fee`}>{t("Budget.participationFee")}</Label>
                            <Input id={`${id}-fee`} inputMode="decimal" autoComplete="off" {...form.register("participationFee")}/>
                            {error(errors.participationFee?.message)}
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor={`${id}-loan`}>{t("Budget.loanAmount")}</Label>
                            <Input id={`${id}-loan`} inputMode="decimal" autoComplete="off" {...form.register("loanAmount")}/>
                            <p className="text-xs text-muted-foreground">{t("Budget.loanHelp")}</p>
                            {error(errors.loanAmount?.message)}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`${id}-received`}>{t("Budget.loanReceivedOn")}</Label>
                            <DateInput id={`${id}-received`} {...form.register("loanReceivedOn")}/>
                            {error(errors.loanReceivedOn?.message)}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`${id}-repaid`}>{t("Budget.loanRepaidOn")}</Label>
                            <DateInput id={`${id}-repaid`} {...form.register("loanRepaidOn")}/>
                            {error(errors.loanRepaidOn?.message)}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("Common.cancel")}</Button>
                        <Button type="submit" disabled={pending}>{t("Common.save")}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

/**
 * The budget's settings: planned participants and fee, which lines per participant and scenarios use, and the loan from
 * FGV/JK with when it came and was paid back. Writers change them in a dialog.
 */
export function BudgetSettingsCard({revivalId, settings, canWrite}: { revivalId: string; settings: BudgetSettingsValue; canWrite: boolean }) {
    const t = useTranslations("Budget");
    const [editing, setEditing] = useState(false);
    const notSet = <span className="text-muted-foreground">{t("notSet")}</span>;

    return (
        <Card role="region" aria-label={t("settings")}>
            <CardHeader>
                <CardTitle>{t("settings")}</CardTitle>
                {canWrite && (
                    <CardAction>
                        <Button size="sm" variant="outline" onClick={() => setEditing(true)}><Pencil/>{t("editSettings")}</Button>
                    </CardAction>
                )}
            </CardHeader>
            <CardContent>
                <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
                    <dt className="text-muted-foreground">{t("participantsPlanned")}</dt>
                    <dd>{settings.participantsPlanned ?? notSet}</dd>
                    <dt className="text-muted-foreground">{t("participationFee")}</dt>
                    <dd>{settings.participationFee ? <AmountText value={settings.participationFee}/> : notSet}</dd>
                    <dt className="text-muted-foreground">{t("loanAmount")}</dt>
                    <dd>{settings.loanAmount ? <AmountText value={settings.loanAmount}/> : notSet}</dd>
                    <dt className="text-muted-foreground">{t("loanReceivedOn")}</dt>
                    <dd className="tabular-nums">{formatDate(settings.loanReceivedOn) ?? notSet}</dd>
                    <dt className="text-muted-foreground">{t("loanRepaidOn")}</dt>
                    <dd className="tabular-nums">{formatDate(settings.loanRepaidOn) ?? notSet}</dd>
                </dl>
            </CardContent>
            {editing && <SettingsDialog revivalId={revivalId} settings={settings} onOpenChange={setEditing}/>}
        </Card>
    );
}
