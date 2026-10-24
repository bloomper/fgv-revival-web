"use client";

import * as React from "react";
import {useId, useTransition} from "react";
import {useLocale, useTranslations} from "next-intl";
import {Controller, useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {NativeSelect} from "@/components/ui/native-select";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle} from "@/components/ui/sheet";
import {Textarea} from "@/components/ui/textarea";
import {catalogChoices, catalogName} from "@/components/catalog/catalog";
import type {LinkServiceValue} from "@/components/material/material-labels";
import type {PositionValue} from "@/components/participant/participant-labels";
import {createMaterialAction, updateMaterialAction} from "@/app/(app)/revivals/[id]/materials/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {hostOf, MAX_URL, recogniseService} from "@/lib/material/hosts";
import {
    MATERIAL_CATEGORIES,
    MATERIAL_VISIBILITIES,
    type MaterialValues,
    materialValuesSchema,
    MAX_MATERIAL_COMMENT,
    MAX_MATERIAL_TITLE,
} from "@/lib/material/schema";
import {track} from "@/utils/umami";

export type EditableMaterial = {
    id: string;
    version: number;
    title: string;
    url: string;
    service?: LinkServiceValue | null;
    /** The service was picked rather than recognised from the link's host. */
    serviceChosen: boolean;
    category: MaterialValues["category"];
    visibility: MaterialValues["visibility"];
    positions: PositionValue[];
    comment?: string | null;
};

function initialValues(material: EditableMaterial | null): MaterialValues {
    if (!material) {
        return {
            title: "",
            url: "",
            serviceId: "",
            category: "SCRIPT",
            visibility: "STEERING_GROUP",
            positionIds: [],
            comment: ""
        };
    }

    // A recognised service stays blank ("recognise it from the link"), so changing the link follows it
    return {
        title: material.title,
        url: material.url,
        serviceId: material.serviceChosen && material.service ? material.service.id : "",
        category: material.category,
        visibility: material.visibility,
        positionIds: material.positions.map(position => position.id),
        comment: material.comment ?? "",
    };
}

/**
 * What the link is recognised as while typing, announced politely: the service, an unknown host, or nothing yet.
 */
function RecognitionHint({id, url, services, chosen}: {
    id: string;
    url: string;
    services: readonly LinkServiceValue[];
    chosen: boolean
}) {
    const t = useTranslations("Material");
    const locale = useLocale();
    const host = hostOf(url);
    const service = recogniseService(url, services);
    let text: string | null = null;

    if (host) {
        text = service ? t("recognised", {service: catalogName(service, locale)}) : t("notRecognised", {host});
    }
    return (
        <p id={id} className="min-h-5 text-sm text-muted-foreground" aria-live="polite">
            {text}
            {text && chosen && <> {t("overridden")}</>}
        </p>
    );
}

/**
 * The positions a material is for, as checkboxes grouped by Spexregister's categories. Positions the material holds
 * stay listed while Spexregister is down.
 */
function PositionsField({id, positions, value, onChange, error, unavailable}: {
    id: string;
    positions: PositionValue[];
    value: string[];
    onChange: (ids: string[]) => void;
    error?: string;
    unavailable: boolean;
}) {
    const t = useTranslations();
    const groups = new Map<string, PositionValue[]>();

    positions.forEach(position => groups.set(position.category ?? "", [...(groups.get(position.category ?? "") ?? []), position]));

    return (
        <fieldset className="space-y-2" aria-describedby={error ? `${id}-error` : undefined}
                  aria-invalid={error ? true : undefined}>
            <legend className="text-sm font-medium">{t("Material.positions")}</legend>
            {unavailable && <p className="text-xs text-muted-foreground">{t("Material.positionsUnavailable")}</p>}
            {[...groups.entries()].map(([category, entries]) => (
                <div key={category} className="space-y-1">
                    {category && <p className="text-xs font-medium text-muted-foreground">{category}</p>}
                    <ul className="grid gap-1 sm:grid-cols-2">
                        {entries.map(position => (
                            <li key={position.id} className="flex items-center gap-2">
                                <Checkbox id={`${id}-${position.id}`} checked={value.includes(position.id)}
                                          onCheckedChange={checked => onChange(checked
                                              ? [...value, position.id]
                                              : value.filter(other => other !== position.id))}/>
                                <Label htmlFor={`${id}-${position.id}`} className="font-normal">{position.name}</Label>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
            {error && <p id={`${id}-error`} className="text-sm text-destructive">{t(`Validation.${error}`)}</p>}
        </fieldset>
    );
}

/**
 * Adds a material or changes one (M8-FR-3): a title and a link, the service it is recognised as (shown while typing,
 * and choosable when the host says nothing), its category, and who sees it. Nothing is uploaded.
 */
export function MaterialDialog({revivalId, services, positions, positionsUnavailable = false, material, onOpenChange}: {
    revivalId: string;
    /** The active services. */
    services: LinkServiceValue[];
    positions: PositionValue[];
    positionsUnavailable?: boolean;
    material: EditableMaterial | null;
    onOpenChange: (open: boolean) => void;
}) {
    const t = useTranslations();
    const id = useId();
    const locale = useLocale();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const form = useForm<MaterialValues>({
        resolver: zodResolver(materialValuesSchema),
        defaultValues: initialValues(material)
    });
    const [url, serviceId, visibility] = useWatch({control: form.control, name: ["url", "serviceId", "visibility"]});
    const {errors} = form.formState;
    const error = (fieldId: string, message?: string) => message &&
        <p id={`${fieldId}-error`} className="text-sm text-destructive">{t(`Validation.${message}`)}</p>;
    const serviceChoices = catalogChoices(services, [material?.service]);
    const held = material?.positions ?? [];
    const positionChoices = [...positions, ...held.filter(position => !positions.some(other => other.id === position.id))];

    return (
        <Sheet open onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[600px] flex flex-col gap-0 p-0 h-full">
                <SheetHeader className="p-6 pb-4 shrink-0">
                    <SheetTitle>{material ? t("Material.editTitle") : t("Material.newTitle")}</SheetTitle>
                    <SheetDescription>{t("Material.dialogDescription")}</SheetDescription>
                </SheetHeader>
                <form className="flex min-h-0 flex-1 flex-col overflow-hidden"
                      onSubmit={form.handleSubmit(values => startTransition(async () => {
                          if (material) {
                              if (feedback(await updateMaterialAction({
                                  id: material.id,
                                  version: material.version,
                                  revivalId,
                                  values
                              }), t("Common.saved"))) {
                                  onOpenChange(false);
                              }
                              return;
                          }

                          const result = await createMaterialAction({revivalId, values});

                          if (feedback(result, t("Material.created"))) {
                              track("material-create", {category: values.category, recognised: result.data.recognised});
                              onOpenChange(false);
                          }
                      }))}>
                    <ScrollArea className="min-h-0 flex-1 border-t">
                        <div className="space-y-4 px-6 py-6 pb-12">
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-title`}>{t("Material.titleLabel")}</Label>
                                <Input id={`${id}-title`} maxLength={MAX_MATERIAL_TITLE}
                                       aria-invalid={errors.title ? true : undefined}
                                       aria-describedby={errors.title ? `${id}-title-error` : undefined} {...form.register("title")}/>
                                {error(`${id}-title`, errors.title?.message)}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-url`}>{t("Material.url")}</Label>
                                <Input id={`${id}-url`} type="url" inputMode="url" maxLength={MAX_URL}
                                       placeholder="https://" autoComplete="off" spellCheck={false}
                                       aria-invalid={errors.url ? true : undefined}
                                       aria-describedby={`${id}-url-hint${errors.url ? ` ${id}-url-error` : ""}`} {...form.register("url")}/>
                                <RecognitionHint id={`${id}-url-hint`} url={url} services={services}
                                                 chosen={!!serviceId}/>
                                {error(`${id}-url`, errors.url?.message)}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-service`}>{t("Material.service")}</Label>
                                <NativeSelect className="w-full" id={`${id}-service`} {...form.register("serviceId")}>
                                    <option value="">{t("Material.serviceAuto")}</option>
                                    {serviceChoices.map(service => (
                                        <option key={service.id} value={service.id}>
                                            {service.retired ? t("Catalog.retiredName", {name: catalogName(service, locale)}) : catalogName(service, locale)}
                                        </option>
                                    ))}
                                </NativeSelect>
                                <p className="text-xs text-muted-foreground">{t("Material.serviceHelp")}</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-category`}>{t("Material.category")}</Label>
                                <NativeSelect className="w-full" id={`${id}-category`} {...form.register("category")}>
                                    {MATERIAL_CATEGORIES.map(category => <option key={category}
                                                                                 value={category}>{t(`Material.categories.${category}`)}</option>)}
                                </NativeSelect>
                            </div>
                            <fieldset className="space-y-2">
                                <legend className="text-sm font-medium">{t("Material.visibility")}</legend>
                                {MATERIAL_VISIBILITIES.map(option => (
                                    <label key={option}
                                           className="flex items-start gap-2 rounded-md border p-3 text-sm">
                                        <input type="radio" className="mt-0.5"
                                               value={option} {...form.register("visibility")}/>
                                        <span>
                                            <span
                                                className="block font-medium">{t(`Material.visibilities.${option}`)}</span>
                                            <span
                                                className="block text-muted-foreground">{t(`Material.visibilityHelp.${option}`)}</span>
                                        </span>
                                    </label>
                                ))}
                            </fieldset>
                            {visibility === "POSITIONS" && (
                                <Controller control={form.control} name="positionIds" render={({field}) => (
                                    <PositionsField id={`${id}-positions`} positions={positionChoices}
                                                    value={field.value} onChange={field.onChange}
                                                    error={errors.positionIds?.message}
                                                    unavailable={positionsUnavailable}/>
                                )}/>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-comment`}>{t("Material.comment")}</Label>
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
