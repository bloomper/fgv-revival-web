"use client";

import * as React from "react";
import {useState, useTransition} from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {ArrowDown, ArrowUp, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle} from "@/components/ui/sheet";
import {DateInput} from "@/components/date-input.client";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {createMeetingAction, updateMeetingAction} from "@/app/(app)/revivals/[id]/meetings/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {MAX_AGENDA_POINT, MAX_OTHERS_PRESENT, type MeetingValues, meetingValuesSchema} from "@/lib/meeting/schema";

type Person = { id: string; displayName?: string | null };

export type EditableMeeting = {
    id: string;
    version: number;
    date: string;
    title?: string | null;
    attendees: Person[];
    othersPresent?: string | null;
    agendaPoints: string[];
};

function move<T>(list: T[], index: number, by: number): T[] {
    const next = [...list];
    const [item] = next.splice(index, 1);

    next.splice(index + by, 0, item);
    return next;
}

/**
 * Plans a meeting or changes one: date, title, attendees from the steering group, others present, and extra agenda
 * points after the open rows.
 */
export function MeetingDialog({revivalId, meeting, members, open, onOpenChange}: {
    revivalId: string;
    meeting: EditableMeeting | null;
    members: Person[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const t = useTranslations();
    const router = useRouter();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const [point, setPoint] = useState("");
    const form = useForm<MeetingValues>({
        resolver: zodResolver(meetingValuesSchema),
        values: {
            date: meeting?.date ?? new Date().toISOString().slice(0, 10),
            title: meeting?.title ?? "",
            attendeeIds: meeting?.attendees.map(attendee => attendee.id) ?? [],
            othersPresent: meeting?.othersPresent ?? "",
            agendaPoints: meeting?.agendaPoints ?? [],
        },
    });
    const {errors} = form.formState;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[600px] flex flex-col gap-0 p-0 h-full">
                <SheetHeader className="p-6 pb-4 shrink-0">
                    <SheetTitle>{meeting ? t("Meeting.editTitle") : t("Meeting.newTitle")}</SheetTitle>
                    <SheetDescription>{t("Meeting.dialogDescription")}</SheetDescription>
                </SheetHeader>
                <form className="flex min-h-0 flex-1 flex-col overflow-hidden"
                      onSubmit={form.handleSubmit(values => startTransition(async () => {
                          if (meeting) {
                              if (feedback(await updateMeetingAction({
                                  id: meeting.id,
                                  version: meeting.version,
                                  revivalId,
                                  values
                              }), t("Common.saved"))) {
                                  onOpenChange(false);
                              }
                          } else {
                              const result = await createMeetingAction({revivalId, values});

                              if (feedback(result, t("Meeting.created"))) {
                                  onOpenChange(false);
                                  router.push(`/revivals/${revivalId}/meetings/${result.data.id}`);
                              }
                          }
                      }))}>
                    <ScrollArea className="min-h-0 flex-1 border-t">
                        <div className="space-y-4 px-6 py-6 pb-12">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="meeting-date">{t("Meeting.date")}</Label>
                                    <DateInput id="meeting-date" {...form.register("date")}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="meeting-title">{t("Meeting.titleLabel")}</Label>
                                    <Input id="meeting-title"
                                           placeholder={t("Meeting.titlePlaceholder")} {...form.register("title")}/>
                                </div>
                            </div>
                            <Controller control={form.control} name="attendeeIds" render={({field}) => (
                                <fieldset className="space-y-2">
                                    <legend className="text-sm font-medium">{t("Meeting.attendees")}</legend>
                                    {members.map(member => (
                                        <label key={member.id} className="flex items-center gap-2 text-sm">
                                            <input type="checkbox" checked={field.value.includes(member.id)}
                                                   onChange={(event) => field.onChange(event.target.checked
                                                       ? [...field.value, member.id] : field.value.filter(other => other !== member.id))}/>
                                            {member.displayName ?? member.id}
                                        </label>
                                    ))}
                                </fieldset>
                            )}/>
                            <div className="space-y-2">
                                <Label htmlFor="meeting-others">{t("Meeting.othersPresent")}</Label>
                                <Textarea id="meeting-others" rows={2}
                                          maxLength={MAX_OTHERS_PRESENT} {...form.register("othersPresent")}/>
                            </div>
                            <Controller control={form.control} name="agendaPoints" render={({field}) => (
                                <div className="space-y-2">
                                    <Label htmlFor="meeting-point">{t("Meeting.agendaPoints")}</Label>
                                    <ol className="space-y-1">
                                        {field.value.map((entry, index) => (
                                            <li key={`${index}-${entry}`} className="flex items-center gap-1 text-sm">
                                                <span className="flex-1">{index + 1}. {entry}</span>
                                                <Button type="button" size="icon" variant="ghost" disabled={index === 0}
                                                        aria-label={t("Meeting.moveUp", {point: entry})}
                                                        onClick={() => field.onChange(move(field.value, index, -1))}><ArrowUp/></Button>
                                                <Button type="button" size="icon" variant="ghost"
                                                        disabled={index === field.value.length - 1}
                                                        aria-label={t("Meeting.moveDown", {point: entry})}
                                                        onClick={() => field.onChange(move(field.value, index, 1))}><ArrowDown/></Button>
                                                <Button type="button" size="icon" variant="ghost"
                                                        aria-label={t("Meeting.removePoint", {point: entry})}
                                                        onClick={() => field.onChange(field.value.filter((_, other) => other !== index))}><X/></Button>
                                            </li>
                                        ))}
                                    </ol>
                                    <div className="flex gap-2">
                                        <Input id="meeting-point" value={point} maxLength={MAX_AGENDA_POINT}
                                               placeholder={t("Meeting.pointPlaceholder")}
                                               onChange={event => setPoint(event.target.value)}
                                               onKeyDown={(event) => {
                                                   if (event.key === "Enter" && point.trim()) {
                                                       event.preventDefault();
                                                       field.onChange([...field.value, point.trim()]);
                                                       setPoint("");
                                                   }
                                               }}/>
                                        <Button type="button" variant="outline" disabled={!point.trim()}
                                                onClick={() => {
                                                    field.onChange([...field.value, point.trim()]);
                                                    setPoint("");
                                                }}>{t("Common.add")}</Button>
                                    </div>
                                </div>
                            )}/>
                            {(errors.date || errors.agendaPoints) && (
                                <p className="text-sm text-destructive">{t(`Validation.${errors.date?.message ?? "agendaPointInvalid"}`)}</p>
                            )}
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
