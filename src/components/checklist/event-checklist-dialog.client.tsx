"use client";

import * as React from "react";
import {useId, useState, useTransition} from "react";
import {useRouter} from "next/navigation";
import {useLocale, useTranslations} from "next-intl";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {CalendarPlus, Pencil} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {pickText} from "@/components/guide/localized";
import {saveEventChecklistAction} from "@/app/(app)/revivals/[id]/checklists/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {type EventChecklistValues, eventChecklistValuesSchema, MAX_TEMPLATE_NAME} from "@/lib/checklist/schema";

export type EventTemplate = { id: string; name?: { sv: string; en?: string | null } | null };

/**
 * Creates an event checklist, from a template or empty, or changes its name and date, which recomputes deadlines not
 * set by hand (M3 FR-023).
 */
export function EventChecklistDialog({revivalId, templates, checklist}: {
    revivalId: string;
    templates: EventTemplate[];
    checklist?: { id: string; version: number; name?: string | null; date?: string | null };
}) {
    const t = useTranslations();
    const id = useId();
    const locale = useLocale();
    const router = useRouter();
    const feedback = useActionFeedback();
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();
    const form = useForm<EventChecklistValues>({
        resolver: zodResolver(eventChecklistValuesSchema),
        values: {name: checklist?.name ?? "", date: checklist?.date ?? null, templateId: null},
    });
    const error = form.formState.errors.name?.message;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {checklist
                ? <Button variant="outline" onClick={() => setOpen(true)}><Pencil/>{t("Checklist.editEvent")}</Button>
                : <Button onClick={() => setOpen(true)}><CalendarPlus/>{t("Checklist.newEvent")}</Button>}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{checklist ? t("Checklist.editEvent") : t("Checklist.newEvent")}</DialogTitle>
                    <DialogDescription>{t("Checklist.eventDescription")}</DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={form.handleSubmit(values => startTransition(async () => {
                    const result = await saveEventChecklistAction({revivalId, checklist: checklist ? {id: checklist.id, version: checklist.version} : null, values});

                    if (feedback(result, t("Common.saved"))) {
                        setOpen(false);
                        if (!checklist) {
                            router.push(`/revivals/${revivalId}/checklists/${result.data.id}`);
                        }
                    }
                }))}>
                    <div className="space-y-2">
                        <Label htmlFor={`${id}-name`}>{t("Checklist.eventName")}</Label>
                        <Input id={`${id}-name`} maxLength={MAX_TEMPLATE_NAME} {...form.register("name")}/>
                        {error && <p className="text-sm text-destructive">{t(`Validation.${error}`)}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`${id}-date`}>{t("Checklist.eventDate")}</Label>
                        <Input id={`${id}-date`} type="date" {...form.register("date", {setValueAs: value => value || null})}/>
                    </div>
                    {!checklist && (
                        <div className="space-y-2">
                            <Label htmlFor={`${id}-template`}>{t("Checklist.template")}</Label>
                            <select id={`${id}-template`} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-xs"
                                    {...form.register("templateId", {setValueAs: value => value || null})}>
                                <option value="">{t("Checklist.noTemplate")}</option>
                                {templates.map(template => (
                                    <option key={template.id} value={template.id}>{template.name ? pickText(template.name, locale).text : template.id}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t("Common.cancel")}</Button>
                        <Button type="submit" disabled={pending}>{t("Common.save")}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
