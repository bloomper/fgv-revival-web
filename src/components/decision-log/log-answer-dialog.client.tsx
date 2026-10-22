"use client";

import * as React from "react";
import {useTransition} from "react";
import {useTranslations} from "next-intl";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import type {LogEntryFieldsFragment} from "@/gql/graphql";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {OwnerField, type OwnerMember} from "@/components/owner/owner-field.client";
import {PlainText} from "@/components/plain-text";
import {answerLogEntryAction} from "@/app/(app)/revivals/[id]/log/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {logEntryAnswerSchema, MAX_LOG_TEXT} from "@/lib/decision-log/schema";

const answerValuesSchema = logEntryAnswerSchema.pick({text: true, owner: true, deadline: true, comment: true});

type AnswerValues = z.infer<typeof answerValuesSchema>;

/**
 * Answers an open question with a decision: both rows stay, linked, and the question is done (M3 FR-013).
 */
export function LogAnswerDialog({revivalId, question, members, meetingId, open, onOpenChange}: {
    revivalId: string;
    question: LogEntryFieldsFragment;
    members: OwnerMember[];
    meetingId?: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const t = useTranslations();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const form = useForm<AnswerValues>({
        resolver: zodResolver(answerValuesSchema),
        defaultValues: {text: "", owner: null, deadline: null, comment: ""},
    });
    const {errors} = form.formState;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t("Log.answerTitle", {number: question.number})}</DialogTitle>
                    <DialogDescription render={<div/>}><PlainText text={question.text}/></DialogDescription>
                </DialogHeader>
                <form
                    className="space-y-4"
                    onSubmit={form.handleSubmit(values => startTransition(async () => {
                        const result = await answerLogEntryAction({
                            ...values, questionId: question.id, questionVersion: question.version, revivalId, meetingId,
                        });

                        if (feedback(result, t("Log.answered"))) {
                            form.reset();
                            onOpenChange(false);
                        }
                    }))}
                >
                    <div className="space-y-2">
                        <Label htmlFor="answer-text">{t("Log.decision")}</Label>
                        <Textarea id="answer-text" rows={3} maxLength={MAX_LOG_TEXT} {...form.register("text")}/>
                        {errors.text?.message && <p className="text-sm text-destructive">{t(`Validation.${errors.text.message}`)}</p>}
                    </div>
                    <Controller control={form.control} name="owner" render={({field}) => (
                        <OwnerField members={members} value={field.value ?? null} onChange={field.onChange}/>
                    )}/>
                    <div className="space-y-2">
                        <Label htmlFor="answer-deadline">{t("Log.deadline")}</Label>
                        <Input id="answer-deadline" type="date" {...form.register("deadline", {setValueAs: value => value || null})}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="answer-comment">{t("Log.comment")}</Label>
                        <Textarea id="answer-comment" rows={2} maxLength={MAX_LOG_TEXT} {...form.register("comment")}/>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("Common.cancel")}</Button>
                        <Button type="submit" disabled={pending}>{t("Log.answer")}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
