"use client";

import * as React from "react";
import {useTransition} from "react";
import {useTranslations} from "next-intl";
import {type FieldErrors, type FieldPath, useFieldArray, useForm} from "react-hook-form";
import {Plus, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {updateDetailsAction} from "@/app/(app)/revivals/[id]/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {MAX_VENUES, revivalDetailsSchema} from "@/lib/revival/schema";
import {track} from "@/utils/umami";

type FormValues = { premiereDate: string; showDates: { value: string }[]; venues: { value: string }[] };

/**
 * Premiere date, show dates and venues (FR-009, FR-011). The same rules are checked here and on the server; the
 * server's message is shown when it refuses.
 */
export function RevivalDetailsForm({revival, onDone}: {
    revival: { id: string; year: number; version: number; premiereDate?: string | null; showDates: string[]; venues: string[] };
    onDone: () => void;
}) {
    const t = useTranslations();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const schema = revivalDetailsSchema(revival.year);
    const form = useForm<FormValues>({
        defaultValues: {
            premiereDate: revival.premiereDate ?? "",
            showDates: revival.showDates.map(value => ({value})),
            venues: revival.venues.map(value => ({value})),
        },
        resolver: async (values) => {
            const result = schema.safeParse({
                premiereDate: values.premiereDate,
                showDates: values.showDates.map(entry => entry.value),
                venues: values.venues.map(entry => entry.value),
            });

            if (result.success) {
                return {values, errors: {}};
            }

            const errors: Record<string, unknown> = {};

            for (const issue of result.error.issues) {
                const [field, index] = issue.path;
                const error = {type: issue.code, message: issue.message};

                if (index === undefined) {
                    errors[String(field)] ??= error;
                } else {
                    const list = (errors[String(field)] ??= []) as Array<{ value?: typeof error } | undefined>;

                    list[Number(index)] ??= {value: error};
                }
            }
            return {values: {}, errors: errors as FieldErrors<FormValues>};
        },
    });
    const showDates = useFieldArray({control: form.control, name: "showDates"});
    const venues = useFieldArray({control: form.control, name: "venues"});
    const errorText = (name: FieldPath<FormValues>) => {
        const message = form.getFieldState(name, form.formState).error?.message;

        return message ? t(`Validation.${message}`) : null;
    };

    return (
        <form
            className="space-y-6"
            noValidate
            onSubmit={form.handleSubmit(values => startTransition(async () => {
                const result = await updateDetailsAction({
                    id: revival.id,
                    version: revival.version,
                    premiereDate: values.premiereDate,
                    showDates: values.showDates.map(entry => entry.value),
                    venues: values.venues.map(entry => entry.value),
                });

                if (feedback(result, t("Common.saved"))) {
                    track("revival-details-save");
                    onDone();
                }
            }))}
        >
            <div className="space-y-2">
                <Label htmlFor="premiere-date">{t("Revival.premiereDate")}</Label>
                <Input id="premiere-date" type="date" className="w-fit" {...form.register("premiereDate")}/>
                {errorText("premiereDate") && <p className="text-sm text-destructive" role="alert">{errorText("premiereDate")}</p>}
            </div>

            <fieldset className="space-y-2">
                <legend className="text-sm font-medium">{t("Revival.showDates")}</legend>
                {showDates.fields.map((field, index) => (
                    <div key={field.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Input type="date" className="w-fit" aria-label={`${t("Revival.showDates")} ${index + 1}`}
                                   {...form.register(`showDates.${index}.value`)}/>
                            <Button type="button" variant="ghost" size="icon-sm" aria-label={t("DetailsForm.removeShowDate")}
                                    onClick={() => showDates.remove(index)}><X/></Button>
                        </div>
                        {errorText(`showDates.${index}.value` as const) &&
                            <p className="text-sm text-destructive" role="alert">{errorText(`showDates.${index}.value` as const)}</p>}
                    </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => showDates.append({value: form.getValues("premiereDate") || ""})}>
                    <Plus/>{t("DetailsForm.addShowDate")}
                </Button>
            </fieldset>

            <fieldset className="space-y-2">
                <legend className="text-sm font-medium">{t("Revival.venues")}</legend>
                {venues.fields.map((field, index) => (
                    <div key={field.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Input aria-label={`${t("Revival.venues")} ${index + 1}`} {...form.register(`venues.${index}.value`)}/>
                            <Button type="button" variant="ghost" size="icon-sm" aria-label={t("DetailsForm.removeVenue")}
                                    onClick={() => venues.remove(index)}><X/></Button>
                        </div>
                        {errorText(`venues.${index}.value` as const) &&
                            <p className="text-sm text-destructive" role="alert">{errorText(`venues.${index}.value` as const)}</p>}
                    </div>
                ))}
                <Button type="button" variant="outline" size="sm" disabled={venues.fields.length >= MAX_VENUES}
                        onClick={() => venues.append({value: ""})}>
                    <Plus/>{t("DetailsForm.addVenue")}
                </Button>
            </fieldset>

            <div className="flex gap-2">
                <Button type="submit" disabled={pending}>{t("Common.save")}</Button>
                <Button type="button" variant="outline" onClick={onDone}>{t("Common.cancel")}</Button>
            </div>
        </form>
    );
}
