"use client";

import {useEffect, useId, useState, useTransition} from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {NativeSelect} from "@/components/ui/native-select";
import {Textarea} from "@/components/ui/textarea";
import {GuideMarkdown} from "@/components/guide/guide-markdown";
import type {LocalizedTextValue} from "@/components/guide/localized";
import {PositionSelect, type PositionValue} from "@/components/participant/participant-labels";
import {
    createMailingAction,
    previewAudienceAction,
    updateMailingAction
} from "@/app/(app)/revivals/[id]/mailings/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {
    AUDIENCE_KINDS,
    type AudienceValues,
    audienceValuesSchema,
    type MailingValues,
    mailingValuesSchema,
    MAX_BODY,
    MAX_SUBJECT
} from "@/lib/mailing/schema";
import {formatDate} from "@/utils/format";
import {track} from "@/utils/umami";

export type Preview = { displayName: string; hasAddress: boolean }[];

/** The plan entry a draft comes from, and the template's texts to fill it with. */
export type PlannedFrom = {
    templateId: string;
    eventId: string | null;
    subject?: LocalizedTextValue;
    body?: LocalizedTextValue;
};

/**
 * Who the audience reaches now (`mailingAudiencePreview`), fetched again whenever the audience changes. Null while
 * loading or when the audience is not complete; an error is kept apart so the editor still works.
 */
export function useAudiencePreview(revivalId: string, audience: AudienceValues) {
    const [preview, setPreview] = useState<{ key: string; recipients: Preview | null; failed: boolean } | null>(null);
    const key = `${audience.kind}|${audience.positionId}|${audience.eventId}`;
    const valid = audienceValuesSchema.safeParse(audience).success;

    useEffect(() => {
        if (!valid) {
            return;
        }
        let current = true;
        const [kind, positionId, eventId] = key.split("|");

        void previewAudienceAction({
            revivalId,
            audience: {kind: kind as AudienceValues["kind"], positionId, eventId}
        }).then(result => {
            if (current) {
                setPreview({key, recipients: result.ok ? result.data : null, failed: !result.ok});
            }
        });
        return () => {
            current = false;
        };
    }, [revivalId, key, valid]);

    return valid && preview?.key === key ? preview : null;
}

export function AudiencePreview({preview}: { preview: ReturnType<typeof useAudiencePreview> }) {
    const t = useTranslations("Mailings");

    if (!preview) {
        return <p className="text-sm text-muted-foreground" aria-live="polite">{t("previewLoading")}</p>;
    }
    if (!preview.recipients) {
        return <p className="text-sm text-muted-foreground" aria-live="polite">{t("previewFailed")}</p>;
    }
    const missing = preview.recipients.filter(recipient => !recipient.hasAddress);

    return (
        <div className="space-y-1 text-sm" aria-live="polite">
            <p className="font-medium">{t("recipientsCount", {count: preview.recipients.length})}</p>
            {missing.length > 0 && (
                <p className="text-amber-700 dark:text-amber-400">
                    {t("withoutAddress", {
                        count: missing.length,
                        names: missing.map(recipient => recipient.displayName).join(", ")
                    })}
                </p>
            )}
            {preview.recipients.length > 0 && (
                <details>
                    <summary className="cursor-pointer text-muted-foreground">{t("showRecipients")}</summary>
                    <ul className="mt-1 columns-2 text-muted-foreground sm:columns-3">
                        {preview.recipients.map((recipient, index) => <li key={index}>{recipient.displayName}</li>)}
                    </ul>
                </details>
            )}
        </div>
    );
}

/**
 * Writing a mailing: whom it goes to — with a position or an event where the audience needs one, and a live
 * count and names of who it reaches now — the subject, and the body in Markdown with a preview rendered as the email
 * will be (the guide's safe Markdown, no raw HTML, no images). Saves a draft; sending happens on the mailing's page.
 */
export function MailingEditor({
                                  revivalId,
                                  mailingId,
                                  version,
                                  planned,
                                  defaults,
                                  events,
                                  positions,
                                  positionsUnavailable
                              }: {
    revivalId: string;
    mailingId?: string;
    version?: number;
    planned: PlannedFrom | null;
    defaults: MailingValues;
    events: { id: string; title: string; startDate: string }[];
    positions: PositionValue[];
    positionsUnavailable?: boolean;
}) {
    const t = useTranslations();
    const id = useId();
    const router = useRouter();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const form = useForm<MailingValues>({resolver: zodResolver(mailingValuesSchema), defaultValues: defaults});
    const [audience, body] = useWatch({control: form.control, name: ["audience", "body"]});
    const preview = useAudiencePreview(revivalId, audience);
    const {errors} = form.formState;
    const field = (name: string) => `${id}-${name}`;
    const described = (name: string, message?: string) => message ? {
        "aria-invalid": true,
        "aria-describedby": `${field(name)}-error`
    } : {};
    const error = (name: string, message?: string) => message &&
        <p id={`${field(name)}-error`} className="text-sm text-destructive">{t(`Validation.${message}`)}</p>;
    const fillFrom = (language: "sv" | "en") => {
        const pick = (text?: LocalizedTextValue) => text ? (language === "en" && text.en ? text.en : text.sv) : "";

        form.setValue("subject", pick(planned?.subject), {shouldDirty: true});
        form.setValue("body", pick(planned?.body), {shouldDirty: true});
    };

    return (
        <form className="flex flex-col gap-6" noValidate
              onSubmit={form.handleSubmit(values => startTransition(async () => {
                  const plan = planned ? {templateId: planned.templateId, eventId: planned.eventId} : null;

                  if (mailingId && version !== undefined) {
                      if (feedback(await updateMailingAction({
                          revivalId,
                          id: mailingId,
                          version,
                          planned: plan,
                          values
                      }), t("Mailings.draftSaved"))) {
                          form.reset(values, {keepFieldsRef: true});
                      }
                      return;
                  }
                  const result = await createMailingAction({revivalId, planned: plan, values});

                  if (feedback(result, t("Mailings.draftSaved"))) {
                      track("mailing-draft", {audience: values.audience.kind});
                      router.push(result.data ? `/revivals/${revivalId}/mailings/${result.data}` : `/revivals/${revivalId}/mailings`);
                  }
              }))}>
            <fieldset className="flex flex-col gap-3">
                <legend className="mb-1 text-sm font-medium">{t("Mailings.audience")}</legend>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="space-y-2 sm:w-72">
                        <Label htmlFor={field("kind")}>{t("Mailings.audienceKind")}</Label>
                        <NativeSelect id={field("kind")} className="w-full" {...form.register("audience.kind")}>
                            {AUDIENCE_KINDS.map(kind => <option key={kind}
                                                                value={kind}>{t(`Mailings.audiences.${kind}`)}</option>)}
                        </NativeSelect>
                    </div>
                    {audience.kind === "POSITION" && (
                        <div className="space-y-2 sm:flex-1">
                            <Label htmlFor={field("position")}>{t("Mailings.position")}</Label>
                            <PositionSelect id={field("position")} positions={positions}
                                            emptyLabel={t("Mailings.choosePosition")}
                                            {...described("position", errors.audience?.positionId?.message)} {...form.register("audience.positionId")}/>
                            {positionsUnavailable &&
                                <p className="text-xs text-muted-foreground">{t("Mailings.positionsUnavailable")}</p>}
                            {error("position", errors.audience?.positionId?.message)}
                        </div>
                    )}
                    {audience.kind === "EVENT_ATTENDEES" && (
                        <div className="space-y-2 sm:flex-1">
                            <Label htmlFor={field("event")}>{t("Mailings.event")}</Label>
                            <NativeSelect id={field("event")}
                                          className="w-full" {...described("event", errors.audience?.eventId?.message)} {...form.register("audience.eventId")}>
                                <option value="">{t("Mailings.chooseEvent")}</option>
                                {events.map(event => <option key={event.id}
                                                             value={event.id}>{`${event.title} (${formatDate(event.startDate)})`}</option>)}
                            </NativeSelect>
                            {error("event", errors.audience?.eventId?.message)}
                        </div>
                    )}
                </div>
                <p className="text-xs text-muted-foreground">{t(`Mailings.audienceHints.${audience.kind}`)}</p>
                <AudiencePreview preview={preview}/>
            </fieldset>

            {planned?.subject && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-muted-foreground">{t("Mailings.fillFromTemplate")}</span>
                    <Button type="button" variant="outline" size="sm"
                            onClick={() => fillFrom("sv")}>{t("Mailings.swedish")}</Button>
                    <Button type="button" variant="outline" size="sm"
                            onClick={() => fillFrom("en")}>{t("Mailings.english")}</Button>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor={field("subject")}>{t("Mailings.subject")}</Label>
                <Input id={field("subject")} maxLength={MAX_SUBJECT}
                       autoComplete="off" {...described("subject", errors.subject?.message)} {...form.register("subject")}/>
                {error("subject", errors.subject?.message)}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor={field("body")}>{t("Mailings.body")}</Label>
                    <Textarea id={field("body")} rows={14} maxLength={MAX_BODY} className="font-mono text-sm"
                              aria-describedby={`${field("body")}-hint`} {...described("body", errors.body?.message)} {...form.register("body")}/>
                    <p id={`${field("body")}-hint`}
                       className="text-xs text-muted-foreground">{t("Mailings.bodyHint")}</p>
                    {error("body", errors.body?.message)}
                </div>
                <section aria-labelledby={field("preview")} className="space-y-2">
                    <h5 id={field("preview")} className="text-sm font-medium">{t("Mailings.preview")}</h5>
                    <div className="min-h-40 rounded-md border p-4 text-sm">
                        {body?.trim() ? <GuideMarkdown>{body}</GuideMarkdown> :
                            <p className="text-muted-foreground">{t("Mailings.previewEmpty")}</p>}
                    </div>
                </section>
            </div>

            <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={pending}>{t("Mailings.saveDraft")}</Button>
            </div>
        </form>
    );
}
