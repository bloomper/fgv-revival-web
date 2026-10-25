import type {ReactNode} from "react";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import type {RevivalStatus} from "@/gql/graphql";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {AnonymizeCard} from "@/components/closing/anonymize-card.client";
import {ClosingSummary} from "@/components/closing/closing-summary";
import {MembershipForm} from "@/components/closing/membership-form.client";
import {SyncPanel} from "@/components/closing/sync-panel.client";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getMembershipParticipants, getRevivalClosing, getSyncPreview} from "@/lib/closing/closing.server";
import {syncIncomplete} from "@/lib/closing/schema";
import {participantName} from "@/lib/participant/contact";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

// Spexregister is asked for the preview only once the revival is closing, or when the caller may start the sync
const SYNC_STATUSES: RevivalStatus[] = ["CLOSING", "SETTLING", "ARCHIVED"];

async function load(id: string) {
    try {
        return await getRevivalClosing(id);
    } catch (error) {
        if (error instanceof GraphQLRequestError && (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")) {
            return null;
        }
        throw error;
    }
}

// Names come from Spexregister: without it the membership list says so, and the rest of the page still works
async function loadMembership(id: string) {
    try {
        const participants = await getMembershipParticipants(id);

        return {
            participants: participants
                .filter(participant => participant.kind === "PARTICIPANT" && participant.response === "YES" && !participant.removed)
                .map(participant => ({
                    id: participant.id,
                    name: participantName(participant),
                    membershipPaid: participant.membershipPaid
                }))
                .sort((a, b) => a.name.localeCompare(b.name, "sv")),
            unavailable: false,
        };
    } catch (error) {
        if (error instanceof GraphQLRequestError && error.code === "SPEXREGISTER_UNAVAILABLE") {
            return {participants: [], unavailable: true};
        }
        throw error;
    }
}

async function loadPreview(id: string) {
    try {
        return {preview: await getSyncPreview(id), unavailable: false};
    } catch (error) {
        if (error instanceof GraphQLRequestError && error.code === "SPEXREGISTER_UNAVAILABLE") {
            return {preview: null, unavailable: true};
        }
        if (error instanceof GraphQLRequestError && error.code === "FORBIDDEN") {
            return {preview: null, unavailable: false};
        }
        throw error;
    }
}

function Section({title, description, children}: { title: string; description?: string; children: ReactNode }) {
    return (
        <Card role="region" aria-label={title}>
            <CardHeader>
                <CardTitle><h4>{title}</h4></CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}

/**
 * Closing a revival: where it stands, FGV membership, the participation sync to
 * Spexregister, and anonymization. Readers of the revival's work find it; each part shows its controls only with the
 * permission the server gives for it.
 */
export default async function ClosingPage({params}: { params: Promise<{ id: string }> }) {
    const {id} = await params;

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const revival = await load(id);

        if (!revival?.permissions.canReadWork || !revival.closing) {
            notFound();
        }

        const t = await getTranslations("Closing");
        const {permissions, closing} = revival;
        const anonymized = !!(revival.anonymizedAt ?? closing.anonymizedAt);
        const syncReady = !anonymized && (SYNC_STATUSES.includes(revival.status) || permissions.canSync);
        const [membership, sync] = await Promise.all([
            !anonymized && permissions.canReadParticipants ? loadMembership(revival.id) : null,
            syncReady ? loadPreview(revival.id) : null,
        ]);
        const preview = sync?.preview ?? null;

        return (
            <div className="flex flex-1 flex-col gap-6">
                <h3 className="sr-only">{t("title")}</h3>
                <ClosingSummary revivalId={revival.id} closing={closing} canReadBudget={permissions.canReadBudget}
                                canWriteLog={permissions.canWriteLog} members={revival.ownerCandidates}/>

                {membership && (
                    <Section title={t("membership")} description={t("membershipDescription")}>
                        {membership.unavailable ? (
                            <Alert>
                                <AlertTitle>{t("unavailableTitle")}</AlertTitle>
                                <AlertDescription>{t("unavailable")}</AlertDescription>
                            </Alert>
                        ) : (
                            <MembershipForm key={`${closing.membershipYear}-${closing.membershipsPaid}`}
                                            revivalId={revival.id}
                                            year={closing.membershipYear ?? revival.year}
                                            participants={membership.participants}
                                            canWrite={permissions.canSetMembership}/>
                        )}
                    </Section>
                )}

                {!anonymized && (
                    <Section title={t("sync.title")} description={t("sync.description")}>
                        {sync?.unavailable ? (
                            <Alert>
                                <AlertTitle>{t("unavailableTitle")}</AlertTitle>
                                <AlertDescription>{t("sync.unavailable")}</AlertDescription>
                            </Alert>
                        ) : preview ? (
                            <SyncPanel key={`${preview.hash}-${preview.lastRun?.id}-${preview.lastRun?.status}`}
                                       revivalId={revival.id}
                                       preview={preview} canSync={permissions.canSync}/>
                        ) : (
                            <p className="text-sm text-muted-foreground">{t("sync.notYet")}</p>
                        )}
                    </Section>
                )}

                {(permissions.canAnonymize || anonymized || closing.autoAnonymizeOn) && (
                    <Section title={t("anonymize.title")}>
                        <AnonymizeCard revival={revival} anonymizedAt={revival.anonymizedAt ?? closing.anonymizedAt}
                                       autoAnonymizeOn={closing.autoAnonymizeOn}
                                       canAnonymize={permissions.canAnonymize}
                                       syncIncomplete={syncIncomplete(closing.lastSync)}/>
                    </Section>
                )}
            </div>
        );
    });
}
