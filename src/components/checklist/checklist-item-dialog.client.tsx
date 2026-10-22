"use client";

import * as React from "react";
import {useId, useTransition} from "react";
import {useTranslations} from "next-intl";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import type {ChecklistItemFieldsFragment} from "@/gql/graphql";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {OwnerField, type OwnerMember} from "@/components/owner/owner-field.client";
import {createChecklistItemAction, updateChecklistItemAction} from "@/app/(app)/revivals/[id]/checklists/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {type ChecklistItemValues, checklistItemValuesSchema, MAX_ITEM_COMMENT, MAX_ITEM_TEXT} from "@/lib/checklist/schema";

/**
 * Adds an item or edits one: text (not for a guide requirement, FR-025), owner, deadline and comment.
 */
export function ChecklistItemDialog({revivalId, checklistId, item, members, open, onOpenChange}: {
    revivalId: string;
    checklistId: string;
    item: ChecklistItemFieldsFragment | null;
    members: OwnerMember[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const t = useTranslations();
    const id = useId();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const form = useForm<ChecklistItemValues>({
        resolver: zodResolver(checklistItemValuesSchema),
        values: {
            text: item?.required ? undefined : item?.text.sv ?? "",
            owner: item?.owner?.person ? {personId: item.owner.person.id} : item?.owner?.name ? {name: item.owner.name} : null,
            deadline: item?.deadline ?? null,
            comment: item?.comment ?? "",
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{item ? t("Checklist.editItem") : t("Checklist.addItem")}</DialogTitle>
                    <DialogDescription>{t("Checklist.itemDescription")}</DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={form.handleSubmit(values => startTransition(async () => {
                    const result = item
                        ? await updateChecklistItemAction({id: item.id, version: item.version, revivalId, values})
                        : await createChecklistItemAction({checklistId, revivalId, values: {...values, text: values.text ?? ""}});

                    if (feedback(result, t("Common.saved"))) {
                        onOpenChange(false);
                    }
                }))}>
                    {!item?.required && (
                        <div className="space-y-2">
                            <Label htmlFor={`${id}-text`}>{t("Checklist.text")}</Label>
                            <Textarea id={`${id}-text`} rows={2} maxLength={MAX_ITEM_TEXT} {...form.register("text")}/>
                        </div>
                    )}
                    <Controller control={form.control} name="owner" render={({field}) => (
                        <OwnerField members={members} value={field.value ?? null} onChange={field.onChange}/>
                    )}/>
                    <div className="space-y-2">
                        <Label htmlFor={`${id}-deadline`}>{t("Checklist.deadline")}</Label>
                        <Input id={`${id}-deadline`} type="date" {...form.register("deadline", {setValueAs: value => value || null})}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`${id}-comment`}>{t("Checklist.comment")}</Label>
                        <Textarea id={`${id}-comment`} rows={2} maxLength={MAX_ITEM_COMMENT} {...form.register("comment")}/>
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
