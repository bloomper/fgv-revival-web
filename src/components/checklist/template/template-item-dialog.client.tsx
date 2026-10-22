"use client";

import * as React from "react";
import {useId, useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import type {ChecklistTemplateQuery} from "@/gql/graphql";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {GuideItemPicker} from "@/components/checklist/template/guide-item-picker.client";
import {RelativeDeadlineField} from "@/components/checklist/template/relative-deadline-field.client";
import {saveTemplateItemAction} from "@/app/(app)/admin/checklist-templates/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {MAX_ITEM_TEXT, type TemplateItemValues, templateItemValuesSchema} from "@/lib/checklist/schema";

export type TemplateItem = NonNullable<ChecklistTemplateQuery["checklistTemplate"]>["items"][number];

const CAPABILITIES = ["FINANCE", "CATERING", "STAFFING", "COMMS"] as const;

/**
 * Adds or edits a template item: Swedish and English text, a guide item, a default capability and, for event
 * templates, a relative deadline (FR-031).
 */
export function TemplateItemDialog({templateId, kind, item, open, onOpenChange}: {
    templateId: string;
    kind: "PHASE" | "EVENT";
    item: TemplateItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const t = useTranslations();
    const id = useId();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const [guideLabel, setGuideLabel] = useState<string | null>(item?.guideItem?.text.sv ?? null);
    const form = useForm<TemplateItemValues>({
        resolver: zodResolver(templateItemValuesSchema),
        defaultValues: {
            text: {sv: item?.text.sv ?? "", en: item?.text.en ?? ""},
            guideItemKey: item?.guideItemKey ?? null,
            defaultCapability: item?.defaultCapability ?? null,
            deadline: item?.deadline ?? null,
        },
    });
    const error = (key: string | undefined) => key && <p className="text-sm text-destructive">{t(`Validation.${key}`)}</p>;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{item ? t("ChecklistTemplate.editItem") : t("ChecklistTemplate.addItem")}</DialogTitle>
                    <DialogDescription>{t("ChecklistTemplate.itemDescription")}</DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={form.handleSubmit(values => startTransition(async () => {
                    const result = await saveTemplateItemAction({templateId, item: item ? {id: item.id, version: item.version} : null, values});

                    if (feedback(result, t("Common.saved"))) {
                        onOpenChange(false);
                    }
                }))}>
                    <div className="space-y-2">
                        <Label htmlFor={`${id}-item-sv`}>{t("ChecklistTemplate.textSv")}</Label>
                        <Textarea id={`${id}-item-sv`} rows={2} maxLength={MAX_ITEM_TEXT} {...form.register("text.sv")}/>
                        {error(form.formState.errors.text?.sv?.message)}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`${id}-item-en`}>{t("ChecklistTemplate.textEn")}</Label>
                        <Textarea id={`${id}-item-en`} rows={2} maxLength={MAX_ITEM_TEXT} {...form.register("text.en")}/>
                    </div>
                    <Controller control={form.control} name="guideItemKey" render={({field}) => (
                        <GuideItemPicker value={field.value} label={guideLabel} onChange={(key, label) => {
                            field.onChange(key);
                            setGuideLabel(label);
                        }}/>
                    )}/>
                    <div className="space-y-2">
                        <Label htmlFor={`${id}-item-capability`}>{t("ChecklistTemplate.defaultCapability")}</Label>
                        <select id={`${id}-item-capability`} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-xs"
                                {...form.register("defaultCapability", {setValueAs: value => value || null})}>
                            <option value="">{t("ChecklistTemplate.noCapability")}</option>
                            {CAPABILITIES.map(capability => <option key={capability} value={capability}>{t(`Capability.${capability}`)}</option>)}
                        </select>
                    </div>
                    {kind === "EVENT" && (
                        <Controller control={form.control} name="deadline" render={({field}) => (
                            <RelativeDeadlineField value={field.value} onChange={field.onChange}/>
                        )}/>
                    )}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("Common.cancel")}</Button>
                        <Button type="submit" disabled={pending}>{t("Common.save")}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
