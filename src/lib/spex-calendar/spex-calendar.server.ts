import "server-only";

import {graphql} from "@/gql";
import type {SpexCalendarDateInput} from "@/gql/graphql";
import {runMutation, runQuery} from "@/lib/graphql.server";

// The current Chalmersspex's show dates (spex-calendar.graphqls), kept by the super admin, and the cross-revival
// timeline that flags clashes with them.

const SpexCalendarDatesQuery = graphql(`
    query SpexCalendarDates {
        spexCalendarDates { id date label version }
    }
`);

const RevivalTimelineQuery = graphql(`
    query RevivalTimeline {
        revivals { id title status premiereDate shows { date time venue } }
        spexCalendarDates { id date label version }
    }
`);

const SpexCalendarDateCreateMutation = graphql(`
    mutation SpexCalendarDateCreate($input: SpexCalendarDateInput!) {
        spexCalendarDateCreate(input: $input) { id }
    }
`);

const SpexCalendarDateUpdateMutation = graphql(`
    mutation SpexCalendarDateUpdate($id: ID!, $version: Int!, $input: SpexCalendarDateInput!) {
        spexCalendarDateUpdate(id: $id, version: $version, input: $input) { id }
    }
`);

const SpexCalendarDateDeleteMutation = graphql(`
    mutation SpexCalendarDateDelete($id: ID!, $version: Int!) {
        spexCalendarDateDelete(id: $id, version: $version)
    }
`);

export async function getSpexCalendarDates() {
    return (await runQuery(SpexCalendarDatesQuery, {}))?.spexCalendarDates ?? [];
}

/**
 * Every revival's shows and the Chalmersspex dates, for the timeline on the page of all revivals.
 */
export async function getRevivalTimeline() {
    const data = await runQuery(RevivalTimelineQuery, {});

    return {revivals: data?.revivals ?? [], spexDates: data?.spexCalendarDates ?? []};
}

export async function createSpexCalendarDate(input: SpexCalendarDateInput) {
    await runMutation(SpexCalendarDateCreateMutation, {input});
}

export async function updateSpexCalendarDate(id: string, version: number, input: SpexCalendarDateInput) {
    await runMutation(SpexCalendarDateUpdateMutation, {id, version, input});
}

export async function deleteSpexCalendarDate(id: string, version: number) {
    await runMutation(SpexCalendarDateDeleteMutation, {id, version});
}
