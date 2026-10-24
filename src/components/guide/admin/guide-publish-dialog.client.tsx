"use client";

import {useState, useTransition} from "react";
import {useLocale, useTranslations} from "next-intl";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Send} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {publishGuideAction} from "@/app/(app)/admin/guide/actions.server";
import {pickText} from "@/components/guide/localized";
import {RemovalWarning} from "@/components/guide/removal-warning.client";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {guidePublishSchema, type GuidePublishValues} from "@/lib/guide/schema";
import {track} from "@/utils/umami";

export type RemovedChapter = {
    key: string;
    title: { sv: string; en?: string | null };
    revivalCount: number;
    itemCount: number;
    doneCount: number
};

/**
 * Publishes the draft as the next version, which the server labels v1, v2, … (FR-014), with an optional note on what
 * changed. Chapters the draft has
 * removed are listed with the checklists revivals lose when they move to the new version, and must be confirmed.
 */
export function GuidePublishDialog({draftId, version, removedChapters = []}: {
    draftId: string;
    version: number;
    removedChapters?: RemovedChapter[]
}) {
    const t = useTranslations();
    const locale = useLocale();
    const feedback = useActionFeedback();
    const [open, setOpen] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [pending, startTransition] = useTransition();
    const form = useForm<GuidePublishValues>({
        resolver: zodResolver(guidePublishSchema),
        defaultValues: {id: draftId, version, note: ""},
    });
    const {errors} = form.formState;
    // The dialog stays mounted, so a cancelled opening must not leave text or the removal confirmation behind.
    const change = (next: boolean) => {
        if (next) {
            form.reset();
            setConfirmed(false);
        }
        setOpen(next);
    };

    return (
        <Dialog open={open} onOpenChange={change}>
            <DialogTrigger render={<Button/>}>
                <Send/>
                {t("Guide.publish.open")}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("Guide.publish.title")}</DialogTitle>
                    <DialogDescription>{t("Guide.publish.description")}</DialogDescription>
                </DialogHeader>
                <form
                    className="space-y-4"
                    onSubmit={form.handleSubmit(values => startTransition(async () => {
                        if (feedback(await publishGuideAction({
                            ...values,
                            id: draftId,
                            version
                        }), t("Guide.publish.done"))) {
                            track("guide-publish");
                            setOpen(false);
                            form.reset();
                        }
                    }))}
                >
                    <div className="space-y-2">
                        <Label htmlFor="guide-note">{t("Guide.publish.note")}</Label>
                        <Textarea id="guide-note" rows={3} {...form.register("note")}/>
                        {errors.note &&
                            <p className="text-sm text-destructive">{t(`Validation.${errors.note.message}`)}</p>}
                    </div>
                    {removedChapters.length > 0 && (
                        <RemovalWarning title={t("Guide.publish.removedTitle", {count: removedChapters.length})}
                                        confirmLabel={t("Guide.publish.removedConfirm")} confirmed={confirmed}
                                        onConfirmedChange={setConfirmed}>
                            <p>{t("Guide.publish.removedDescription")}</p>
                            <ul className="mt-2 list-disc space-y-1 pl-5">
                                {removedChapters.map(chapter => (
                                    <li key={chapter.key}>
                                        <span className="font-medium">{pickText(chapter.title, locale).text}</span>
                                        {": "}
                                        {t("Guide.chapterImpact", {
                                            revivals: chapter.revivalCount,
                                            items: chapter.itemCount,
                                            done: chapter.doneCount
                                        })}
                                    </li>
                                ))}
                            </ul>
                        </RemovalWarning>
                    )}
                    <DialogFooter>
                        <Button type="submit" variant={removedChapters.length > 0 ? "destructive" : "default"}
                                disabled={pending || (removedChapters.length > 0 && !confirmed)}>{t("Guide.publish.submit")}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
