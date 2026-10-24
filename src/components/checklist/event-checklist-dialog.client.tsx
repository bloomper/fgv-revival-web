"use client";

import * as React from "react";
import {useId, useState, useTransition} from "react";
import {useRouter} from "next/navigation";
import {useLocale, useTranslations} from "next-intl";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {CalendarPlus, Pencil} from "lucide-react";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle} from "@/components/ui/sheet";
import {DateInput} from "@/components/date-input.client";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {NativeSelect} from "@/components/ui/native-select";
import {pickText} from "@/components/guide/localized";
import {saveEventChecklistAction} from "@/app/(app)/revivals/[id]/checklists/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {type EventChecklistValues, eventChecklistValuesSchema, MAX_TEMPLATE_NAME} from "@/lib/checklist/schema";

export type EventTemplate = { id: string; name?: { sv: string; en?: string | null } | null };

/**
 * Creates an event checklist, from a template or empty, or changes its name and date, which recomputes deadlines not
 * set by hand (M3 FR-023).
 */
export function EventChecklistDialog({revivalId, templates, checklist, compact = false}: {
    revivalId: string;
    templates: EventTemplate[];
    checklist?: { id: string; version: number; name?: string | null; date?: string | null };
    /** A small outline trigger, for the list of checklists. */
    compact?: boolean;
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
        <Sheet open={open} onOpenChange={setOpen}>
            {checklist
                ? <Button variant="outline" onClick={() => setOpen(true)}><Pencil/>{t("Checklist.editEvent")}</Button>
                : <Button size={compact ? "sm" : "default"} variant={compact ? "outline" : "default"}
                          aria-label={compact ? t("Checklist.newEvent") : undefined} onClick={() => setOpen(true)}>
                    <CalendarPlus/>{compact ? t("Checklist.newEventShort") : t("Checklist.newEvent")}
                </Button>}
            <SheetContent className="w-full sm:max-w-[600px] flex flex-col gap-0 p-0 h-full">
                <SheetHeader className="p-6 pb-4 shrink-0">
                    <SheetTitle>{checklist ? t("Checklist.editEvent") : t("Checklist.newEvent")}</SheetTitle>
                    <SheetDescription>{t("Checklist.eventDescription")}</SheetDescription>
                </SheetHeader>
                <form className="flex min-h-0 flex-1 flex-col overflow-hidden"
                      onSubmit={form.handleSubmit(values => startTransition(async () => {
                          const result = await saveEventChecklistAction({
                              revivalId,
                              checklist: checklist ? {id: checklist.id, version: checklist.version} : null,
                              values
                          });

                          if (feedback(result, t("Common.saved"))) {
                              setOpen(false);
                              if (!checklist) {
                                  router.push(`/revivals/${revivalId}/checklists/${result.data.id}`);
                              }
                          }
                      }))}>
                    <ScrollArea className="min-h-0 flex-1 border-t">
                        <div className="space-y-4 px-6 py-6 pb-12">
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-name`}>{t("Checklist.eventName")}</Label>
                                <Input id={`${id}-name`} maxLength={MAX_TEMPLATE_NAME} {...form.register("name")}/>
                                {error && <p className="text-sm text-destructive">{t(`Validation.${error}`)}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-date`}>{t("Checklist.eventDate")}</Label>
                                <DateInput
                                    id={`${id}-date`} {...form.register("date", {setValueAs: value => value || null})}/>
                            </div>
                            {!checklist && (
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-template`}>{t("Checklist.template")}</Label>
                                    <NativeSelect className="w-full" id={`${id}-template`}
                                                  {...form.register("templateId", {setValueAs: value => value || null})}>
                                        <option value="">{t("Checklist.noTemplate")}</option>
                                        {templates.map(template => (
                                            <option key={template.id}
                                                    value={template.id}>{template.name ? pickText(template.name, locale).text : template.id}</option>
                                        ))}
                                    </NativeSelect>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                    <SheetFooter className="p-6 pt-4 border-t bg-muted/30 shrink-0 mt-auto">
                        <Button type="button" variant="outline"
                                onClick={() => setOpen(false)}>{t("Common.cancel")}</Button>
                        <Button type="submit" disabled={pending}>{t("Common.save")}</Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
