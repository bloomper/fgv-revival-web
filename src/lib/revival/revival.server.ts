import "server-only";

import {graphql} from "@/gql";
import type {
    RevivalCreateInput,
    RevivalDetailFragment,
    RevivalStatus,
    RevivalStatusChangeInput,
    RevivalSummaryFragment,
    RevivalUpdateInput,
} from "@/gql/graphql";
import {runMutation, runQuery} from "@/lib/graphql.server";

export const RevivalSummary = graphql(`
    fragment RevivalSummary on Revival {
        id
        year
        workingTitle
        premiereDate
        status
        spex { id title available }
        members { id role state displayName email }
        permissions { canEditCore canEditDetails allowedStatuses canManageDirecteurs canManageSteeringGroup }
    }
`);

export const RevivalDetail = graphql(`
    fragment RevivalDetail on Revival {
        ...RevivalSummary
        showDates
        venues
        version
        createdBy
        createdAt
        lastModifiedBy
        lastModifiedAt
        members { id role capabilities state displayName email version }
        statusHistory { from to changedBy changedAt }
        guideVersion { id label }
    }
`);

const MeQuery = graphql(`
    query Me {
        me {
            id
            displayName
            email
            globalRoles
            revivalRoles { role capabilities revival { id } }
        }
    }
`);

const RevivalsQuery = graphql(`
    query Revivals($status: [RevivalStatus!]) {
        revivals(status: $status) { ...RevivalSummary }
    }
`);

const RevivalQuery = graphql(`
    query Revival($id: ID!) {
        revival(id: $id) { ...RevivalDetail }
    }
`);

const RevivalWorkSummaryQuery = graphql(`
    query RevivalWorkSummary($id: ID!) {
        revival(id: $id) {
            id
            workSummary { openEntries overdueEntries overdueChecklistItems openRequiredItems meetingInProgress { id title date } }
        }
    }
`);

const RevivalCreateMutation = graphql(`
    mutation RevivalCreate($input: RevivalCreateInput!) {
        revivalCreate(input: $input) { ...RevivalSummary }
    }
`);

const RevivalUpdateMutation = graphql(`
    mutation RevivalUpdate($input: RevivalUpdateInput!) {
        revivalUpdate(input: $input) { ...RevivalDetail }
    }
`);

const RevivalStatusChangeMutation = graphql(`
    mutation RevivalStatusChange($input: RevivalStatusChangeInput!) {
        revivalStatusChange(input: $input) { ...RevivalSummary }
    }
`);

export async function getMe() {
    return (await runQuery(MeQuery, {}))?.me;
}

export async function getRevivalWorkSummary(id: string) {
    return (await runQuery(RevivalWorkSummaryQuery, {id}))?.revival?.workSummary ?? null;
}

export async function getRevivals(status?: RevivalStatus[]): Promise<RevivalSummaryFragment[]> {
    return (await runQuery(RevivalsQuery, {status: status ?? null}))?.revivals ?? [];
}

export async function getRevival(id: string): Promise<RevivalDetailFragment | null> {
    return (await runQuery(RevivalQuery, {id}))?.revival ?? null;
}

export async function createRevival(input: RevivalCreateInput): Promise<RevivalSummaryFragment | undefined> {
    return (await runMutation(RevivalCreateMutation, {input}))?.revivalCreate;
}

export async function updateRevival(input: RevivalUpdateInput): Promise<RevivalDetailFragment | undefined> {
    return (await runMutation(RevivalUpdateMutation, {input}))?.revivalUpdate;
}

export async function changeStatus(input: RevivalStatusChangeInput): Promise<RevivalSummaryFragment | undefined> {
    return (await runMutation(RevivalStatusChangeMutation, {input}))?.revivalStatusChange;
}
