import "server-only";

import {graphql} from "@/gql";
import type {
    ContactInput,
    ParticipantAddInput,
    ParticipantsInviteInput,
    ParticipantUpdateInput,
    ParticipationRespondInput,
    ParticipationSettingsInput,
    ReferralInput,
    ReferralOutcome,
} from "@/gql/graphql";
import {runMutation, runQuery} from "@/lib/graphql.server";

// Participants, invitations and the participant's own page (M6a, contract participant.graphqls). Names and contact
// details come from Spexregister, so the list, the candidates and the positions are fetched on their own: one of them
// failing with SPEXREGISTER_UNAVAILABLE leaves the rest of the page working.

const ParticipantsOverviewQuery = graphql(`
    query ParticipantsOverview($id: ID!) {
        revival(id: $id) {
            id
            title
            status
            permissions { canReadParticipants canWriteParticipants canReadDietary canWriteBudget }
            participantCounts {
                total
                byResponse { response count }
                byPosition { position { ...PositionFields } yes maybe pending }
                notInvited
                waitingForAccess
                feesPaid
                feesUnpaid
                helpers
            }
            participationSettings { ...ParticipationSettingsFields }
            referrals { id name contact comment referredBy createdAt }
        }
    }
`);

const ParticipantsQuery = graphql(`
    query Participants($revivalId: ID!, $includeRemoved: Boolean!) {
        participants(revivalId: $revivalId, includeRemoved: $includeRemoved) { ...ParticipantFields }
    }
`);

const PositionsQuery = graphql(`
    query Positions {
        positions { ...PositionFields }
        vocalParts { id name }
    }
`);

const ParticipantCandidatesQuery = graphql(`
    query ParticipantCandidates($revivalId: ID!) {
        participantCandidates(revivalId: $revivalId) { ...SpexareCandidateFields }
    }
`);

const SpexareSearchQuery = graphql(`
    query SpexareSearch($revivalId: ID!, $query: String!) {
        spexareSearch(revivalId: $revivalId, query: $query) { ...SpexareCandidateFields }
    }
`);

const MyParticipationQuery = graphql(`
    query MyParticipation($revivalId: ID!) {
        myParticipation(revivalId: $revivalId) {
            participant {
                id
                kind
                firstName
                lastName
                nickName
                pending
                response
                respondedAt
                comment
                termsAcceptedAt
                registerConsent
                preferredPosition { ...PositionFields }
                fee
                feePaid
                feePaidAt
                version
            }
            revival {
                id
                title
                premiereDate
                shows { date time venue }
                calendarFeed { createdAt }
                permissions { canSubscribeCalendar }
            }
            terms
            contact { email phone streetAddress postalCode city }
            dietary
            swish { number amount message qrAvailable }
            whatsappLink
            steeringGroup { id displayName }
            events { id title startDate endDate startTime endTime location }
            availability { ...AvailabilityDayFields }
            shifts { ...ShiftSlotFields }
            openShifts { ...ShiftSlotFields }
            materials { ...MaterialFields }
        }
    }
`);

const ParticipantAddMutation = graphql(`
    mutation ParticipantAdd($input: ParticipantAddInput!) {
        participantAdd(input: $input) { id }
    }
`);

const ParticipantsAddSpexareMutation = graphql(`
    mutation ParticipantsAddSpexare($revivalId: ID!, $spexareIds: [ID!]!) {
        participantsAddSpexare(revivalId: $revivalId, spexareIds: $spexareIds) { id }
    }
`);

const ParticipantUpdateMutation = graphql(`
    mutation ParticipantUpdate($input: ParticipantUpdateInput!) {
        participantUpdate(input: $input) { id }
    }
`);

const ParticipantRemoveMutation = graphql(`
    mutation ParticipantRemove($id: ID!, $version: Int!) {
        participantRemove(id: $id, version: $version)
    }
`);

const ParticipantsInviteMutation = graphql(`
    mutation ParticipantsInvite($input: ParticipantsInviteInput!) {
        participantsInvite(input: $input) {
            invited { id }
            skipped { reason participant { id firstName lastName nickName removed } }
        }
    }
`);

const ParticipantFeeSetPaidMutation = graphql(`
    mutation ParticipantFeeSetPaid($id: ID!, $version: Int!, $paid: Boolean!) {
        participantFeeSetPaid(id: $id, version: $version, paid: $paid) { id }
    }
`);

const ParticipationSettingsUpdateMutation = graphql(`
    mutation ParticipationSettingsUpdate($input: ParticipationSettingsInput!) {
        participationSettingsUpdate(input: $input) { version }
    }
`);

const ReferralHandleMutation = graphql(`
    mutation ReferralHandle($id: ID!, $outcome: ReferralOutcome!) {
        referralHandle(id: $id, outcome: $outcome) { id }
    }
`);

const ParticipationRespondMutation = graphql(`
    mutation ParticipationRespond($input: ParticipationRespondInput!) {
        participationRespond(input: $input) { participant { id response } }
    }
`);

const ParticipationContactUpdateMutation = graphql(`
    mutation ParticipationContactUpdate($input: ContactInput!) {
        participationContactUpdate(input: $input) { participant { id } }
    }
`);

const ParticipationDietarySetMutation = graphql(`
    mutation ParticipationDietarySet($revivalId: ID!, $text: String) {
        participationDietarySet(revivalId: $revivalId, text: $text) { participant { id } }
    }
`);

const ReferralCreateMutation = graphql(`
    mutation ReferralCreate($input: ReferralInput!) {
        referralCreate(input: $input)
    }
`);

export async function getParticipantsOverview(id: string) {
    return (await runQuery(ParticipantsOverviewQuery, {id}))?.revival ?? null;
}

export async function getParticipants(revivalId: string, includeRemoved: boolean) {
    return (await runQuery(ParticipantsQuery, {revivalId, includeRemoved}))?.participants ?? [];
}

export async function getPositions() {
    const data = await runQuery(PositionsQuery, {});

    return {positions: data?.positions ?? [], vocalParts: data?.vocalParts ?? []};
}

export async function getParticipantCandidates(revivalId: string) {
    return (await runQuery(ParticipantCandidatesQuery, {revivalId}))?.participantCandidates ?? [];
}

export async function searchSpexare(revivalId: string, query: string) {
    return (await runQuery(SpexareSearchQuery, {revivalId, query}))?.spexareSearch ?? [];
}

export async function getMyParticipation(revivalId: string) {
    return (await runQuery(MyParticipationQuery, {revivalId}))?.myParticipation ?? null;
}

export async function addParticipant(input: ParticipantAddInput) {
    return (await runMutation(ParticipantAddMutation, {input}))?.participantAdd ?? null;
}

export async function addSpexareParticipants(revivalId: string, spexareIds: string[]) {
    return (await runMutation(ParticipantsAddSpexareMutation, {revivalId, spexareIds}))?.participantsAddSpexare ?? [];
}

export async function updateParticipant(input: ParticipantUpdateInput) {
    await runMutation(ParticipantUpdateMutation, {input});
}

export async function removeParticipant(id: string, version: number) {
    await runMutation(ParticipantRemoveMutation, {id, version});
}

export async function inviteParticipants(input: ParticipantsInviteInput) {
    return (await runMutation(ParticipantsInviteMutation, {input}))?.participantsInvite ?? {invited: [], skipped: []};
}

export async function setParticipantFeePaid(id: string, version: number, paid: boolean) {
    await runMutation(ParticipantFeeSetPaidMutation, {id, version, paid});
}

export async function updateParticipationSettings(input: ParticipationSettingsInput) {
    await runMutation(ParticipationSettingsUpdateMutation, {input});
}

export async function handleReferral(id: string, outcome: ReferralOutcome) {
    await runMutation(ReferralHandleMutation, {id, outcome});
}

export async function respondToParticipation(input: ParticipationRespondInput) {
    await runMutation(ParticipationRespondMutation, {input});
}

export async function updateParticipationContact(input: ContactInput) {
    await runMutation(ParticipationContactUpdateMutation, {input});
}

export async function setParticipationDietary(revivalId: string, text: string | null) {
    await runMutation(ParticipationDietarySetMutation, {revivalId, text});
}

export async function createReferral(input: ReferralInput) {
    await runMutation(ReferralCreateMutation, {input});
}
