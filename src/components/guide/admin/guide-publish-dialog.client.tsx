"use client";

import {useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Send} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {publishGuideAction} from "@/app/(app)/admin/guide/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {guidePublishSchema, type GuidePublishValues} from "@/lib/guide/schema";
import {track} from "@/utils/umami";

/**
 * Publishes the draft under a new label (FR-014). The server refuses a label already in use.
 */
export function GuidePublishDialog({draftId, version}: { draftId: string; version: number }) {
    const t = useTranslations();
    const feedback = useActionFeedback();
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();
    const form = useForm<GuidePublishValues>({
        resolver: zodResolver(guidePublishSchema),
        defaultValues: {id: draftId, version, label: "", note: ""},
    });
    const {errors} = form.formState;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
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
                        if (feedback(await publishGuideAction({...values, id: draftId, version}), t("Guide.publish.done"))) {
                            track("guide-publish");
                            setOpen(false);
                            form.reset();
                        }
                    }))}
                >
                    <div className="space-y-2">
                        <Label htmlFor="guide-label">{t("Guide.publish.label")}</Label>
                        <Input id="guide-label" placeholder="v6" {...form.register("label")}/>
                        {errors.label && <p className="text-sm text-destructive">{t(`Validation.${errors.label.message}`)}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="guide-note">{t("Guide.publish.note")}</Label>
                        <Textarea id="guide-note" rows={3} {...form.register("note")}/>
                        {errors.note && <p className="text-sm text-destructive">{t(`Validation.${errors.note.message}`)}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={pending}>{t("Guide.publish.submit")}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
