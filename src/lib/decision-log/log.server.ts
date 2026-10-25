import "server-only";

import {graphql} from "@/gql";
import type {LogEntryAnswerInput, LogEntryCreateInput, LogEntryFilter, LogEntryUpdateInput} from "@/gql/graphql";
import {runMutation, runQuery} from "@/lib/graphql.server";

const RevivalLogQuery = graphql(`
    query RevivalLog($id: ID!, $filter: LogEntryFilter) {
        revival(id: $id) {
            id
            title
            year
            status
            permissions { canWriteLog }
            ownerCandidates { id displayName }
        }
        logEntries(revivalId: $id, filter: $filter) { ...LogEntryFields }
        logTags(revivalId: $id)
        meetings(revivalId: $id) { id date title }
        events(revivalId: $id, includeCancelled: true) { id title startDate cancelled }
    }
`);

const LogEntryCreateMutation = graphql(`
    mutation LogEntryCreate($input: LogEntryCreateInput!) {
        logEntryCreate(input: $input) { ...LogEntryFields }
    }
`);

const LogEntryUpdateMutation = graphql(`
    mutation LogEntryUpdate($input: LogEntryUpdateInput!) {
        logEntryUpdate(input: $input) { ...LogEntryFields }
    }
`);

const LogEntryAnswerMutation = graphql(`
    mutation LogEntryAnswer($input: LogEntryAnswerInput!) {
        logEntryAnswer(input: $input) {
            question { ...LogEntryFields }
            decision { ...LogEntryFields }
        }
    }
`);

export async function getRevivalLog(revivalId: string, filter: LogEntryFilter) {
    const data = await runQuery(RevivalLogQuery, {id: revivalId, filter});

    return data?.revival ? {
        revival: data.revival,
        entries: data.logEntries,
        tags: data.logTags,
        meetings: data.meetings,
        events: data.events,
    } : null;
}

export async function createLogEntry(input: LogEntryCreateInput) {
    return (await runMutation(LogEntryCreateMutation, {input}))?.logEntryCreate;
}

export async function updateLogEntry(input: LogEntryUpdateInput) {
    return (await runMutation(LogEntryUpdateMutation, {input}))?.logEntryUpdate;
}

export async function answerLogEntry(input: LogEntryAnswerInput) {
    return (await runMutation(LogEntryAnswerMutation, {input}))?.logEntryAnswer;
}
