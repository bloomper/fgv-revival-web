"use client";

import * as React from "react";
import { useId, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ChecklistItemFieldsFragment } from "@/gql/graphql";
import { Button } from "@bloomper/fgv-web-ui/ui/button";
import { ScrollArea } from "@bloomper/fgv-web-ui/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@bloomper/fgv-web-ui/ui/sheet";
import { DateInput } from "@/components/date-input.client";
import { Label } from "@bloomper/fgv-web-ui/ui/label";
import { Textarea } from "@bloomper/fgv-web-ui/ui/textarea";
import { OwnerField, type OwnerMember } from "@/components/owner/owner-field.client";
import {
  createChecklistItemAction,
  updateChecklistItemAction,
} from "@/app/(app)/revivals/[id]/checklists/actions.server";
import { useActionFeedback } from "@/hooks/use-action-feedback";
import {
  type ChecklistItemValues,
  checklistItemValuesSchema,
  MAX_ITEM_COMMENT,
  MAX_ITEM_TEXT,
} from "@/lib/checklist/schema";

/**
 * Adds an item or edits one: text (not for a guide requirement), owner, deadline and comment.
 */
export function ChecklistItemDialog({
  revivalId,
  checklistId,
  item,
  members,
  open,
  onOpenChange,
}: {
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
      text: item?.required ? undefined : (item?.text.sv ?? ""),
      owner: item?.owner?.person
        ? { personId: item.owner.person.id }
        : item?.owner?.name
          ? { name: item.owner.name }
          : null,
      deadline: item?.deadline ?? null,
      comment: item?.comment ?? "",
    },
  });
  const { errors } = form.formState;
  const error = (name: string, message?: string) =>
    message && (
      <p
        id={`${id}-${name}-error`}
        className="text-destructive text-sm"
      >
        {t(`Validation.${message}`)}
      </p>
    );
  const described = (name: string, message?: string) => ({
    "aria-invalid": message ? true : undefined,
    "aria-describedby": message ? `${id}-${name}-error` : undefined,
  });

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-[600px]">
        <SheetHeader className="shrink-0 p-6 pb-4">
          <SheetTitle>{item ? t("Checklist.editItem") : t("Checklist.addItem")}</SheetTitle>
          <SheetDescription>{t("Checklist.itemDescription")}</SheetDescription>
        </SheetHeader>
        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={form.handleSubmit((values) =>
            startTransition(async () => {
              const result = item
                ? await updateChecklistItemAction({
                    id: item.id,
                    version: item.version,
                    revivalId,
                    values: {
                      ...values,
                      deadline: values.deadline === (item.deadline ?? null) ? undefined : values.deadline,
                    },
                  })
                : await createChecklistItemAction({
                    checklistId,
                    revivalId,
                    values: { ...values, text: values.text ?? "" },
                  });

              if (feedback(result, t("Common.saved"))) {
                onOpenChange(false);
              }
            })
          )}
        >
          <ScrollArea className="min-h-0 flex-1 border-t">
            <div className="space-y-4 px-6 py-6 pb-12">
              {!item?.required && (
                <div className="space-y-2">
                  <Label htmlFor={`${id}-text`}>{t("Checklist.text")}</Label>
                  <Textarea
                    id={`${id}-text`}
                    rows={2}
                    maxLength={MAX_ITEM_TEXT}
                    {...described("text", errors.text?.message)}
                    {...form.register("text")}
                  />
                  {error("text", errors.text?.message)}
                </div>
              )}
              <Controller
                control={form.control}
                name="owner"
                render={({ field }) => (
                  <OwnerField
                    members={members}
                    value={field.value ?? null}
                    onChange={field.onChange}
                    current={item?.owner?.person}
                  />
                )}
              />
              {error("owner", errors.owner?.name?.message ?? errors.owner?.message)}
              <div className="space-y-2">
                <Label htmlFor={`${id}-deadline`}>{t("Checklist.deadline")}</Label>
                <DateInput
                  id={`${id}-deadline`}
                  {...described("deadline", errors.deadline?.message)}
                  {...form.register("deadline", { setValueAs: (value) => value || null })}
                />
                {error("deadline", errors.deadline?.message)}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${id}-comment`}>{t("Checklist.comment")}</Label>
                <Textarea
                  id={`${id}-comment`}
                  rows={2}
                  maxLength={MAX_ITEM_COMMENT}
                  {...described("comment", errors.comment?.message)}
                  {...form.register("comment")}
                />
                {error("comment", errors.comment?.message)}
              </div>
            </div>
          </ScrollArea>
          <SheetFooter className="bg-muted/30 mt-auto shrink-0 border-t p-6 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("Common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={pending}
            >
              {t("Common.save")}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
