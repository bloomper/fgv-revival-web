"use client";

import * as React from "react";
import {useTransition} from "react";
import {useTranslations} from "next-intl";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import type {LogEntryFieldsFragment} from "@/gql/graphql";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle} from "@/components/ui/sheet";
import {DateInput} from "@/components/date-input.client";
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
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[600px] flex flex-col gap-0 p-0 h-full">
                <SheetHeader className="p-6 pb-4 shrink-0">
                    <SheetTitle>{t("Log.answerTitle", {number: question.number})}</SheetTitle>
                    <SheetDescription render={<div/>}><PlainText text={question.text}/></SheetDescription>
                </SheetHeader>
                <form
                    className="flex min-h-0 flex-1 flex-col overflow-hidden"
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
                    <ScrollArea className="min-h-0 flex-1 border-t">
                        <div className="space-y-4 px-6 py-6 pb-12">
                            <div className="space-y-2">
                                <Label htmlFor="answer-text">{t("Log.decision")}</Label>
                                <Textarea id="answer-text" rows={3}
                                          maxLength={MAX_LOG_TEXT} {...form.register("text")}/>
                                {errors.text?.message &&
                                    <p className="text-sm text-destructive">{t(`Validation.${errors.text.message}`)}</p>}
                            </div>
                            <Controller control={form.control} name="owner" render={({field}) => (
                                <OwnerField members={members} value={field.value ?? null} onChange={field.onChange}/>
                            )}/>
                            <div className="space-y-2">
                                <Label htmlFor="answer-deadline">{t("Log.deadline")}</Label>
                                <DateInput
                                    id="answer-deadline" {...form.register("deadline", {setValueAs: value => value || null})}/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="answer-comment">{t("Log.comment")}</Label>
                                <Textarea id="answer-comment" rows={2}
                                          maxLength={MAX_LOG_TEXT} {...form.register("comment")}/>
                            </div>
                        </div>
                    </ScrollArea>
                    <SheetFooter className="p-6 pt-4 border-t bg-muted/30 shrink-0 mt-auto">
                        <Button type="button" variant="outline"
                                onClick={() => onOpenChange(false)}>{t("Common.cancel")}</Button>
                        <Button type="submit" disabled={pending}>{t("Log.answer")}</Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
