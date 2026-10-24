import Link from "next/link";
import {notFound} from "next/navigation";
import {getLocale, getTranslations} from "next-intl/server";
import {ArrowLeft} from "lucide-react";
import {GuideMarkdown} from "@/components/guide/guide-markdown";
import {pickText} from "@/components/guide/localized";
import {MailingActions} from "@/components/mailing/mailing-actions.client";
import {MailingEditor} from "@/components/mailing/mailing-editor.client";
import {AudienceText, MailingStatusBadge, RecipientStatusBadge} from "@/components/mailing/mailing-labels";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getMailing, getMailingEditorOptions, loadMailingPositions} from "@/lib/mailing/mailing.server";
import type {AudienceValues} from "@/lib/mailing/schema";
import {formatDate, formatInstant} from "@/utils/format";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

async function load(revivalId: string, id: string) {
    try {
        return await getMailing(revivalId, id);
    } catch (error) {
        if (error instanceof GraphQLRequestError && (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")) {
            return null;
        }
        throw error;
    }
}

/**
 * One mailing (M6b). A draft is edited here by those who draft, and sent after a confirmation by the directeur or
 * COMMS; a sent mailing shows its text and each recipient's status by name, and sends again to those it failed for.
 */
export default async function MailingPage({params}: { params: Promise<{ id: string; mailingId: string }> }) {
    const {id, mailingId} = await params;

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const data = await load(id, mailingId);

        if (!data?.revival.permissions.canReadMailings || !data.mailing || data.mailing.revivalId !== data.revival.id) {
            notFound();
        }

        const t = await getTranslations("Mailings");
        const locale = await getLocale();
        const {revival, mailing} = data;
        const {permissions} = revival;
        const editable = mailing.status === "DRAFT" && permissions.canDraftMailings;
        const audience: AudienceValues = {
            kind: mailing.audience.kind,
            positionId: mailing.audience.position?.id ?? "",
            eventId: mailing.audience.event?.id ?? ""
        };
        const [options, positions] = editable ? await Promise.all([getMailingEditorOptions(revival.id), loadMailingPositions()]) : [null, null];
        const failed = mailing.recipients.filter(recipient => recipient.status === "FAILED").length;

        return (
            <div className="flex flex-1 flex-col gap-4">
                <Link href={`/revivals/${revival.id}/mailings`}
                      className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="size-4"/>{t("back")}
                </Link>
                <div className="flex flex-col gap-2">
                    <h3 className="flex flex-wrap items-center gap-2 text-lg font-semibold">
                        {mailing.subject}<MailingStatusBadge status={mailing.status}/>
                    </h3>
                    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                        <dt className="text-muted-foreground">{t("audience")}</dt>
                        <dd><AudienceText audience={mailing.audience}/></dd>
                        {mailing.plannedFor && (
                            <>
                                <dt className="text-muted-foreground">{t("plannedFor")}</dt>
                                <dd>{t("fromPlan", {
                                    name: pickText(mailing.plannedFor.template.name, locale).text,
                                    date: formatDate(mailing.plannedFor.dueDate) ?? ""
                                })}</dd>
                            </>
                        )}
                        <dt className="text-muted-foreground">{t("createdBy")}</dt>
                        <dd className="tabular-nums">{[mailing.createdBy?.displayName, formatInstant(mailing.createdAt)].filter(Boolean).join(", ")}</dd>
                        {mailing.sentAt && (
                            <>
                                <dt className="text-muted-foreground">{t("sentBy")}</dt>
                                <dd className="tabular-nums">{[mailing.sentBy?.displayName, formatInstant(mailing.sentAt)].filter(Boolean).join(", ")}</dd>
                            </>
                        )}
                    </dl>
                    <MailingActions revivalId={revival.id} mailing={mailing} audience={audience}
                                    canSend={mailing.canSend}
                                    canDraft={permissions.canDraftMailings}
                                    canRetry={mailing.status === "SENT" && failed > 0 && permissions.canSendMailings}/>
                </div>

                {editable && options && positions ? (
                    <MailingEditor revivalId={revival.id} mailingId={mailing.id} version={mailing.version}
                                   events={options.events}
                                   positions={positions.positions} positionsUnavailable={positions.unavailable}
                                   planned={mailing.plannedFor ? {
                                       templateId: mailing.plannedFor.template.id,
                                       eventId: mailing.plannedFor.event?.id ?? null
                                   } : null}
                                   defaults={{audience, subject: mailing.subject, body: mailing.body}}/>
                ) : (
                    <section aria-labelledby="mailing-body" className="flex flex-col gap-2">
                        <h4 id="mailing-body" className="font-semibold">{t("body")}</h4>
                        <div className="max-w-prose rounded-md border p-4 text-sm">
                            <GuideMarkdown>{mailing.body}</GuideMarkdown></div>
                    </section>
                )}

                {mailing.status === "SENT" && (
                    <section aria-labelledby="mailing-recipients" className="flex flex-col gap-2">
                        <h4 id="mailing-recipients"
                            className="font-semibold">{t("recipientsTitle", {count: mailing.recipients.length})}</h4>
                        <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                            {mailing.recipients.map((recipient, index) => (
                                <li key={index}
                                    className="flex items-center justify-between gap-2 rounded-md border px-3 py-1.5 text-sm">
                                    <span>{recipient.displayName}</span>
                                    <RecipientStatusBadge status={recipient.status}/>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        );
    });
}
