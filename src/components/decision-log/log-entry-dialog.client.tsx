"use client";

import * as React from "react";
import {useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import type {LogEntryFieldsFragment} from "@/gql/graphql";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle} from "@/components/ui/sheet";
import {DateInput} from "@/components/date-input.client";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {NativeSelect} from "@/components/ui/native-select";
import {OwnerField, type OwnerMember} from "@/components/owner/owner-field.client";
import {createLogEntryAction, updateLogEntryAction} from "@/app/(app)/revivals/[id]/log/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {
    LOG_ENTRY_STATUSES,
    LOG_ENTRY_TYPES,
    type LogEntryValues,
    logEntryValuesSchema,
    MAX_LOG_TEXT
} from "@/lib/decision-log/schema";

function valuesOf(entry: LogEntryFieldsFragment | null, initial?: Partial<LogEntryValues>): LogEntryValues {
    return {
        type: entry?.type ?? initial?.type ?? "TODO",
        text: entry?.text ?? initial?.text ?? "",
        status: entry?.status ?? "OPEN",
        owner: entry?.owner?.person ? {personId: entry.owner.person.id} : entry?.owner?.name ? {name: entry.owner.name} : null,
        deadline: entry?.deadline ?? null,
        date: entry?.date,
        comment: entry?.comment ?? "",
        tags: entry?.tags ?? initial?.tags ?? [],
    };
}

/**
 * Adds or edits a decision log row (M3 FR-008–FR-014). There is no delete: a row is closed or cancelled instead.
 * With a meeting in progress, the change is recorded as made in it (FR-018). A new row can start from `initial`, e.g.
 * the closing page's surplus decision: a DECISION tagged "överskott" (M7-FR-9).
 */
export function LogEntryDialog({revivalId, entry, initial, members, tags, meetingId, open, onOpenChange}: {
    revivalId: string;
    entry: LogEntryFieldsFragment | null;
    initial?: Partial<LogEntryValues>;
    members: OwnerMember[];
    tags: string[];
    meetingId?: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const t = useTranslations();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const [tagText, setTagText] = useState("");
    const form = useForm<LogEntryValues>({
        resolver: zodResolver(logEntryValuesSchema),
        values: valuesOf(entry, initial)
    });
    const {errors} = form.formState;
    const error = (message?: string) => message &&
        <p className="text-sm text-destructive">{t(`Validation.${message}`)}</p>;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[600px] flex flex-col gap-0 p-0 h-full">
                <SheetHeader className="p-6 pb-4 shrink-0">
                    <SheetTitle>{entry ? t("Log.editTitle", {number: entry.number}) : t("Log.addTitle")}</SheetTitle>
                    <SheetDescription>{t("Log.dialogDescription")}</SheetDescription>
                </SheetHeader>
                <form
                    className="flex min-h-0 flex-1 flex-col overflow-hidden"
                    onSubmit={form.handleSubmit(values => startTransition(async () => {
                        const result = entry
                            ? await updateLogEntryAction({
                                id: entry.id,
                                version: entry.version,
                                revivalId,
                                meetingId,
                                values
                            })
                            : await createLogEntryAction({revivalId, meetingId, values});

                        if (feedback(result, entry ? t("Common.saved") : t("Log.added"))) {
                            onOpenChange(false);
                        }
                    }))}
                >
                    <ScrollArea className="min-h-0 flex-1 border-t">
                        <div className="space-y-4 px-6 py-6 pb-12">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="log-type">{t("Log.typeLabel")}</Label>
                                    <NativeSelect className="w-full" id="log-type" {...form.register("type")}>
                                        {LOG_ENTRY_TYPES.map(type => <option key={type}
                                                                             value={type}>{t(`Log.type.${type}`)}</option>)}
                                    </NativeSelect>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="log-status">{t("Log.statusLabel")}</Label>
                                    <NativeSelect className="w-full" id="log-status" {...form.register("status")}>
                                        {LOG_ENTRY_STATUSES.map(status => <option key={status}
                                                                                  value={status}>{t(`Log.status.${status}`)}</option>)}
                                    </NativeSelect>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="log-text">{t("Log.text")}</Label>
                                <Textarea id="log-text" rows={4} maxLength={MAX_LOG_TEXT} {...form.register("text")}/>
                                {error(errors.text?.message)}
                            </div>
                            <Controller control={form.control} name="owner" render={({field}) => (
                                <OwnerField members={members} value={field.value ?? null} onChange={field.onChange}
                                            current={entry?.owner?.person}/>
                            )}/>
                            {error(errors.owner?.name?.message ?? errors.owner?.message)}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="log-date">{t("Log.dateLabel")}</Label>
                                    <DateInput id="log-date"
                                               aria-describedby="log-date-hint" {...form.register("date", {setValueAs: value => value || undefined})}/>
                                    <p id="log-date-hint"
                                       className="text-xs text-muted-foreground">{t("Log.dateHint")}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="log-deadline">{t("Log.deadline")}</Label>
                                    <DateInput id="log-deadline"
                                               aria-describedby="log-deadline-hint" {...form.register("deadline", {setValueAs: value => value || null})}/>
                                    <p id="log-deadline-hint"
                                       className="text-xs text-muted-foreground">{t("Log.deadlineHint")}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="log-comment">{t("Log.comment")}</Label>
                                <Textarea id="log-comment" rows={2}
                                          maxLength={MAX_LOG_TEXT} {...form.register("comment")}/>
                                {error(errors.comment?.message)}
                            </div>
                            <Controller control={form.control} name="tags" render={({field}) => (
                                <div className="space-y-2">
                                    <Label htmlFor="log-tag">{t("Log.tags")}</Label>
                                    <div className="flex flex-wrap gap-1">
                                        {field.value.map(tag => (
                                            <Button key={tag} type="button" size="sm" variant="secondary"
                                                    aria-label={t("Log.removeTag", {tag})}
                                                    onClick={() => field.onChange(field.value.filter(other => other !== tag))}>
                                                {tag} ×
                                            </Button>
                                        ))}
                                    </div>
                                    <Input id="log-tag" list="log-tag-options" value={tagText}
                                           placeholder={t("Log.addTag")}
                                           onChange={event => setTagText(event.target.value)}
                                           onKeyDown={(event) => {
                                               if (event.key === "Enter" && tagText.trim()) {
                                                   event.preventDefault();
                                                   field.onChange([...new Set([...field.value, tagText.trim()])]);
                                                   setTagText("");
                                               }
                                           }}/>
                                    <datalist id="log-tag-options">
                                        {tags.map(tag => <option key={tag} value={tag}/>)}
                                    </datalist>
                                    {error(errors.tags?.message ?? errors.tags?.[0]?.message)}
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
