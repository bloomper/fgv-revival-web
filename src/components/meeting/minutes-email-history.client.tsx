"use client";

import * as React from "react";
import {useTransition} from "react";
import {useLocale, useTranslations} from "next-intl";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {retryMinutesAction} from "@/app/(app)/revivals/[id]/meetings/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {formatInstant} from "@/utils/format";

type Email = {
    id: string;
    sentAt: string;
    sentBy: { displayName?: string | null };
    waitingLeftOut: number;
    recipients: { person: { id: string; displayName?: string | null }; status: "SENT" | "FAILED" }[];
};

/**
 * Earlier sends of the minutes, with who did not get each. Only the latest send can be sent again, to those it did not
 * reach, so a retry that reached everyone settles the earlier failures (M3 FR-021).
 */
export function MinutesEmailHistory({revivalId, meetingId, emails, canSend}: {
    revivalId: string;
    meetingId: string;
    emails: Email[];
    canSend: boolean;
}) {
    const t = useTranslations("Meeting");
    const locale = useLocale();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const latest = [...emails].sort((a, b) => b.sentAt.localeCompare(a.sentAt)).at(0);
    const retryable = latest?.recipients.some(recipient => recipient.status === "FAILED") ? latest : undefined;

    return (
        <section className="space-y-1 text-sm" aria-label={t("emails")}>
            <h3 className="font-medium">{t("emails")}</h3>
            <ul className="space-y-2 text-muted-foreground">
                {emails.map(email => {
                    const failed = email.recipients.filter(recipient => recipient.status === "FAILED");

                    return (
                        <li key={email.id} className="space-y-1">
                            <p>{t("emailEntry", {
                                at: formatInstant(email.sentAt, locale) ?? email.sentAt, name: email.sentBy.displayName ?? "",
                                count: email.recipients.length - failed.length,
                            })}</p>
                            {email.waitingLeftOut > 0 && <p>{t("waitingLeftOut", {count: email.waitingLeftOut})}</p>}
                            {failed.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-destructive">
                                        {t("emailFailed")} {failed.map(recipient => recipient.person.displayName ?? "").join(", ")}
                                    </span>
                                    {canSend && email.id === retryable?.id && (
                                        <Button size="sm" variant="outline" disabled={pending} onClick={() => startTransition(async () => {
                                            const outcome = await retryMinutesAction({emailId: email.id, revivalId, meetingId});

                                            if (feedback(outcome) && outcome.data.failed.length === 0) {
                                                toast.success(t("emailSent", {count: outcome.data.sent}));
                                            }
                                        })}>{t("sendAgain")}</Button>
                                    )}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
