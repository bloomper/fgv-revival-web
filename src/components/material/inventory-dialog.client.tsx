"use client";

import * as React from "react";
import {useId, useTransition} from "react";
import {useTranslations} from "next-intl";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import type {InventoryKind, InventoryLocation, InventoryStatus} from "@/gql/graphql";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {NativeSelect} from "@/components/ui/native-select";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle} from "@/components/ui/sheet";
import {Textarea} from "@/components/ui/textarea";
import {OwnerField, type OwnerMember} from "@/components/owner/owner-field.client";
import type {OwnerValue} from "@/components/owner/owner-label";
import {createInventoryItemAction, updateInventoryItemAction} from "@/app/(app)/revivals/[id]/materials/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {
    INVENTORY_KINDS,
    INVENTORY_LOCATIONS,
    INVENTORY_STATUSES,
    type InventoryValues,
    inventoryValuesSchema,
    MAX_INVENTORY_NAME,
    MAX_LOCATION_NOTE,
    MAX_MATERIAL_COMMENT,
} from "@/lib/material/schema";
import {track} from "@/utils/umami";

/** A material an item may link to. */
export type MaterialOption = { id: string; title: string; url: string; removed: boolean };

export type EditableInventoryItem = {
    id: string;
    version: number;
    name: string;
    kind: InventoryKind;
    quantity: number;
    status: InventoryStatus;
    location?: InventoryLocation | null;
    locationNote?: string | null;
    owner?: OwnerValue;
    comment?: string | null;
    material?: MaterialOption | null;
};

function initialValues(item: EditableInventoryItem | null): InventoryValues {
    return {
        name: item?.name ?? "",
        kind: item?.kind ?? "PROPS",
        quantity: String(item?.quantity ?? 1),
        status: item?.status ?? "HAVE",
        location: item?.location ?? "",
        locationNote: item?.locationNote ?? "",
        owner: item?.owner?.person ? {personId: item.owner.person.id} : item?.owner?.name ? {name: item.owner.name} : null,
        comment: item?.comment ?? "",
        materialId: item?.material?.id ?? "",
    };
}

/**
 * Adds an item to the inventory or changes one (M8-FR-4): what it is, how many, whether it is there or must be found,
 * borrowed, bought or built, where it is kept, who has it, and the material describing it.
 */
export function InventoryDialog({revivalId, members, materials, item, onOpenChange}: {
    revivalId: string;
    members: OwnerMember[];
    /** The revival's materials that are not removed. */
    materials: MaterialOption[];
    item: EditableInventoryItem | null;
    onOpenChange: (open: boolean) => void;
}) {
    const t = useTranslations();
    const id = useId();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const form = useForm<InventoryValues>({
        resolver: zodResolver(inventoryValuesSchema),
        defaultValues: initialValues(item)
    });
    const {errors} = form.formState;
    const error = (fieldId: string, message?: string) => message &&
        <p id={`${fieldId}-error`} className="text-sm text-destructive">{t(`Validation.${message}`)}</p>;
    const held = item?.material;
    const materialChoices = held && !materials.some(material => material.id === held.id) ? [...materials, held] : materials;

    return (
        <Sheet open onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[600px] flex flex-col gap-0 p-0 h-full">
                <SheetHeader className="p-6 pb-4 shrink-0">
                    <SheetTitle>{item ? t("Inventory.editTitle") : t("Inventory.newTitle")}</SheetTitle>
                    <SheetDescription>{t("Inventory.dialogDescription")}</SheetDescription>
                </SheetHeader>
                <form className="flex min-h-0 flex-1 flex-col overflow-hidden"
                      onSubmit={form.handleSubmit(values => startTransition(async () => {
                          if (item) {
                              if (feedback(await updateInventoryItemAction({
                                  id: item.id,
                                  version: item.version,
                                  revivalId,
                                  values
                              }), t("Common.saved"))) {
                                  onOpenChange(false);
                              }
                          } else if (feedback(await createInventoryItemAction({
                              revivalId,
                              values
                          }), t("Inventory.created"))) {
                              track("inventory-create", {kind: values.kind});
                              onOpenChange(false);
                          }
                      }))}>
                    <ScrollArea className="min-h-0 flex-1 border-t">
                        <div className="space-y-4 px-6 py-6 pb-12">
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-name`}>{t("Inventory.name")}</Label>
                                <Input id={`${id}-name`} maxLength={MAX_INVENTORY_NAME}
                                       aria-invalid={errors.name ? true : undefined}
                                       aria-describedby={errors.name ? `${id}-name-error` : undefined} {...form.register("name")}/>
                                {error(`${id}-name`, errors.name?.message)}
                            </div>
                            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-kind`}>{t("Inventory.kind")}</Label>
                                    <NativeSelect className="w-full" id={`${id}-kind`} {...form.register("kind")}>
                                        {INVENTORY_KINDS.map(kind => <option key={kind}
                                                                             value={kind}>{t(`Inventory.kinds.${kind}`)}</option>)}
                                    </NativeSelect>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-quantity`}>{t("Inventory.quantity")}</Label>
                                    <Input id={`${id}-quantity`} className="w-24 tabular-nums" inputMode="numeric"
                                           autoComplete="off"
                                           aria-invalid={errors.quantity ? true : undefined}
                                           aria-describedby={errors.quantity ? `${id}-quantity-error` : undefined} {...form.register("quantity")}/>
                                </div>
                            </div>
                            {error(`${id}-quantity`, errors.quantity?.message)}
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-status`}>{t("Inventory.status")}</Label>
                                <NativeSelect className="w-full" id={`${id}-status`} {...form.register("status")}>
                                    {INVENTORY_STATUSES.map(status => <option key={status}
                                                                              value={status}>{t(`Inventory.statuses.${status}`)}</option>)}
                                </NativeSelect>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-location`}>{t("Inventory.location")}</Label>
                                    <NativeSelect className="w-full"
                                                  id={`${id}-location`} {...form.register("location")}>
                                        <option value="">{t("Inventory.noLocation")}</option>
                                        {INVENTORY_LOCATIONS.map(location => <option key={location}
                                                                                     value={location}>{t(`Inventory.locations.${location}`)}</option>)}
                                    </NativeSelect>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-note`}>{t("Inventory.locationNote")}</Label>
                                    <Input id={`${id}-note`} maxLength={MAX_LOCATION_NOTE}
                                           placeholder={t("Inventory.locationNotePlaceholder")}
                                           {...form.register("locationNote")}/>
                                    {error(`${id}-note`, errors.locationNote?.message)}
                                </div>
                            </div>
                            <Controller control={form.control} name="owner" render={({field}) => (
                                <div className="space-y-1">
                                    <OwnerField members={members} value={field.value ?? null} onChange={field.onChange}
                                                current={item?.owner?.person}
                                                label={t("Inventory.owner")} noneLabel={t("Inventory.noOwner")}/>
                                    {error(`${id}-owner`, errors.owner?.name?.message)}
                                </div>
                            )}/>
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-material`}>{t("Inventory.material")}</Label>
                                <NativeSelect className="w-full" id={`${id}-material`} {...form.register("materialId")}>
                                    <option value="">{t("Inventory.noMaterial")}</option>
                                    {materialChoices.map(material => (
                                        <option key={material.id} value={material.id}>
                                            {material.removed ? t("Inventory.removedMaterial", {title: material.title}) : material.title}
                                        </option>
                                    ))}
                                </NativeSelect>
                                <p className="text-xs text-muted-foreground">{t("Inventory.materialHelp")}</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-comment`}>{t("Inventory.comment")}</Label>
                                <Textarea id={`${id}-comment`} rows={3}
                                          maxLength={MAX_MATERIAL_COMMENT} {...form.register("comment")}/>
                                {error(`${id}-comment`, errors.comment?.message)}
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
