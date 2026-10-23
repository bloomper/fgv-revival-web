import "server-only";

import {graphql} from "@/gql";
import type {MeetingCreateInput, MeetingUpdateInput, MinutesEmailSendInput} from "@/gql/graphql";
import {runMutation, runQuery} from "@/lib/graphql.server";

const RevivalMeetingsQuery = graphql(`
    query RevivalMeetings($id: ID!) {
        revival(id: $id) {
            id
            title
            status
            permissions { canWriteLog }
            ownerCandidates { id displayName }
        }
        meetings(revivalId: $id) { id date title status }
    }
`);

const MeetingQuery = graphql(`
    query Meeting($id: ID!, $revivalId: ID!) {
        revival(id: $revivalId) {
            id
            title
            permissions { canWriteLog }
            ownerCandidates { id displayName }
        }
        logTags(revivalId: $revivalId)
        meeting(id: $id) {
            id
            revivalId
            date
            title
            status
            attendees { id displayName }
            othersPresent
            agendaPoints
            recorder { id displayName }
            startedAt
            closedAt
            canEmailMinutes
            version
            openEntries { ...LogEntryFields }
            entries { ...LogEntryFields }
            blockingEntries { id number type status }
            minutes {
                decisions { ...MinutesRowFields }
                todos { ...MinutesRowFields }
                questions { ...MinutesRowFields }
                closed { ...MinutesRowFields }
                agendaPoints
                attendees { id displayName }
                othersPresent
                recorder { id displayName }
            }
            emails {
                id
                language
                sentAt
                sentBy { displayName }
                waitingLeftOut
                recipients { person { id displayName } status }
            }
        }
    }
`);

export const MinutesRowFields = graphql(`
    fragment MinutesRowFields on MinutesRow {
        entryId
        number
        type
        text
        owner { ...OwnerFields }
        deadline
        status
    }
`);

const MeetingCreateMutation = graphql(`
    mutation MeetingCreate($input: MeetingCreateInput!) {
        meetingCreate(input: $input) { id }
    }
`);

const MeetingUpdateMutation = graphql(`
    mutation MeetingUpdate($input: MeetingUpdateInput!) {
        meetingUpdate(input: $input) { id }
    }
`);

const MeetingStartMutation = graphql(`
    mutation MeetingStart($id: ID!, $version: Int!) {
        meetingStart(id: $id, version: $version) { id status }
    }
`);

const MeetingCloseMutation = graphql(`
    mutation MeetingClose($id: ID!, $version: Int!) {
        meetingClose(id: $id, version: $version) { id status }
    }
`);

const MeetingCancelMutation = graphql(`
    mutation MeetingCancel($id: ID!, $version: Int!) {
        meetingCancel(id: $id, version: $version) { id status }
    }
`);

const MinutesEmailSendMutation = graphql(`
    mutation MinutesEmailSend($input: MinutesEmailSendInput!) {
        minutesEmailSend(input: $input) { id waitingLeftOut recipients { person { id displayName } status } }
    }
`);

const MinutesEmailRetryMutation = graphql(`
    mutation MinutesEmailRetry($emailId: ID!) {
        minutesEmailRetry(emailId: $emailId) { id waitingLeftOut recipients { person { id displayName } status } }
    }
`);

export async function getRevivalMeetings(revivalId: string) {
    const data = await runQuery(RevivalMeetingsQuery, {id: revivalId});

    return data?.revival ? {revival: data.revival, meetings: data.meetings} : null;
}

export async function getMeeting(revivalId: string, id: string) {
    const data = await runQuery(MeetingQuery, {id, revivalId});

    return data?.revival && data.meeting && data.meeting.revivalId === revivalId
        ? {revival: data.revival, meeting: data.meeting, tags: data.logTags}
        : null;
}

export async function createMeeting(input: MeetingCreateInput) {
    return (await runMutation(MeetingCreateMutation, {input}))?.meetingCreate;
}

export async function updateMeeting(input: MeetingUpdateInput) {
    await runMutation(MeetingUpdateMutation, {input});
}

export async function startMeeting(id: string, version: number) {
    await runMutation(MeetingStartMutation, {id, version});
}

export async function closeMeeting(id: string, version: number) {
    await runMutation(MeetingCloseMutation, {id, version});
}

export async function cancelMeeting(id: string, version: number) {
    await runMutation(MeetingCancelMutation, {id, version});
}

export async function sendMinutes(input: MinutesEmailSendInput) {
    return (await runMutation(MinutesEmailSendMutation, {input}))?.minutesEmailSend;
}

export async function retryMinutes(emailId: string) {
    return (await runMutation(MinutesEmailRetryMutation, {emailId}))?.minutesEmailRetry;
}
