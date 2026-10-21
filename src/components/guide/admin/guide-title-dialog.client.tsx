"use client";

import {type ReactElement, type ReactNode, useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import type {ActionResult} from "@/lib/graphql.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {guideTitleSchema, type GuideTitleValues} from "@/lib/guide/schema";

/**
 * A Swedish and an optional English title, for renaming chapters and sections and adding sections (FR-009a).
 */
export function GuideTitleDialog({trigger, children, heading, initial, onSave}: {
    trigger: ReactElement;
    children: ReactNode;
    heading: string;
    initial?: { sv: string; en?: string | null };
    onSave: (title: { sv: string; en: string | null }) => Promise<ActionResult<null>>;
}) {
    const t = useTranslations();
    const feedback = useActionFeedback();
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();
    const form = useForm<GuideTitleValues>({
        resolver: zodResolver(guideTitleSchema),
        values: {sv: initial?.sv ?? "", en: initial?.en ?? ""},
    });
    const {errors} = form.formState;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={trigger}>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{heading}</DialogTitle>
                </DialogHeader>
                <form
                    className="space-y-4"
                    onSubmit={form.handleSubmit(values => startTransition(async () => {
                        if (feedback(await onSave({sv: values.sv, en: values.en || null}), t("Guide.editor.saved"))) {
                            setOpen(false);
                        }
                    }))}
                >
                    <div className="space-y-2">
                        <Label htmlFor="guide-title-sv">{t("Guide.editor.swedish")}</Label>
                        <Input id="guide-title-sv" {...form.register("sv")}/>
                        {errors.sv && <p className="text-sm text-destructive">{t(`Validation.${errors.sv.message}`)}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="guide-title-en">{t("Guide.editor.english")}</Label>
                        <Input id="guide-title-en" {...form.register("en")}/>
                        {errors.en && <p className="text-sm text-destructive">{t(`Validation.${errors.en.message}`)}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={pending}>{t("Common.save")}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
