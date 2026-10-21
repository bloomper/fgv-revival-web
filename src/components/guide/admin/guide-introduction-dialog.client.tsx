"use client";

import {type ReactElement, type ReactNode, useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {updateIntroductionAction} from "@/app/(app)/admin/guide/draft/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {guideIntroductionSchema, MAX_INTRODUCTION} from "@/lib/guide/schema";

type Values = z.infer<typeof guideIntroductionSchema>;

export function GuideIntroductionDialog({trigger, children, versionId, version, initial}: {
    trigger: ReactElement;
    children: ReactNode;
    versionId: string;
    version: number;
    initial: { sv: string; en?: string | null };
}) {
    const t = useTranslations();
    const feedback = useActionFeedback();
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();
    const form = useForm<Values>({resolver: zodResolver(guideIntroductionSchema), values: {sv: initial.sv, en: initial.en ?? ""}});

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={trigger}>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t("Guide.editor.editIntroduction")}</DialogTitle>
                </DialogHeader>
                <form
                    className="space-y-4"
                    onSubmit={form.handleSubmit(values => startTransition(async () => {
                        if (feedback(await updateIntroductionAction({versionId, version, introduction: values}), t("Guide.editor.saved"))) {
                            setOpen(false);
                        }
                    }))}
                >
                    <div className="space-y-2">
                        <Label htmlFor="guide-intro-sv">{t("Guide.editor.swedish")}</Label>
                        <Textarea id="guide-intro-sv" rows={10} maxLength={MAX_INTRODUCTION} {...form.register("sv")}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="guide-intro-en">{t("Guide.editor.english")}</Label>
                        <Textarea id="guide-intro-en" rows={10} maxLength={MAX_INTRODUCTION} {...form.register("en")}/>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={pending}>{t("Common.save")}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
