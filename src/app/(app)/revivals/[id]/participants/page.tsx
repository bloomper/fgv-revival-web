import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {ParticipantDashboard} from "@/components/participant/participant-dashboard";
import {ParticipantTable} from "@/components/participant/participant-table.client";
import {ReferralPanel} from "@/components/participant/referral-panel.client";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getParticipants, getParticipantsOverview, getPositions} from "@/lib/participant/participant.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

async function loadOverview(id: string) {
    try {
        return await getParticipantsOverview(id);
    } catch (error) {
        if (error instanceof GraphQLRequestError && (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")) {
            return null;
        }
        throw error;
    }
}

// Names come from Spexregister: without it the list says so, and the counts and settings still show (constitution VI)
async function loadParticipants(id: string, includeRemoved: boolean) {
    try {
        return {participants: await getParticipants(id, includeRemoved), unavailable: false};
    } catch (error) {
        if (error instanceof GraphQLRequestError && error.code === "SPEXREGISTER_UNAVAILABLE") {
            return {participants: [], unavailable: true};
        }
        throw error;
    }
}

async function loadPositions() {
    try {
        return await getPositions();
    } catch (error) {
        if (error instanceof GraphQLRequestError) {
            return {positions: [], vocalParts: []};
        }
        throw error;
    }
}

/**
 * A revival's participants and helpers (M6a, 5.6): the counts, the list with its actions and the participants'
 * suggestions. Only the directeurs, the steering group and super admins find it; everyone else is shown not found.
 */
export default async function ParticipantsPage({params, searchParams}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const {id} = await params;
    const showRemoved = (await searchParams).removed === "1";

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const revival = await loadOverview(id);

        if (!revival?.permissions.canReadParticipants) {
            notFound();
        }

        const [{participants, unavailable}, {positions, vocalParts}] = await Promise.all([loadParticipants(revival.id, showRemoved), loadPositions()]);
        const t = await getTranslations("Participants");
        const {permissions} = revival;
        const settings = revival.participationSettings ?? {swishNumber: null, whatsappLink: null, terms: null, version: 0};

        return (
            <div className="flex flex-1 flex-col gap-6">
                <h3 className="sr-only">{t("title")}</h3>
                {revival.participantCounts && <ParticipantDashboard counts={revival.participantCounts}/>}
                <ReferralPanel revivalId={revival.id} referrals={revival.referrals} canWrite={permissions.canWriteParticipants}/>
                {unavailable ? (
                    <Alert>
                        <AlertTitle>{t("unavailableTitle")}</AlertTitle>
                        <AlertDescription>{t("unavailable")}</AlertDescription>
                    </Alert>
                ) : (
                    <ParticipantTable revivalId={revival.id} participants={participants} positions={positions} vocalParts={vocalParts} settings={settings}
                                      canWrite={permissions.canWriteParticipants} canWriteBudget={permissions.canWriteBudget}
                                      canReadDietary={permissions.canReadDietary} showRemoved={showRemoved}/>
                )}
            </div>
        );
    });
}
