"use client";

import {useId, useState, useTransition} from "react";
import {useFormatter, useLocale, useTranslations} from "next-intl";
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
import {Textarea} from "@/components/ui/textarea";
import {catalogName} from "@/components/catalog/catalog";
import {GuideMarkdown} from "@/components/guide/guide-markdown";
import type {LocalizedTextValue} from "@/components/guide/localized";
import {RelativeDeadlineField} from "@/components/checklist/template/relative-deadline-field.client";
import {
    createMailingTemplateAction,
    moveMailingTemplateAction,
    restoreMailingTemplateAction,
    retireMailingTemplateAction,
    updateMailingTemplateAction,
} from "@/app/(app)/admin/mailing-templates/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import type {MailingAudienceKind, RelativeDeadlineKind, Weekday} from "@/gql/graphql";
import type {ActionResult} from "@/lib/graphql.server";
import {
    AUDIENCE_KINDS,
    type MailingTemplateValues,
    mailingTemplateValuesSchema,
    MAX_BODY,
    MAX_SUBJECT,
    MAX_TEMPLATE_NAME,
} from "@/lib/mailing/schema";

type EventTypeOption = { id: string; name: LocalizedTextValue; retired: boolean };

export type MailingTemplateRow = {
    id: string;
    name: LocalizedTextValue;
    subject: LocalizedTextValue;
    body: LocalizedTextValue;
    audience: MailingAudienceKind;
    eventType?: EventTypeOption | null;
    due: { kind: RelativeDeadlineKind; amount?: number | null; weekday?: Weekday | null };
    position: number;
    retired: boolean;
    version: number;
};

const LANGUAGES = ["sv", "en"] as const;

function initialValues(template: MailingTemplateRow | null): MailingTemplateValues {
    const text = (value?: LocalizedTextValue) => ({sv: value?.sv ?? "", en: value?.en ?? ""});

    return {
        name: text(template?.name),
        subject: text(template?.subject),
        body: text(template?.body),
        audience: template?.audience ?? "PARTICIPANTS",
        eventTypeId: template?.eventType?.id ?? "",
        due: template?.due ? {
                kind: template.due.kind,
                amount: template.due.amount ?? null,
                weekday: template.due.weekday ?? null
            }
            : {kind: "WEEKDAY_WEEK_BEFORE", amount: null, weekday: "MONDAY"},
    };
}

/** The due rule in words: "Monday the week before", "7 days before". */
function useDueText() {
    const t = useTranslations("ChecklistTemplate.deadline");
    const format = useFormatter();

    return (due: MailingTemplateRow["due"]) => due.kind === "WEEKDAY_WEEK_BEFORE"
        ? t("weekdayRule", {weekday: t(`weekdays.${due.weekday ?? "MONDAY"}`)})
        : t(`${due.kind}Rule`, {
            amount: format.number(Math.abs(due.amount ?? 0)),
            direction: (due.amount ?? 0) <= 0 ? "before" : "after"
        });
}

function TemplateSheet({template, eventTypes, onOpenChange}: {
    template: MailingTemplateRow | null;
    eventTypes: EventTypeOption[];
    onOpenChange: (open: boolean) => void
}) {
    const t = useTranslations();
    const id = useId();
    const locale = useLocale();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const form = useForm<MailingTemplateValues>({
        resolver: zodResolver(mailingTemplateValuesSchema),
        defaultValues: initialValues(template)
    });
    const body = useWatch({control: form.control, name: "body"});
    const {errors} = form.formState;
    const held = template?.eventType;
    const choices = held && !eventTypes.some(type => type.id === held.id) ? [...eventTypes, held] : eventTypes;
    const error = (message?: string) => message &&
        <p className="text-sm text-destructive">{t(`Validation.${message}`)}</p>;

    return (
        <Sheet open onOpenChange={onOpenChange}>
            <SheetContent className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-[720px]">
                <SheetHeader className="shrink-0 p-6 pb-4">
                    <SheetTitle>{template ? t("MailingTemplate.editTitle") : t("MailingTemplate.create")}</SheetTitle>
                    <SheetDescription>{t("MailingTemplate.dialogDescription")}</SheetDescription>
                </SheetHeader>
                <form className="flex min-h-0 flex-1 flex-col overflow-hidden" noValidate
                      onSubmit={form.handleSubmit(values => startTransition(async () => {
                          const result = template
                              ? await updateMailingTemplateAction({id: template.id, version: template.version, values})
                              : await createMailingTemplateAction({values});

                          if (feedback(result, t("Common.saved"))) {
                              onOpenChange(false);
                          }
                      }))}>
                    <ScrollArea className="min-h-0 flex-1 border-t">
                        <div className="space-y-4 px-6 py-6 pb-12">
                            <div className="grid gap-4 sm:grid-cols-2">
                                {LANGUAGES.map(language => (
                                    <div key={language} className="space-y-2">
                                        <Label
                                            htmlFor={`${id}-name-${language}`}>{t(language === "sv" ? "Catalog.nameSv" : "Catalog.nameEn")}</Label>
                                        <Input id={`${id}-name-${language}`}
                                               maxLength={MAX_TEMPLATE_NAME} {...form.register(`name.${language}`)}/>
                                        {error(errors.name?.[language]?.message)}
                                    </div>
                                ))}
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-audience`}>{t("Mailings.audienceKind")}</Label>
                                    <NativeSelect id={`${id}-audience`}
                                                  className="w-full" {...form.register("audience")}>
                                        {AUDIENCE_KINDS.map(kind => <option key={kind}
                                                                            value={kind}>{t(`Mailings.audiences.${kind}`)}</option>)}
                                    </NativeSelect>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-type`}>{t("MailingTemplate.relativeTo")}</Label>
                                    <NativeSelect id={`${id}-type`}
                                                  className="w-full" {...form.register("eventTypeId")}>
                                        <option value="">{t("MailingTemplate.premiere")}</option>
                                        {choices.map(type => (
                                            <option key={type.id} value={type.id}>
                                                {type.retired ? t("Catalog.retiredName", {name: catalogName(type, locale)}) : catalogName(type, locale)}
                                            </option>
                                        ))}
                                    </NativeSelect>
                                </div>
                            </div>
                            <Controller control={form.control} name="due" render={({field}) => (
                                <RelativeDeadlineField label={t("MailingTemplate.due")} required value={field.value}
                                                       onChange={value => value && field.onChange(value)}/>
                            )}/>
                            {error(errors.due?.amount?.message)}
                            {LANGUAGES.map(language => (
                                <fieldset key={language} className="space-y-2">
                                    <legend
                                        className="text-sm font-medium">{t(language === "sv" ? "EventType.swedish" : "EventType.english")}</legend>
                                    <Label htmlFor={`${id}-subject-${language}`}
                                           className="text-muted-foreground">{t("Mailings.subject")}</Label>
                                    <Input id={`${id}-subject-${language}`}
                                           maxLength={MAX_SUBJECT} {...form.register(`subject.${language}`)}/>
                                    {error(errors.subject?.[language]?.message)}
                                    <Label htmlFor={`${id}-body-${language}`}
                                           className="text-muted-foreground">{t("Mailings.body")}</Label>
                                    <Textarea id={`${id}-body-${language}`} rows={8} maxLength={MAX_BODY}
                                              className="font-mono text-sm" {...form.register(`body.${language}`)}/>
                                    {error(errors.body?.[language]?.message)}
                                    {body?.[language]?.trim() && (
                                        <details className="rounded-md border p-3 text-sm">
                                            <summary
                                                className="cursor-pointer text-muted-foreground">{t("Mailings.preview")}</summary>
                                            <div className="mt-2"><GuideMarkdown>{body[language]}</GuideMarkdown></div>
                                        </details>
                                    )}
                                </fieldset>
                            ))}
                            <p className="text-xs text-muted-foreground">{t("Mailings.bodyHint")}</p>
                        </div>
                    </ScrollArea>
                    <SheetFooter className="mt-auto shrink-0 border-t bg-muted/30 p-6 pt-4">
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
 * The mailing plan's templates in order: added, changed, moved, retired and restored. Each says when it is due,
 * relative to every event of a type or to the premiere, and whom it goes to. Templates are never deleted.
 */
export function MailingTemplateEditor({templates, eventTypes}: {
    templates: MailingTemplateRow[];
    eventTypes: EventTypeOption[]
}) {
    const t = useTranslations();
    const locale = useLocale();
    const dueText = useDueText();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const [editing, setEditing] = useState<MailingTemplateRow | null>(null);
    const [adding, setAdding] = useState(false);
    const run = (work: () => Promise<ActionResult<null>>, success?: string) => startTransition(async () => {
        feedback(await work(), success);
    });

    return (
        <div className="space-y-3">
            <Button onClick={() => setAdding(true)}><Plus/>{t("MailingTemplate.create")}</Button>
            {templates.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("Catalog.empty")}</p>
            ) : (
                <ol className="space-y-2" aria-label={t("MailingTemplate.title")}>
                    {templates.map((template, index) => {
                        const name = template.name.sv;
                        const above = templates[index - 1];
                        const below = templates[index + 1];

                        return (
                            <li key={template.id} className="flex gap-3 rounded-lg border p-3">
                                <div className="min-w-0 flex-1 space-y-1">
                                    <p className={template.retired ? "text-muted-foreground" : "font-medium"}>{name}</p>
                                    {template.name.en &&
                                        <p className="text-sm text-muted-foreground">{template.name.en}</p>}
                                    <p className="text-sm text-muted-foreground">
                                        {t("MailingTemplate.dueRule", {
                                            rule: dueText(template.due),
                                            target: template.eventType ? catalogName(template.eventType, locale) : t("MailingTemplate.thePremiere"),
                                        })}
                                    </p>
                                    <div className="flex flex-wrap gap-2 text-sm">
                                        <Badge
                                            variant="secondary">{t(`Mailings.audiences.${template.audience}`)}</Badge>
                                        {template.retired && <Badge variant="outline">{t("Catalog.retired")}</Badge>}
                                    </div>
                                </div>
                                <div className="flex shrink-0 flex-wrap items-start justify-end gap-1">
                                    <Button size="icon" variant="ghost" aria-label={t("Catalog.moveUp", {name})}
                                            disabled={pending || !above}
                                            onClick={() => above && run(() => moveMailingTemplateAction({
                                                id: template.id,
                                                version: template.version,
                                                position: above.position
                                            }))}><ArrowUp/></Button>
                                    <Button size="icon" variant="ghost" aria-label={t("Catalog.moveDown", {name})}
                                            disabled={pending || !below}
                                            onClick={() => below && run(() => moveMailingTemplateAction({
                                                id: template.id,
                                                version: template.version,
                                                position: below.position
                                            }))}><ArrowDown/></Button>
                                    <Button size="icon" variant="ghost" aria-label={t("MailingTemplate.edit", {name})}
                                            onClick={() => setEditing(template)}><Pencil/></Button>
                                    {template.retired ? (
                                        <Button size="icon" variant="ghost" aria-label={t("Catalog.restore", {name})}
                                                disabled={pending}
                                                onClick={() => run(() => restoreMailingTemplateAction({
                                                    id: template.id,
                                                    version: template.version
                                                }), t("Catalog.restored", {name}))}><ArchiveRestore/></Button>
                                    ) : (
                                        <Button size="icon" variant="ghost" aria-label={t("Catalog.retire", {name})}
                                                disabled={pending}
                                                onClick={() => run(() => retireMailingTemplateAction({
                                                    id: template.id,
                                                    version: template.version
                                                }), t("Catalog.retiredDone", {name}))}><Archive/></Button>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ol>
            )}
            {(adding || editing) && (
                <TemplateSheet key={editing?.id ?? "new"} template={editing}
                               eventTypes={eventTypes.filter(type => !type.retired)} onOpenChange={open => {
                    if (!open) {
                        setAdding(false);
                        setEditing(null);
                    }
                }}/>
            )}
        </div>
    );
}
