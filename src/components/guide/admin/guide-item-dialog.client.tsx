"use client";

import {type ReactElement, type ReactNode, useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import type {GuideItemType} from "@/gql/graphql";
import type {ActionResult} from "@/lib/graphql.server";
import {GuideMarkdown} from "@/components/guide/guide-markdown";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {GUIDE_ITEM_TYPES, guideItemSchema, type GuideItemValues, MAX_ITEM_TEXT} from "@/lib/guide/schema";

/**
 * Edits an item's type and its Swedish and English Markdown, with a preview rendered as readers see it (research R9).
 */
export function GuideItemDialog({trigger, children, heading, initial, onSave}: {
    trigger: ReactElement;
    children: ReactNode;
    heading: string;
    initial?: { type: GuideItemType; text: { sv: string; en?: string | null } };
    onSave: (values: GuideItemValues) => Promise<ActionResult<null>>;
}) {
    const t = useTranslations();
    const feedback = useActionFeedback();
    const [open, setOpen] = useState(false);
    const [preview, setPreview] = useState(false);
    const [pending, startTransition] = useTransition();
    const form = useForm<GuideItemValues>({
        resolver: zodResolver(guideItemSchema),
        values: {type: initial?.type ?? "TIP", text: {sv: initial?.text.sv ?? "", en: initial?.text.en ?? ""}},
    });
    const {errors} = form.formState;
    const sv = useWatch({control: form.control, name: "text.sv"});
    const en = useWatch({control: form.control, name: "text.en"});

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={trigger}>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{heading}</DialogTitle>
                </DialogHeader>
                <form
                    className="space-y-4"
                    onSubmit={form.handleSubmit(values => startTransition(async () => {
                        if (feedback(await onSave({...values, text: {sv: values.text.sv, en: values.text.en || null}}), t("Guide.editor.saved"))) {
                            setOpen(false);
                        }
                    }))}
                >
                    <div className="space-y-2">
                        <Label htmlFor="guide-item-type">{t("Guide.editor.type")}</Label>
                        <select id="guide-item-type" className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-xs"
                                {...form.register("type")}>
                            {GUIDE_ITEM_TYPES.map(type => <option key={type} value={type}>{t(`Guide.type.${type}`)}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-2" role="tablist">
                        <Button type="button" role="tab" aria-selected={!preview} variant={preview ? "ghost" : "secondary"} size="sm"
                                onClick={() => setPreview(false)}>{t("Guide.editor.write")}</Button>
                        <Button type="button" role="tab" aria-selected={preview} variant={preview ? "secondary" : "ghost"} size="sm"
                                onClick={() => setPreview(true)}>{t("Guide.editor.preview")}</Button>
                    </div>
                    {preview ? (
                        <div className="space-y-3" data-testid="guide-item-preview">
                            <div className="rounded-md border p-3"><GuideMarkdown>{sv || ""}</GuideMarkdown></div>
                            {en && <div className="rounded-md border p-3"><GuideMarkdown>{en}</GuideMarkdown></div>}
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="guide-item-sv">{t("Guide.editor.swedish")}</Label>
                                <Textarea id="guide-item-sv" rows={6} maxLength={MAX_ITEM_TEXT} {...form.register("text.sv")}/>
                                {errors.text?.sv && <p className="text-sm text-destructive">{t(`Validation.${errors.text.sv.message}`)}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="guide-item-en">{t("Guide.editor.english")}</Label>
                                <Textarea id="guide-item-en" rows={6} maxLength={MAX_ITEM_TEXT} {...form.register("text.en")}/>
                                {errors.text?.en && <p className="text-sm text-destructive">{t(`Validation.${errors.text.en.message}`)}</p>}
                            </div>
                            <p className="text-xs text-muted-foreground">{t("Guide.editor.markdownHelp")}</p>
                        </>
                    )}
                    <DialogFooter>
                        <Button type="submit" disabled={pending}>{t("Common.save")}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
