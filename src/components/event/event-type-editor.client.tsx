"use client";

import * as React from "react";
import {useId, useState, useTransition} from "react";
import {useLocale, useTranslations} from "next-intl";
import {Controller, useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Archive, ArchiveRestore, ArrowDown, ArrowUp, Pencil, Plus} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {NativeSelect} from "@/components/ui/native-select";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle} from "@/components/ui/sheet";
import {Switch} from "@/components/ui/switch";
import {Textarea} from "@/components/ui/textarea";
import {catalogName} from "@/components/catalog/catalog";
import type {LocalizedTextValue} from "@/components/guide/localized";
import {offsetRange} from "@/components/event/timeline";
import {type EventTypeBudgetLineRow, EventTypeBudgetLines} from "@/components/event/event-type-budget-lines.client";
import type {BudgetCategoryValue} from "@/components/budget/budget-labels";
import {
    createEventTypeAction,
    moveEventTypeAction,
    restoreEventTypeAction,
    retireEventTypeAction,
    updateEventTypeAction,
} from "@/app/(app)/admin/event-types/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import type {ActionResult} from "@/lib/graphql.server";
import {
    type EventTypeValues,
    eventTypeValuesSchema,
    MAX_EVENT_TYPE_NAME,
    MAX_EVENT_TYPE_TEXT
} from "@/lib/event/schema";

type Template = { id: string; name?: LocalizedTextValue | null; retired?: boolean };

export type EventTypeRow = {
    id: string;
    name: LocalizedTextValue;
    description?: LocalizedTextValue | null;
    rooms?: LocalizedTextValue | null;
    catering?: LocalizedTextValue | null;
    offsetMinDays?: number | null;
    offsetMaxDays?: number | null;
    days: number;
    revivalPays: boolean;
    checklistTemplate?: Template | null;
    position: number;
    retired: boolean;
    version: number;
    budgetLines?: EventTypeBudgetLineRow[];
};

const TEXTS = ["description", "rooms", "catering"] as const;

function initialValues(type: EventTypeRow | null): EventTypeValues {
    const text = (value?: LocalizedTextValue | null) => ({sv: value?.sv ?? "", en: value?.en ?? ""});

    return {
        name: text(type?.name),
        description: text(type?.description),
        rooms: text(type?.rooms),
        catering: text(type?.catering),
        offsetMinDays: type?.offsetMinDays?.toString() ?? "",
        offsetMaxDays: type?.offsetMaxDays?.toString() ?? "",
        days: String(type?.days ?? 1),
        revivalPays: type?.revivalPays ?? false,
        checklistTemplateId: type?.checklistTemplate?.id ?? "",
    };
}

/**
 * The offsets as weeks before or after the premiere: "17–9 weeks before the premiere".
 */
export function OffsetHint({min, max}: { min: number | null | undefined; max: number | null | undefined }) {
    const t = useTranslations("EventType");
    const range = offsetRange(min, max);

    switch (range.key) {
        case "offsetBefore":
        case "offsetAfter":
            return <>{t(range.key, {from: range.from, to: range.to})}</>;
        case "offsetAround":
            return <>{t(range.key, {before: range.before, after: range.after})}</>;
        default:
            return <>{t(range.key)}</>;
    }
}

function templateName(template: Template, locale: string) {
    return template.name ? catalogName({name: template.name}, locale) : template.id;
}

/**
 * Creating or changing a type: its names, default content, offsets from the premiere, length, who pays and the
 * checklist its events get.
 */
function TypeSheet({type, templates, onOpenChange}: {
    type: EventTypeRow | null;
    templates: Template[];
    onOpenChange: (open: boolean) => void
}) {
    const t = useTranslations();
    const id = useId();
    const locale = useLocale();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const form = useForm<EventTypeValues>({
        resolver: zodResolver(eventTypeValuesSchema),
        defaultValues: initialValues(type)
    });
    const [min, max] = useWatch({control: form.control, name: ["offsetMinDays", "offsetMaxDays"]});
    const {errors} = form.formState;
    const error = (message?: string) => message &&
        <p className="text-sm text-destructive">{t(`Validation.${message}`)}</p>;
    const held = type?.checklistTemplate;
    const choices = held && !templates.some(template => template.id === held.id) ? [...templates, held] : templates;
    const number = (value: string) => /^-?\d+$/.test(value.trim()) ? Number(value) : null;

    return (
        <Sheet open onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[600px] flex flex-col gap-0 p-0 h-full">
                <SheetHeader className="p-6 pb-4 shrink-0">
                    <SheetTitle>{type ? t("EventType.editTitle") : t("EventType.create")}</SheetTitle>
                    <SheetDescription>{t("EventType.dialogDescription")}</SheetDescription>
                </SheetHeader>
                <form className="flex min-h-0 flex-1 flex-col overflow-hidden"
                      onSubmit={form.handleSubmit(values => startTransition(async () => {
                          const result = type
                              ? await updateEventTypeAction({id: type.id, version: type.version, values})
                              : await createEventTypeAction({values});

                          if (feedback(result, t("Common.saved"))) {
                              onOpenChange(false);
                          }
                      }))}>
                    <ScrollArea className="min-h-0 flex-1 border-t">
                        <div className="space-y-4 px-6 py-6 pb-12">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-name-sv`}>{t("Catalog.nameSv")}</Label>
                                    <Input id={`${id}-name-sv`}
                                           maxLength={MAX_EVENT_TYPE_NAME} {...form.register("name.sv")}/>
                                    {error(errors.name?.sv?.message)}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-name-en`}>{t("Catalog.nameEn")}</Label>
                                    <Input id={`${id}-name-en`}
                                           maxLength={MAX_EVENT_TYPE_NAME} {...form.register("name.en")}/>
                                    {error(errors.name?.en?.message)}
                                </div>
                            </div>
                            <fieldset className="space-y-2">
                                <legend className="text-sm font-medium">{t("EventType.offsets")}</legend>
                                <div className="flex flex-wrap items-end gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor={`${id}-min`}>{t("EventType.offsetMin")}</Label>
                                        <Input id={`${id}-min`} className="w-24 tabular-nums" inputMode="numeric"
                                               autoComplete="off" {...form.register("offsetMinDays", {deps: ["offsetMaxDays"]})}/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`${id}-max`}>{t("EventType.offsetMax")}</Label>
                                        <Input id={`${id}-max`} className="w-24 tabular-nums" inputMode="numeric"
                                               autoComplete="off" {...form.register("offsetMaxDays", {deps: ["offsetMinDays"]})}/>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground" aria-live="polite"><OffsetHint
                                    min={number(min)} max={number(max)}/></p>
                                <p className="text-xs text-muted-foreground">{t("EventType.offsetsHelp")}</p>
                                {error(errors.offsetMinDays?.message ?? errors.offsetMaxDays?.message)}
                            </fieldset>
                            <div className="flex flex-wrap items-end gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-days`}>{t("EventType.days")}</Label>
                                    <Input id={`${id}-days`} className="w-20 tabular-nums" inputMode="numeric"
                                           autoComplete="off" {...form.register("days")}/>
                                </div>
                                <Controller control={form.control} name="revivalPays" render={({field}) => (
                                    <div className="flex items-center gap-2 pb-2">
                                        <Switch id={`${id}-pays`} checked={field.value}
                                                onCheckedChange={checked => field.onChange(checked)}/>
                                        <Label htmlFor={`${id}-pays`}>{t("Event.revivalPays")}</Label>
                                    </div>
                                )}/>
                            </div>
                            {error(errors.days?.message)}
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-template`}>{t("EventType.checklistTemplate")}</Label>
                                <NativeSelect className="w-full"
                                              id={`${id}-template`} {...form.register("checklistTemplateId")}>
                                    <option value="">{t("EventType.noTemplate")}</option>
                                    {choices.map(template => (
                                        <option key={template.id} value={template.id}>
                                            {template.retired ? t("Catalog.retiredName", {name: templateName(template, locale)}) : templateName(template, locale)}
                                        </option>
                                    ))}
                                </NativeSelect>
                                <p className="text-xs text-muted-foreground">{t("EventType.checklistTemplateHelp")}</p>
                            </div>
                            {TEXTS.map(key => (
                                <fieldset key={key} className="space-y-2">
                                    <legend className="text-sm font-medium">{t(`EventType.${key}`)}</legend>
                                    <Label htmlFor={`${id}-${key}-sv`}
                                           className="text-muted-foreground">{t("EventType.swedish")}</Label>
                                    <Textarea id={`${id}-${key}-sv`} rows={3}
                                              maxLength={MAX_EVENT_TYPE_TEXT} {...form.register(`${key}.sv`)}/>
                                    <Label htmlFor={`${id}-${key}-en`}
                                           className="text-muted-foreground">{t("EventType.english")}</Label>
                                    <Textarea id={`${id}-${key}-en`} rows={3}
                                              maxLength={MAX_EVENT_TYPE_TEXT} {...form.register(`${key}.en`)}/>
                                    {error(errors[key]?.sv?.message ?? errors[key]?.en?.message)}
                                </fieldset>
                            ))}
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

/**
 * The event types in the order proposals and pickers show them: added, changed, moved, retired and restored, with the
 * budget lines each proposes. Types are never deleted, since events keep theirs.
 */
export function EventTypeEditor({types, templates, categories = []}: {
    types: EventTypeRow[];
    templates: Template[];
    /** The budget categories, for the lines a type proposes. */
    categories?: BudgetCategoryValue[];
}) {
    const t = useTranslations();
    const locale = useLocale();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const [editing, setEditing] = useState<EventTypeRow | null>(null);
    const [adding, setAdding] = useState(false);
    const run = (work: () => Promise<ActionResult<null>>, success?: string) => startTransition(async () => {
        feedback(await work(), success);
    });

    return (
        <div className="space-y-3">
            <Button onClick={() => setAdding(true)}><Plus/>{t("EventType.create")}</Button>
            {types.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("Catalog.empty")}</p>
            ) : (
                <ol className="space-y-2" aria-label={t("EventType.title")}>
                    {types.map((type, index) => {
                        const name = type.name.sv;
                        const above = types[index - 1];
                        const below = types[index + 1];

                        return (
                            <li key={type.id} className="flex gap-3 rounded-lg border p-3">
                                <div className="min-w-0 flex-1 space-y-1">
                                    <p className={type.retired ? "text-muted-foreground" : "font-medium"}>{name}</p>
                                    {type.name.en && <p className="text-sm text-muted-foreground">{type.name.en}</p>}
                                    <p className="text-sm text-muted-foreground"><OffsetHint min={type.offsetMinDays}
                                                                                             max={type.offsetMaxDays}/>
                                    </p>
                                    <div className="flex flex-wrap gap-2 text-sm">
                                        <Badge variant="secondary">{t("EventType.dayCount", {count: type.days})}</Badge>
                                        {type.revivalPays &&
                                            <Badge variant="secondary">{t("Event.revivalPays")}</Badge>}
                                        {type.checklistTemplate && (
                                            <Badge
                                                variant="outline">{t("EventType.withTemplate", {name: templateName(type.checklistTemplate, locale)})}</Badge>
                                        )}
                                        {type.retired && <Badge variant="outline">{t("Catalog.retired")}</Badge>}
                                    </div>
                                    <EventTypeBudgetLines eventTypeId={type.id} typeName={name}
                                                          lines={type.budgetLines ?? []} categories={categories}/>
                                </div>
                                <div className="flex shrink-0 flex-wrap items-start justify-end gap-1">
                                    <Button size="icon" variant="ghost" aria-label={t("Catalog.moveUp", {name})}
                                            disabled={pending || !above}
                                            onClick={() => above && run(() => moveEventTypeAction({
                                                id: type.id,
                                                version: type.version,
                                                position: above.position
                                            }))}><ArrowUp/></Button>
                                    <Button size="icon" variant="ghost" aria-label={t("Catalog.moveDown", {name})}
                                            disabled={pending || !below}
                                            onClick={() => below && run(() => moveEventTypeAction({
                                                id: type.id,
                                                version: type.version,
                                                position: below.position
                                            }))}><ArrowDown/></Button>
                                    <Button size="icon" variant="ghost" aria-label={t("EventType.edit", {name})}
                                            onClick={() => setEditing(type)}><Pencil/></Button>
                                    {type.retired ? (
                                        <Button size="icon" variant="ghost" aria-label={t("Catalog.restore", {name})}
                                                disabled={pending}
                                                onClick={() => run(() => restoreEventTypeAction({
                                                    id: type.id,
                                                    version: type.version
                                                }), t("Catalog.restored", {name}))}><ArchiveRestore/></Button>
                                    ) : (
                                        <Button size="icon" variant="ghost" aria-label={t("Catalog.retire", {name})}
                                                disabled={pending}
                                                onClick={() => run(() => retireEventTypeAction({
                                                    id: type.id,
                                                    version: type.version
                                                }), t("Catalog.retiredDone", {name}))}><Archive/></Button>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ol>
            )}
            {(adding || editing) && (
                <TypeSheet key={editing?.id ?? "new"} type={editing} templates={templates} onOpenChange={open => {
                    if (!open) {
                        setAdding(false);
                        setEditing(null);
                    }
                }}/>
            )}
        </div>
    );
}
