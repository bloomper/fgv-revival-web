"use client";

import * as React from "react";
import {useId, useTransition} from "react";
import {useTranslations} from "next-intl";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import type {ChecklistItemFieldsFragment} from "@/gql/graphql";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle} from "@/components/ui/sheet";
import {DateInput} from "@/components/date-input.client";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {OwnerField, type OwnerMember} from "@/components/owner/owner-field.client";
import {
    createChecklistItemAction,
    updateChecklistItemAction
} from "@/app/(app)/revivals/[id]/checklists/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {
    type ChecklistItemValues,
    checklistItemValuesSchema,
    MAX_ITEM_COMMENT,
    MAX_ITEM_TEXT
} from "@/lib/checklist/schema";

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
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[600px] flex flex-col gap-0 p-0 h-full">
                <SheetHeader className="p-6 pb-4 shrink-0">
                    <SheetTitle>{item ? t("Checklist.editItem") : t("Checklist.addItem")}</SheetTitle>
                    <SheetDescription>{t("Checklist.itemDescription")}</SheetDescription>
                </SheetHeader>
                <form className="flex min-h-0 flex-1 flex-col overflow-hidden"
                      onSubmit={form.handleSubmit(values => startTransition(async () => {
                          const result = item
                              ? await updateChecklistItemAction({
                                  id: item.id, version: item.version, revivalId,
                                  values: {
                                      ...values,
                                      deadline: values.deadline === (item.deadline ?? null) ? undefined : values.deadline
                                  },
                              })
                              : await createChecklistItemAction({
                                  checklistId,
                                  revivalId,
                                  values: {...values, text: values.text ?? ""}
                              });

                          if (feedback(result, t("Common.saved"))) {
                              onOpenChange(false);
                          }
                      }))}>
                    <ScrollArea className="min-h-0 flex-1 border-t">
                        <div className="space-y-4 px-6 py-6 pb-12">
                            {!item?.required && (
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-text`}>{t("Checklist.text")}</Label>
                                    <Textarea id={`${id}-text`} rows={2}
                                              maxLength={MAX_ITEM_TEXT} {...form.register("text")}/>
                                </div>
                            )}
                            <Controller control={form.control} name="owner" render={({field}) => (
                                <OwnerField members={members} value={field.value ?? null} onChange={field.onChange}
                                            current={item?.owner?.person}/>
                            )}/>
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-deadline`}>{t("Checklist.deadline")}</Label>
                                <DateInput
                                    id={`${id}-deadline`} {...form.register("deadline", {setValueAs: value => value || null})}/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-comment`}>{t("Checklist.comment")}</Label>
                                <Textarea id={`${id}-comment`} rows={2}
                                          maxLength={MAX_ITEM_COMMENT} {...form.register("comment")}/>
                            </div>
                        </div>
                    </ScrollArea>
                    <SheetFooter className="p-6 pt-4 border-t bg-muted/30 shrink-0 mt-auto">
                        <Button type="button" variant="outline"
                                onClick={() => onOpenChange(false)}>{t("Common.cancel")}</Button>
                        <Button type="submit" disabled={pending}>{t("Common.save")}</Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
