import "server-only";

import {graphql} from "@/gql";
import type {MembershipSetInput} from "@/gql/graphql";
import {runMutation, runQuery} from "@/lib/graphql.server";

// Closing a revival (closing.graphqls): the closing signals, FGV membership marks, the participation sync
// to Spexregister and anonymization. The preview and the participants' names come from Spexregister, so they are
// fetched on their own: SPEXREGISTER_UNAVAILABLE there leaves the rest of the page working.

export const SyncRunFields = graphql(`
    fragment SyncRunFields on SyncRun {
        id
        status
        startedBy { id displayName }
        startedAt
        finishedAt
        total
        done
        failed
        failures { participant { id displayName } operation reason }
    }
`);

const RevivalClosingQuery = graphql(`
    query RevivalClosing($id: ID!) {
        revival(id: $id) {
            id
            title
            year
            status
            version
            anonymizedAt
            permissions { canReadWork canReadParticipants canReadBudget canWriteLog canSync canAnonymize canSetMembership }
            ownerCandidates { id displayName }
            closing {
                actualResult
                loanAmount
                loanRepaid
                surplusDecision { id number type status }
                membershipYear
                membershipsPaid
                suggestions
                lastSync { ...SyncRunFields }
                anonymizedAt
                autoAnonymizeOn
            }
        }
    }
`);

// Only what the status select needs to warn before archiving
const RevivalSyncSignalQuery = graphql(`
    query RevivalSyncSignal($id: ID!) {
        revival(id: $id) {
            id
            closing { lastSync { id status failed } }
        }
    }
`);

const MembershipParticipantsQuery = graphql(`
    query MembershipParticipants($revivalId: ID!) {
        participants(revivalId: $revivalId, includeRemoved: false) {
            id
            kind
            firstName
            lastName
            nickName
            response
            membershipPaid
            removed
        }
    }
`);

const SyncPreviewQuery = graphql(`
    query SyncPreview($revivalId: ID!) {
        syncPreview(revivalId: $revivalId) {
            revivalId
            hash
            spexregisterRevivalExists
            participants {
                participant { id displayName position { id name } }
                operations { operation detail exists }
            }
            excluded { id displayName }
            membershipYear
            lastRun { ...SyncRunFields }
        }
    }
`);

const SyncRunQuery = graphql(`
    query SyncRun($id: ID!) {
        syncRun(id: $id) { ...SyncRunFields }
    }
`);

const SyncStartMutation = graphql(`
    mutation SyncStart($revivalId: ID!, $previewHash: String!) {
        syncStart(revivalId: $revivalId, previewHash: $previewHash) { ...SyncRunFields }
    }
`);

const MembershipSetMutation = graphql(`
    mutation MembershipSet($input: MembershipSetInput!) {
        membershipSet(input: $input) { id membershipPaid }
    }
`);

const RevivalAnonymizeMutation = graphql(`
    mutation RevivalAnonymize($id: ID!, $version: Int!, $confirmation: String!) {
        revivalAnonymize(id: $id, version: $version, confirmation: $confirmation) { id anonymizedAt version }
    }
`);

export async function getRevivalClosing(id: string) {
    return (await runQuery(RevivalClosingQuery, {id}))?.revival ?? null;
}

export async function getRevivalSyncSignal(id: string) {
    return (await runQuery(RevivalSyncSignalQuery, {id}))?.revival?.closing?.lastSync ?? null;
}

export async function getMembershipParticipants(revivalId: string) {
    return (await runQuery(MembershipParticipantsQuery, {revivalId}))?.participants ?? [];
}

export async function getSyncPreview(revivalId: string) {
    return (await runQuery(SyncPreviewQuery, {revivalId}))?.syncPreview ?? null;
}

export async function getSyncRun(id: string) {
    // Polled while a run is going on: always ask the server, never urql's request cache
    return (await runQuery(SyncRunQuery, {id}, {requestPolicy: "network-only"}))?.syncRun ?? null;
}

export async function startSync(revivalId: string, previewHash: string) {
    return (await runMutation(SyncStartMutation, {revivalId, previewHash}))?.syncStart ?? null;
}

export async function setMembership(input: MembershipSetInput) {
    return (await runMutation(MembershipSetMutation, {input}))?.membershipSet ?? [];
}

export async function anonymizeRevival(id: string, version: number, confirmation: string) {
    return (await runMutation(RevivalAnonymizeMutation, {id, version, confirmation}))?.revivalAnonymize ?? null;
}
