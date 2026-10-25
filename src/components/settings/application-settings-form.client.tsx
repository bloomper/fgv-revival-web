"use client";

import {useId, useTransition} from "react";
import {useTranslations} from "next-intl";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import type {LocalizedTextValue} from "@/components/guide/localized";
import {updateApplicationSettingsAction} from "@/app/(app)/admin/settings/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {amountInputValue} from "@/lib/budget/amount";
import {type ApplicationSettingsValues, applicationSettingsValuesSchema, MAX_SETTINGS_TERMS} from "@/lib/settings/schema";

/**
 * The terms every participant accepts, in Swedish and optionally English, and the participation fee a new revival's
 * budget starts with.
 */
export function ApplicationSettingsForm({settings}: {
    settings: { terms?: LocalizedTextValue | null; defaultParticipationFee?: string | null; version: number }
}) {
    const t = useTranslations();
    const id = useId();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const form = useForm<ApplicationSettingsValues>({
        resolver: zodResolver(applicationSettingsValuesSchema),
        values: {
            terms: {sv: settings.terms?.sv ?? "", en: settings.terms?.en ?? ""},
            defaultParticipationFee: amountInputValue(settings.defaultParticipationFee),
        },
    });
    const {errors} = form.formState;
    const error = (message?: string) => message &&
        <p className="text-sm text-destructive">{t(`Validation.${message}`)}</p>;

    return (
        <form className="max-w-2xl space-y-6"
              onSubmit={form.handleSubmit(values => startTransition(async () => {
                  feedback(await updateApplicationSettingsAction({version: settings.version, values}), t("Common.saved"));
              }))}>
            <fieldset className="space-y-2">
                <legend className="text-sm font-medium">{t("Settings.terms")}</legend>
                <p className="text-xs text-muted-foreground">{t("Settings.termsHelp")}</p>
                <Label htmlFor={`${id}-terms-sv`} className="text-muted-foreground">{t("Library.swedish")}</Label>
                <Textarea id={`${id}-terms-sv`} rows={5} maxLength={MAX_SETTINGS_TERMS} {...form.register("terms.sv")}/>
                <Label htmlFor={`${id}-terms-en`} className="text-muted-foreground">{t("Library.english")}</Label>
                <Textarea id={`${id}-terms-en`} rows={5} maxLength={MAX_SETTINGS_TERMS} {...form.register("terms.en")}/>
                {error(errors.terms?.sv?.message ?? errors.terms?.en?.message)}
            </fieldset>
            <div className="space-y-2">
                <Label htmlFor={`${id}-fee`}>{t("Settings.defaultFee")}</Label>
                <Input id={`${id}-fee`} className="w-40 tabular-nums" inputMode="decimal" autoComplete="off"
                       {...form.register("defaultParticipationFee")}/>
                <p className="text-xs text-muted-foreground">{t("Settings.defaultFeeHelp")}</p>
                {error(errors.defaultParticipationFee?.message)}
            </div>
            <Button type="submit" disabled={pending}>{t("Common.save")}</Button>
        </form>
    );
}
