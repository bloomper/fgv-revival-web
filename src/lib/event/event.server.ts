import "server-only";

import {graphql} from "@/gql";
import type {EventCreateInput, EventTypeInput, EventUpdateInput} from "@/gql/graphql";
import {runMutation, runQuery} from "@/lib/graphql.server";

// A revival's events, its proposals and the caller's calendar link. The meetings only for the timeline.
const RevivalEventsQuery = graphql(`
    query RevivalEvents($id: ID!, $includeCancelled: Boolean!, $withMeetings: Boolean!) {
        revival(id: $id) {
            id
            title
            status
            premiereDate
            shows { date time venue }
            permissions { canWriteLog canSubscribeCalendar }
            eventProposals { type { ...EventTypeFields } startDate endDate earliest latest }
            calendarFeed { createdAt }
        }
        events(revivalId: $id, includeCancelled: $includeCancelled) { ...EventFields }
        eventTypes { ...EventTypeFields }
        meetings(revivalId: $id) @include(if: $withMeetings) { id date title status }
    }
`);

const EventTypesQuery = graphql(`
    query EventTypes($includeRetired: Boolean) {
        eventTypes(includeRetired: $includeRetired) { ...EventTypeFields budgetLines { ...EventTypeBudgetLineFields } }
    }
`);

const EventCreateMutation = graphql(`
    mutation EventCreate($input: EventCreateInput!) {
        eventCreate(input: $input) { id }
    }
`);

const EventUpdateMutation = graphql(`
    mutation EventUpdate($input: EventUpdateInput!) {
        eventUpdate(input: $input) { id }
    }
`);

const EventCancelMutation = graphql(`
    mutation EventCancel($id: ID!, $version: Int!) {
        eventCancel(id: $id, version: $version) { id }
    }
`);

const EventRestoreMutation = graphql(`
    mutation EventRestore($id: ID!, $version: Int!) {
        eventRestore(id: $id, version: $version) { id }
    }
`);

const EventTypeCreateMutation = graphql(`
    mutation EventTypeCreate($input: EventTypeInput!) {
        eventTypeCreate(input: $input) { id }
    }
`);

const EventTypeUpdateMutation = graphql(`
    mutation EventTypeUpdate($id: ID!, $version: Int!, $input: EventTypeInput!) {
        eventTypeUpdate(id: $id, version: $version, input: $input) { id }
    }
`);

const EventTypeMoveMutation = graphql(`
    mutation EventTypeMove($id: ID!, $version: Int!, $position: Int!) {
        eventTypeMove(id: $id, version: $version, position: $position) { id }
    }
`);

const EventTypeRetireMutation = graphql(`
    mutation EventTypeRetire($id: ID!, $version: Int!) {
        eventTypeRetire(id: $id, version: $version) { id }
    }
`);

const EventTypeRestoreMutation = graphql(`
    mutation EventTypeRestore($id: ID!, $version: Int!) {
        eventTypeRestore(id: $id, version: $version) { id }
    }
`);

const CalendarFeedCreateMutation = graphql(`
    mutation CalendarFeedCreate($revivalId: ID!) {
        calendarFeedCreate(revivalId: $revivalId) { url createdAt }
    }
`);

const CalendarFeedRevokeMutation = graphql(`
    mutation CalendarFeedRevoke($revivalId: ID!) {
        calendarFeedRevoke(revivalId: $revivalId)
    }
`);

/**
 * A revival's events by date, with what the events page needs around them. The meetings only for the timeline.
 */
export async function getRevivalEvents(revivalId: string, {includeCancelled = false, withMeetings = false} = {}) {
    const data = await runQuery(RevivalEventsQuery, {id: revivalId, includeCancelled, withMeetings});

    return data?.revival
        ? {revival: data.revival, events: data.events, types: data.eventTypes, meetings: data.meetings ?? []}
        : null;
}

/**
 * The event types in the super admin's order, with the budget lines each proposes. Retired ones only when asked
 * for: pickers offer the active ones.
 */
export async function getEventTypes(includeRetired = false) {
    return (await runQuery(EventTypesQuery, {includeRetired}))?.eventTypes ?? [];
}

export async function createEvent(input: EventCreateInput) {
    return (await runMutation(EventCreateMutation, {input}))?.eventCreate;
}

export async function updateEvent(input: EventUpdateInput) {
    await runMutation(EventUpdateMutation, {input});
}

export async function cancelEvent(id: string, version: number) {
    await runMutation(EventCancelMutation, {id, version});
}

export async function restoreEvent(id: string, version: number) {
    await runMutation(EventRestoreMutation, {id, version});
}

export async function createEventType(input: EventTypeInput) {
    return (await runMutation(EventTypeCreateMutation, {input}))?.eventTypeCreate;
}

export async function updateEventType(id: string, version: number, input: EventTypeInput) {
    await runMutation(EventTypeUpdateMutation, {id, version, input});
}

export async function moveEventType(id: string, version: number, position: number) {
    await runMutation(EventTypeMoveMutation, {id, version, position});
}

export async function retireEventType(id: string, version: number) {
    await runMutation(EventTypeRetireMutation, {id, version});
}

export async function restoreEventType(id: string, version: number) {
    await runMutation(EventTypeRestoreMutation, {id, version});
}

/**
 * A new secret calendar link for the caller; the previous one stops working. The URL is only returned here.
 */
export async function createCalendarFeed(revivalId: string) {
    return (await runMutation(CalendarFeedCreateMutation, {revivalId}))?.calendarFeedCreate ?? null;
}

export async function revokeCalendarFeed(revivalId: string) {
    await runMutation(CalendarFeedRevokeMutation, {revivalId});
}
