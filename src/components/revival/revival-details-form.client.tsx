"use client";

import * as React from "react";
import {useTransition} from "react";
import {useTranslations} from "next-intl";
import {type FieldPath, useFieldArray, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Plus, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {DateInput} from "@/components/date-input.client";
import {updateDetailsAction} from "@/app/(app)/revivals/[id]/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {MAX_SHOWS, MAX_VENUE, revivalDetailsSchema, type RevivalDetailsValues} from "@/lib/revival/schema";
import {track} from "@/utils/umami";

function dayAfter(date: string): string {
    const next = new Date(`${date}T00:00:00Z`);

    if (Number.isNaN(next.getTime())) {
        return date;
    }
    next.setUTCDate(next.getUTCDate() + 1);
    return next.toISOString().slice(0, 10);
}

/**
 * Premiere date and the shows, each a date at a venue. The same rules are checked here and on the
 * server; the server's message is shown when it refuses.
 */
export function RevivalDetailsForm({revival, onDone}: {
    revival: {
        id: string;
        year: number;
        version: number;
        premiereDate?: string | null;
        shows: { date: string; time?: string | null; venue?: string | null }[]
    };
    onDone: () => void;
}) {
    const t = useTranslations();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const form = useForm<RevivalDetailsValues>({
        defaultValues: {
            premiereDate: revival.premiereDate ?? "",
            shows: revival.shows.map(show => ({date: show.date, time: show.time ?? "", venue: show.venue ?? ""})),
        },
        resolver: zodResolver(revivalDetailsSchema(revival.year)),
    });
    const shows = useFieldArray({control: form.control, name: "shows"});
    const errorText = (name: FieldPath<RevivalDetailsValues>) => {
        const message = form.getFieldState(name, form.formState).error?.message;

        return message ? t(`Validation.${message}`) : null;
    };
    // A new show is the day after the last one, at the same time and venue: most shows are on following days at one venue
    const nextShow = () => {
        const values = form.getValues();
        const last = values.shows.at(-1);

        return last ? {date: dayAfter(last.date), time: last.time, venue: last.venue} : {
            date: values.premiereDate,
            time: "",
            venue: ""
        };
    };

    return (
        <form
            className="space-y-6"
            noValidate
            onSubmit={form.handleSubmit(values => startTransition(async () => {
                const result = await updateDetailsAction({id: revival.id, version: revival.version, ...values});

                if (feedback(result, t("Common.saved"))) {
                    track("revival-details-save");
                    onDone();
                }
            }))}
        >
            <div className="space-y-2">
                <Label htmlFor="premiere-date">{t("Revival.premiereDate")}</Label>
                <DateInput id="premiere-date" {...form.register("premiereDate")}/>
                {errorText("premiereDate") &&
                    <p className="text-sm text-destructive" role="alert">{errorText("premiereDate")}</p>}
            </div>

            <fieldset className="space-y-2">
                <legend className="text-sm font-medium">{t("Revival.shows")}</legend>
                {shows.fields.map((field, index) => {
                    const error = errorText(`shows.${index}.date`) ?? errorText(`shows.${index}.time`) ?? errorText(`shows.${index}.venue`);

                    return (
                        <div key={field.id} className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                                <DateInput
                                    aria-label={t("DetailsForm.showDate", {number: index + 1})} {...form.register(`shows.${index}.date`)}/>
                                <Input className="w-18 shrink-0 tabular-nums" inputMode="numeric" maxLength={5}
                                       autoComplete="off" placeholder={t("DetailsForm.timePlaceholder")}
                                       aria-label={t("DetailsForm.showTime", {number: index + 1})} {...form.register(`shows.${index}.time`)}/>
                                <Input className="min-w-0 flex-1 basis-40 sm:basis-0" maxLength={MAX_VENUE}
                                       placeholder={t("DetailsForm.venuePlaceholder")}
                                       aria-label={t("DetailsForm.showVenue", {number: index + 1})} {...form.register(`shows.${index}.venue`)}/>
                                <Button type="button" variant="ghost" size="icon-sm"
                                        aria-label={t("DetailsForm.removeShowDate", {number: index + 1})}
                                        onClick={() => shows.remove(index)}><X/></Button>
                            </div>
                            {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
                        </div>
                    );
                })}
                <Button type="button" variant="outline" size="sm" disabled={shows.fields.length >= MAX_SHOWS}
                        onClick={() => shows.append(nextShow())}>
                    <Plus/>{t("DetailsForm.addShowDate")}
                </Button>
            </fieldset>

            <div className="flex gap-2">
                <Button type="submit" disabled={pending}>{t("Common.save")}</Button>
                <Button type="button" variant="outline" onClick={onDone}>{t("Common.cancel")}</Button>
            </div>
        </form>
    );
}
