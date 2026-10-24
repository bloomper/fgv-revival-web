"use client";

import * as React from "react";
import {useId, useState, useTransition} from "react";
import {useLocale, useTranslations} from "next-intl";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {NativeSelect} from "@/components/ui/native-select";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle} from "@/components/ui/sheet";
import {Switch} from "@/components/ui/switch";
import {Textarea} from "@/components/ui/textarea";
import {DateInput} from "@/components/date-input.client";
import {catalogName} from "@/components/catalog/catalog";
import type {LocalizedTextValue} from "@/components/guide/localized";
import {defaultEndDate} from "@/components/event/timeline";
import {createEventAction, updateEventAction} from "@/app/(app)/revivals/[id]/events/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {
    type EventValues,
    eventValuesSchema,
    MAX_EVENT_DESCRIPTION,
    MAX_EVENT_LOCATION,
    MAX_EVENT_TITLE,
} from "@/lib/event/schema";
import {track} from "@/utils/umami";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export type EventTypeOption = {
    id: string;
    name: LocalizedTextValue;
    days: number;
    revivalPays: boolean;
    retired: boolean
};

export type EditableEvent = {
    id: string;
    version: number;
    type?: EventTypeOption | null;
    title: string;
    startDate: string;
    endDate: string;
    startTime?: string | null;
    endTime?: string | null;
    location?: string | null;
    description?: string | null;
    revivalPays: boolean;
};

/** What a proposal fills in: the type and its proposed dates. */
export type EventPrefill = { typeId: string; startDate: string; endDate: string };

function initialValues(event: EditableEvent | null, prefill: EventPrefill | null, types: EventTypeOption[], locale: string): EventValues {
    if (event) {
        return {
            typeId: event.type?.id ?? "",
            title: event.title,
            startDate: event.startDate,
            endDate: event.endDate,
            startTime: event.startTime ?? "",
            endTime: event.endTime ?? "",
            location: event.location ?? "",
            description: event.description ?? "",
            revivalPays: event.revivalPays,
        };
    }

    const type = types.find(candidate => candidate.id === prefill?.typeId);

    return {
        typeId: type?.id ?? "",
        title: type ? catalogName(type, locale) : "",
        startDate: prefill?.startDate ?? "",
        endDate: prefill?.endDate ?? "",
        startTime: "",
        endTime: "",
        location: "",
        description: "",
        revivalPays: type?.revivalPays ?? false,
    };
}

/**
 * Adds an event, from a type or freely, or changes one (M4). The type's name is the default title and its length the
 * default end date; both follow the type and start date until changed by hand. An event's type cannot change.
 */
export function EventDialog({revivalId, types, event, prefill = null, open, onOpenChange}: {
    revivalId: string;
    /** The active types. */
    types: EventTypeOption[];
    event: EditableEvent | null;
    prefill?: EventPrefill | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const t = useTranslations();
    const id = useId();
    const locale = useLocale();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const [endChanged, setEndChanged] = useState(!!event);
    const form = useForm<EventValues>({
        resolver: zodResolver(eventValuesSchema),
        defaultValues: initialValues(event, prefill, types, locale),
    });
    const {errors} = form.formState;
    const typeOf = (typeId: string) => types.find(type => type.id === typeId);
    const error = (message?: string) => message &&
        <p className="text-sm text-destructive">{t(`Validation.${message}`)}</p>;

    const followType = (typeId: string) => {
        const previous = typeOf(form.getValues("typeId"));
        const next = typeOf(typeId);
        const title = form.getValues("title");
        const start = form.getValues("startDate");

        if (!title || (previous && title === catalogName(previous, locale))) {
            form.setValue("title", next ? catalogName(next, locale) : "");
        }
        form.setValue("revivalPays", next?.revivalPays ?? false);
        if (!endChanged && ISO_DATE.test(start)) {
            form.setValue("endDate", defaultEndDate(start, next?.days ?? 1));
        }
    };

    const followStart = (start: string) => {
        if (!endChanged && ISO_DATE.test(start)) {
            form.setValue("endDate", defaultEndDate(start, typeOf(form.getValues("typeId"))?.days ?? 1));
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[600px] flex flex-col gap-0 p-0 h-full">
                <SheetHeader className="p-6 pb-4 shrink-0">
                    <SheetTitle>{event ? t("Event.editTitle") : t("Event.newTitle")}</SheetTitle>
                    <SheetDescription>{t("Event.dialogDescription")}</SheetDescription>
                </SheetHeader>
                <form className="flex min-h-0 flex-1 flex-col overflow-hidden"
                      onSubmit={form.handleSubmit(values => startTransition(async () => {
                          if (event) {
                              if (feedback(await updateEventAction({
                                  id: event.id,
                                  version: event.version,
                                  revivalId,
                                  values
                              }), t("Common.saved"))) {
                                  onOpenChange(false);
                              }
                          } else if (feedback(await createEventAction({revivalId, values}), t("Event.created"))) {
                              track("event-create", {typed: !!values.typeId});
                              onOpenChange(false);
                          }
                      }))}>
                    <ScrollArea className="min-h-0 flex-1 border-t">
                        <div className="space-y-4 px-6 py-6 pb-12">
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-type`}>{t("Event.type")}</Label>
                                {event ? (
                                    <p id={`${id}-type`}
                                       className="text-sm">{event.type ? catalogName(event.type, locale) : t("Event.otherType")}</p>
                                ) : (
                                    <NativeSelect className="w-full" id={`${id}-type`}
                                                  {...form.register("typeId", {onChange: (change: React.ChangeEvent<HTMLSelectElement>) => followType(change.target.value)})}>
                                        {types.map(type => <option key={type.id}
                                                                   value={type.id}>{catalogName(type, locale)}</option>)}
                                        <option value="">{t("Event.otherType")}</option>
                                    </NativeSelect>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-title`}>{t("Event.titleLabel")}</Label>
                                <Input id={`${id}-title`} maxLength={MAX_EVENT_TITLE}
                                       aria-invalid={errors.title ? true : undefined} {...form.register("title")}/>
                                {error(errors.title?.message)}
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-start`}>{t("Event.startDate")}</Label>
                                    <DateInput
                                        id={`${id}-start`} {...form.register("startDate", {onChange: (change: React.ChangeEvent<HTMLInputElement>) => followStart(change.target.value)})}/>
                                    {error(errors.startDate?.message)}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-end`}>{t("Event.endDate")}</Label>
                                    <DateInput id={`${id}-end`} {...form.register("endDate", {
                                        onChange: () => {
                                            setEndChanged(true);
                                        }
                                    })}/>
                                    {error(errors.endDate?.message)}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-start-time`}>{t("Event.startTime")}</Label>
                                    <Input id={`${id}-start-time`} className="w-24 tabular-nums" inputMode="numeric"
                                           maxLength={5} autoComplete="off"
                                           placeholder={t("DetailsForm.timePlaceholder")} {...form.register("startTime")}/>
                                    {error(errors.startTime?.message)}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-end-time`}>{t("Event.endTime")}</Label>
                                    <Input id={`${id}-end-time`} className="w-24 tabular-nums" inputMode="numeric"
                                           maxLength={5} autoComplete="off"
                                           placeholder={t("DetailsForm.timePlaceholder")} {...form.register("endTime")}/>
                                    {error(errors.endTime?.message)}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-location`}>{t("Event.location")}</Label>
                                <Input id={`${id}-location`}
                                       maxLength={MAX_EVENT_LOCATION} {...form.register("location")}/>
                                {error(errors.location?.message)}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-description`}>{t("Event.description")}</Label>
                                <Textarea id={`${id}-description`} rows={4}
                                          maxLength={MAX_EVENT_DESCRIPTION} {...form.register("description")}/>
                                {error(errors.description?.message)}
                            </div>
                            <Controller control={form.control} name="revivalPays" render={({field}) => (
                                <div className="flex items-center gap-2">
                                    <Switch id={`${id}-pays`} checked={field.value}
                                            onCheckedChange={checked => field.onChange(checked)}/>
                                    <Label htmlFor={`${id}-pays`}>{t("Event.revivalPays")}</Label>
                                </div>
                            )}/>
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
