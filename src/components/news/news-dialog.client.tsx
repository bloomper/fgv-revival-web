"use client";

import {useId, useTransition} from "react";
import {useTranslations} from "next-intl";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {DateInput} from "@/components/date-input.client";
import type {NewsItem} from "@/components/news/news";
import {createNewsAction, updateNewsAction} from "@/app/(app)/admin/news/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {MAX_NEWS_SUBJECT, MAX_NEWS_TEXT, type NewsValues, newsValuesSchema} from "@/lib/news/schema";

/**
 * Writes a piece of news, or changes one. Without a first day it stays a draft; without a last day it stays up.
 */
export function NewsDialog({news, onOpenChange}: { news: NewsItem | null; onOpenChange: (open: boolean) => void }) {
    const t = useTranslations();
    const id = useId();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const form = useForm<NewsValues>({
        resolver: zodResolver(newsValuesSchema),
        defaultValues: {
            subject: news?.subject ?? "",
            text: news?.text ?? "",
            visibleFrom: news?.visibleFrom ?? "",
            visibleTo: news?.visibleTo ?? "",
        },
    });
    const {errors} = form.formState;
    const error = (field: keyof NewsValues) => errors[field]?.message &&
        <p id={`${id}-${field}-error`} className="text-sm text-destructive">{t(`Validation.${errors[field]?.message}`)}</p>;
    const describedBy = (field: keyof NewsValues, hint?: string) =>
        [hint, errors[field] ? `${id}-${field}-error` : undefined].filter(Boolean).join(" ") || undefined;

    return (
        <Dialog open onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{news ? t("News.editTitle") : t("News.create")}</DialogTitle>
                    <DialogDescription>{t("News.dialogDescription")}</DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={form.handleSubmit(values => startTransition(async () => {
                    const result = news
                        ? await updateNewsAction({id: news.id, version: news.version, values})
                        : await createNewsAction({values});

                    if (feedback(result, t("Common.saved"))) {
                        onOpenChange(false);
                    }
                }))}>
                    <div className="space-y-2">
                        <Label htmlFor={`${id}-subject`}>{t("News.subject")}</Label>
                        <Input id={`${id}-subject`} maxLength={MAX_NEWS_SUBJECT} aria-invalid={!!errors.subject}
                               aria-describedby={describedBy("subject")} {...form.register("subject")}/>
                        {error("subject")}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`${id}-text`}>{t("News.text")}</Label>
                        <Textarea id={`${id}-text`} rows={8} maxLength={MAX_NEWS_TEXT} aria-invalid={!!errors.text}
                                  aria-describedby={describedBy("text", `${id}-text-hint`)} {...form.register("text")}/>
                        <p id={`${id}-text-hint`} className="text-xs text-muted-foreground">{t("News.textHint")}</p>
                        {error("text")}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor={`${id}-from`}>{t("News.visibleFrom")}</Label>
                            <DateInput id={`${id}-from`} aria-invalid={!!errors.visibleFrom}
                                       aria-describedby={describedBy("visibleFrom", `${id}-from-hint`)} {...form.register("visibleFrom")}/>
                            <p id={`${id}-from-hint`} className="text-xs text-muted-foreground">{t("News.visibleFromHint")}</p>
                            {error("visibleFrom")}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`${id}-to`}>{t("News.visibleTo")}</Label>
                            <DateInput id={`${id}-to`} aria-invalid={!!errors.visibleTo}
                                       aria-describedby={describedBy("visibleTo", `${id}-to-hint`)} {...form.register("visibleTo")}/>
                            <p id={`${id}-to-hint`} className="text-xs text-muted-foreground">{t("News.visibleToHint")}</p>
                            {error("visibleTo")}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("Common.cancel")}</Button>
                        <Button type="submit" disabled={pending}>{t("Common.save")}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
