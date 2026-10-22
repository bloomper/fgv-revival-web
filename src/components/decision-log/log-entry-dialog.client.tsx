"use client";

import * as React from "react";
import {useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import type {LogEntryFieldsFragment} from "@/gql/graphql";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {OwnerField, type OwnerMember} from "@/components/owner/owner-field.client";
import {createLogEntryAction, updateLogEntryAction} from "@/app/(app)/revivals/[id]/log/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {LOG_ENTRY_STATUSES, LOG_ENTRY_TYPES, type LogEntryValues, logEntryValuesSchema, MAX_LOG_TEXT} from "@/lib/decision-log/schema";

function valuesOf(entry: LogEntryFieldsFragment | null): LogEntryValues {
    return {
        type: entry?.type ?? "TODO",
        text: entry?.text ?? "",
        status: entry?.status ?? "OPEN",
        owner: entry?.owner?.person ? {personId: entry.owner.person.id} : entry?.owner?.name ? {name: entry.owner.name} : null,
        deadline: entry?.deadline ?? null,
        date: entry?.date,
        comment: entry?.comment ?? "",
        tags: entry?.tags ?? [],
    };
}

/**
 * Adds or edits a decision log row (M3 FR-008–FR-014). There is no delete: a row is closed or cancelled instead.
 * With a meeting in progress, the change is recorded as made in it (FR-018).
 */
export function LogEntryDialog({revivalId, entry, members, tags, meetingId, open, onOpenChange}: {
    revivalId: string;
    entry: LogEntryFieldsFragment | null;
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
    const form = useForm<LogEntryValues>({resolver: zodResolver(logEntryValuesSchema), values: valuesOf(entry)});
    const {errors} = form.formState;
    const error = (message?: string) => message && <p className="text-sm text-destructive">{t(`Validation.${message}`)}</p>;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{entry ? t("Log.editTitle", {number: entry.number}) : t("Log.addTitle")}</DialogTitle>
                    <DialogDescription>{t("Log.dialogDescription")}</DialogDescription>
                </DialogHeader>
                <form
                    className="space-y-4"
                    onSubmit={form.handleSubmit(values => startTransition(async () => {
                        const result = entry
                            ? await updateLogEntryAction({id: entry.id, version: entry.version, revivalId, meetingId, values})
                            : await createLogEntryAction({revivalId, meetingId, values});

                        if (feedback(result, entry ? t("Common.saved") : t("Log.added"))) {
                            onOpenChange(false);
                        }
                    }))}
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="log-type">{t("Log.typeLabel")}</Label>
                            <select id="log-type" className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" {...form.register("type")}>
                                {LOG_ENTRY_TYPES.map(type => <option key={type} value={type}>{t(`Log.type.${type}`)}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="log-status">{t("Log.statusLabel")}</Label>
                            <select id="log-status" className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" {...form.register("status")}>
                                {LOG_ENTRY_STATUSES.map(status => <option key={status} value={status}>{t(`Log.status.${status}`)}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="log-text">{t("Log.text")}</Label>
                        <Textarea id="log-text" rows={4} maxLength={MAX_LOG_TEXT} {...form.register("text")}/>
                        {error(errors.text?.message)}
                    </div>
                    <Controller control={form.control} name="owner" render={({field}) => (
                        <OwnerField members={members} value={field.value ?? null} onChange={field.onChange} current={entry?.owner?.person}/>
                    )}/>
                    {error(errors.owner?.name?.message ?? errors.owner?.message)}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="log-deadline">{t("Log.deadline")}</Label>
                            <Input id="log-deadline" type="date" {...form.register("deadline", {setValueAs: value => value || null})}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="log-date">{t("Log.date")}</Label>
                            <Input id="log-date" type="date" {...form.register("date", {setValueAs: value => value || undefined})}/>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="log-comment">{t("Log.comment")}</Label>
                        <Textarea id="log-comment" rows={2} maxLength={MAX_LOG_TEXT} {...form.register("comment")}/>
                        {error(errors.comment?.message)}
                    </div>
                    <Controller control={form.control} name="tags" render={({field}) => (
                        <div className="space-y-2">
                            <Label htmlFor="log-tag">{t("Log.tags")}</Label>
                            <div className="flex flex-wrap gap-1">
                                {field.value.map(tag => (
                                    <Button key={tag} type="button" size="sm" variant="secondary" aria-label={t("Log.removeTag", {tag})}
                                            onClick={() => field.onChange(field.value.filter(other => other !== tag))}>
                                        {tag} ×
                                    </Button>
                                ))}
                            </div>
                            <Input id="log-tag" list="log-tag-options" value={tagText} placeholder={t("Log.addTag")}
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
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("Common.cancel")}</Button>
                        <Button type="submit" disabled={pending}>{t("Common.save")}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
