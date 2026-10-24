"use client";

import {useId, useTransition} from "react";
import {useTranslations} from "next-intl";
import {useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Check, CircleHelp, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {describedBy, FieldErrorText, TOUCH_FIELD} from "@/components/participation/participation-section";
import {setAvailabilityAction} from "@/app/(app)/revivals/[id]/me/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {useWeekday} from "@/hooks/use-weekday";
import {answerFor, type AvailabilityDayValue, eventDays} from "@/lib/staffing/staffing";
import {AVAILABILITY_ANSWERS, type AvailabilityValues, availabilityValuesSchema, MAX_AVAILABILITY_COMMENT} from "@/lib/staffing/schema";
import {formatDate} from "@/utils/format";
import {track} from "@/utils/umami";
import {cn} from "@/utils/utils";

const ICONS = {YES: Check, MAYBE: CircleHelp, NO: X} as const;

export type AvailabilityEvent = { id: string; title: string; startDate: string; endDate: string; startTime?: string | null; location?: string | null };

/** The form's values for an event: one row per day, with what was answered before. */
export function availabilityDefaults(event: AvailabilityEvent, answers: AvailabilityDayValue[]): AvailabilityValues {
    return {
        days: eventDays(event).map(date => {
            const answer = answerFor(answers, event.id, date);

            return {date, answer: answer?.answer ?? "", comment: answer?.comment ?? ""};
        }),
    };
}

/**
 * The participant's availability for one event (M6B-FR-1): per day yes, maybe or no as large native radio buttons, and
 * a short comment ("bad back, OK to do other things"). Saving sends only the days that changed.
 */
export function AvailabilityForm({revivalId, event, answers}: { revivalId: string; event: AvailabilityEvent; answers: AvailabilityDayValue[] }) {
    const t = useTranslations();
    const weekday = useWeekday();
    const id = useId();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const initial = availabilityDefaults(event, answers);
    const form = useForm<AvailabilityValues>({resolver: zodResolver(availabilityValuesSchema), defaultValues: initial});
    const days = useWatch({control: form.control, name: "days"});
    const {errors} = form.formState;
    const headingId = `${id}-heading`;

    return (
        <form aria-labelledby={headingId} className="flex flex-col gap-4" noValidate onSubmit={form.handleSubmit(values => startTransition(async () => {
            const before = form.formState.defaultValues?.days ?? [];
            const changed = values.days.filter((day, index) => day.answer !== (before[index]?.answer ?? "") || day.comment !== (before[index]?.comment ?? ""));

            if (changed.length === 0) {
                return;
            }
            if (feedback(await setAvailabilityAction({revivalId, eventId: event.id, values: {days: changed}}), t("Availability.saved"))) {
                track("availability-set", {days: changed.length});
                form.reset(values, {keepFieldsRef: true});
            }
        }))}>
            <div>
                <h4 id={headingId} className="font-medium">{event.title}</h4>
                <p className="text-sm text-muted-foreground tabular-nums">
                    {[event.startDate === event.endDate ? formatDate(event.startDate) : `${formatDate(event.startDate)} – ${formatDate(event.endDate)}`, event.location]
                        .filter(Boolean).join(" · ")}
                </p>
            </div>
            {initial.days.map((day, index) => {
                const fieldId = `${id}-${day.date}`;
                const error = errors.days?.[index]?.comment?.message;

                return (
                    <fieldset key={day.date} className="flex flex-col gap-2 rounded-lg border p-3">
                        <legend className="px-1 text-sm font-medium"><span className="capitalize">{weekday(day.date)}</span> <span className="tabular-nums">{formatDate(day.date)}</span></legend>
                        <div className="grid grid-cols-3 gap-2">
                            {AVAILABILITY_ANSWERS.map(answer => {
                                const Icon = ICONS[answer];

                                return (
                                    <label key={answer} className={cn(
                                        "flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border-2 px-2 text-sm font-medium transition-colors",
                                        "has-checked:border-primary has-checked:bg-primary/10 has-focus-visible:ring-3 has-focus-visible:ring-ring/50 hover:bg-accent",
                                    )}>
                                        <input type="radio" value={answer} className="size-5 shrink-0 accent-primary" {...form.register(`days.${index}.answer`)}/>
                                        <Icon className="hidden size-4 text-muted-foreground sm:block" aria-hidden/>
                                        {t(`Availability.answers.${answer}`)}
                                    </label>
                                );
                            })}
                        </div>
                        {days?.[index]?.answer && (
                            <div className="flex flex-col gap-1">
                                <Label htmlFor={`${fieldId}-comment`} className="text-muted-foreground">{t("Availability.comment")}</Label>
                                <Input id={`${fieldId}-comment`} maxLength={MAX_AVAILABILITY_COMMENT} autoComplete="off" className={TOUCH_FIELD}
                                       placeholder={t("Availability.commentPlaceholder")}
                                       {...describedBy(`${fieldId}-comment`, {error})} {...form.register(`days.${index}.comment`)}/>
                                <FieldErrorText fieldId={`${fieldId}-comment`} message={error ? t(`Validation.${error}`) : null}/>
                            </div>
                        )}
                        {days?.[index]?.answer && (
                            <Button type="button" variant="link" className="h-auto self-start p-0 text-sm"
                                    onClick={() => form.setValue(`days.${index}`, {date: day.date, answer: "", comment: ""}, {shouldDirty: true})}>
                                {t("Availability.clear")}
                            </Button>
                        )}
                    </fieldset>
                );
            })}
            <Button type="submit" size="lg" className="h-11 w-full sm:w-auto sm:self-start" disabled={pending}>
                {t("Availability.save")}
            </Button>
        </form>
    );
}
