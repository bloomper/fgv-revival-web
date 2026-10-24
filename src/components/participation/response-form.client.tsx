"use client";

import {useId, useTransition} from "react";
import {useTranslations} from "next-intl";
import {useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Check, CircleHelp, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {PlainText} from "@/components/plain-text";
import type {PositionValue} from "@/components/participant/participant-labels";
import {describedBy, FieldErrorText, TOUCH_FIELD} from "@/components/participation/participation-section";
import {respondAction} from "@/app/(app)/revivals/[id]/me/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import type {ParticipantResponse} from "@/gql/graphql";
import {ANSWERS, type RespondValues, respondValuesSchema} from "@/lib/participant/schema";
import {formatInstant} from "@/utils/format";
import {track} from "@/utils/umami";
import {cn} from "@/utils/utils";

const ICONS = {YES: Check, MAYBE: CircleHelp, NO: X} as const;

export type ResponseValue = {
    response: ParticipantResponse;
    respondedAt?: string | null;
    comment?: string | null;
    termsAcceptedAt?: string | null;
    registerConsent?: boolean | null;
    preferredPosition?: { id: string } | null;
};

/** The form's starting values from what the participant answered before. */
export function responseDefaults(participant: ResponseValue): RespondValues {
    return {
        response: participant.response === "PENDING" ? "" : participant.response,
        preferredPositionId: participant.preferredPosition?.id ?? "",
        comment: participant.comment ?? "",
        termsAccepted: !!participant.termsAcceptedAt,
        registerConsent: participant.registerConsent == null ? "" : participant.registerConsent ? "yes" : "no",
    };
}

/**
 * The participant's answer (5.6): yes, maybe or no as large choices, a preferred position, a comment, the terms to
 * accept (required for yes) and whether Spexregister may keep their details (asked for yes and maybe). Errors are shown
 * by the field they belong to and read out with it.
 */
export function ResponseForm({revivalId, participant, terms, positions, isHelper}: {
    revivalId: string;
    participant: ResponseValue;
    terms: string[];
    positions: PositionValue[];
    isHelper: boolean;
}) {
    const t = useTranslations();
    const id = useId();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const form = useForm<RespondValues>({
        resolver: zodResolver(respondValuesSchema),
        defaultValues: responseDefaults(participant)
    });
    const {errors} = form.formState;
    const response = useWatch({control: form.control, name: "response"});
    const asksConsent = response === "YES" || response === "MAYBE";
    const message = (key?: string) => key ? t(`Validation.${key}`) : undefined;
    const field = (name: string) => `${id}-${name}`;

    return (
        <form className="flex flex-col gap-6" noValidate
              onSubmit={form.handleSubmit(values => startTransition(async () => {
                  if (feedback(await respondAction({revivalId, values}), t("Participation.responseSaved"))) {
                      track("participation-respond", {response: values.response});
                  }
              }))}>
            {participant.response !== "PENDING" && participant.respondedAt && (
                <p className="text-sm text-muted-foreground">
                    {t("Participation.answeredOn", {
                        response: t(`Participants.responses.${participant.response}`),
                        date: formatInstant(participant.respondedAt) ?? ""
                    })}
                </p>
            )}
            <fieldset
                className="flex flex-col gap-3" {...describedBy(field("response"), {error: errors.response?.message})}>
                <legend className="mb-2 text-sm font-medium">{t("Participation.yourAnswer")}</legend>
                <div className="grid gap-3 sm:grid-cols-3">
                    {ANSWERS.map(answer => {
                        const Icon = ICONS[answer];

                        return (
                            <label key={answer} className={cn(
                                "flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border-2 p-3 text-base font-medium transition-colors",
                                "has-checked:border-primary has-checked:bg-primary/10 has-focus-visible:ring-3 has-focus-visible:ring-ring/50 hover:bg-accent",
                            )}>
                                <input type="radio" value={answer}
                                       className="size-5 shrink-0 accent-primary" {...form.register("response")}/>
                                <Icon className="size-5 text-muted-foreground" aria-hidden/>
                                {t(`Participation.answers.${answer}`)}
                            </label>
                        );
                    })}
                </div>
                <FieldErrorText fieldId={field("response")} message={message(errors.response?.message)}/>
            </fieldset>

            {!isHelper && positions.length > 0 && (
                <div className="flex flex-col gap-2">
                    <Label htmlFor={field("position")}>{t("Participation.preferredPosition")}</Label>
                    <select id={field("position")} aria-describedby={`${field("position")}-hint`}
                            className={cn("w-full rounded-md border border-input bg-transparent px-3 shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30", TOUCH_FIELD)}
                            {...form.register("preferredPositionId")}>
                        <option value="">{t("Participation.noPreference")}</option>
                        {positions.map(position => <option key={position.id}
                                                           value={position.id}>{position.name}</option>)}
                    </select>
                    <p id={`${field("position")}-hint`}
                       className="text-sm text-muted-foreground">{t("Participation.preferredPositionHint")}</p>
                </div>
            )}

            <div className="flex flex-col gap-2">
                <Label htmlFor={field("comment")}>{t("Participation.comment")}</Label>
                <Textarea id={field("comment")} rows={3} className="text-base" {...describedBy(field("comment"), {
                    error: errors.comment?.message,
                    hint: true
                })}
                          {...form.register("comment")}/>
                <p id={`${field("comment")}-hint`}
                   className="text-sm text-muted-foreground">{t("Participation.commentHint")}</p>
                <FieldErrorText fieldId={field("comment")} message={message(errors.comment?.message)}/>
            </div>

            <div className="flex flex-col gap-3">
                <h4 id={field("terms-heading")} className="text-sm font-medium">{t("Participation.terms")}</h4>
                {terms.length > 0 && (
                    <ul aria-labelledby={field("terms-heading")} className="list-disc space-y-2 pl-5 text-sm">
                        {terms.map((term, index) => <li key={index}><PlainText text={term}/></li>)}
                    </ul>
                )}
                <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md text-base">
                    <input type="checkbox" className="size-5 shrink-0 accent-primary"
                           {...describedBy(field("terms"), {
                               error: errors.termsAccepted?.message,
                               hint: true
                           })} {...form.register("termsAccepted")}/>
                    {t("Participation.acceptTerms")}
                </label>
                <p id={`${field("terms")}-hint`}
                   className="text-sm text-muted-foreground">{t("Participation.acceptTermsHint")}</p>
                <FieldErrorText fieldId={field("terms")} message={message(errors.termsAccepted?.message)}/>
            </div>

            {asksConsent && (
                <fieldset className="flex flex-col gap-3" {...describedBy(field("consent"), {
                    error: errors.registerConsent?.message,
                    hint: true
                })}>
                    <legend className="mb-1 text-sm font-medium">{t("Participation.registerConsent")}</legend>
                    <div id={`${field("consent")}-hint`} className="space-y-2 text-sm text-muted-foreground">
                        <p>{t("Participation.registerConsentWhat")}</p>
                        <p>{t("Participation.registerConsentNotFgv")}</p>
                        <p>{t("Participation.registerConsentNoEffect")}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {(["yes", "no"] as const).map(choice => (
                            <label key={choice} className={cn(
                                "flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border-2 p-3 text-base",
                                "has-checked:border-primary has-checked:bg-primary/10 has-focus-visible:ring-3 has-focus-visible:ring-ring/50 hover:bg-accent",
                            )}>
                                <input type="radio" value={choice}
                                       className="size-5 shrink-0 accent-primary" {...form.register("registerConsent")}/>
                                {t(`Participation.consent.${choice}`)}
                            </label>
                        ))}
                    </div>
                    <FieldErrorText fieldId={field("consent")} message={message(errors.registerConsent?.message)}/>
                </fieldset>
            )}

            <Button type="submit" size="lg" className="h-11 w-full sm:w-auto sm:self-start"
                    disabled={pending}>{t("Participation.sendAnswer")}</Button>
        </form>
    );
}
