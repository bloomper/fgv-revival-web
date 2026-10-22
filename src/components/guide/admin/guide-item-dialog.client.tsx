"use client";

import {type ReactElement, type ReactNode, useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet";
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
    // The sheet stays mounted and `values` rarely changes (never when adding), so start each opening afresh.
    const change = (next: boolean) => {
        if (next) {
            form.reset();
            setPreview(false);
        }
        setOpen(next);
    };

    return (
        <Sheet open={open} onOpenChange={change}>
            <SheetTrigger render={trigger}>{children}</SheetTrigger>
            <SheetContent className="w-full sm:max-w-[600px] flex flex-col gap-0 p-0 h-full">
                <SheetHeader className="p-6 pb-4 shrink-0">
                    <SheetTitle>{heading}</SheetTitle>
                </SheetHeader>
                <form
                    className="flex min-h-0 flex-1 flex-col overflow-hidden"
                    onSubmit={form.handleSubmit(values => startTransition(async () => {
                        if (feedback(await onSave({...values, text: {sv: values.text.sv, en: values.text.en || null}}), t("Guide.editor.saved"))) {
                            setOpen(false);
                        }
                    }))}
                >
                    <ScrollArea className="min-h-0 flex-1 border-t">
                        <div className="space-y-4 px-6 py-6 pb-12">
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
                        </div>
                    </ScrollArea>
                    <SheetFooter className="p-6 pt-4 border-t bg-muted/30 shrink-0 mt-auto">
                        <Button type="submit" disabled={pending}>{t("Common.save")}</Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
