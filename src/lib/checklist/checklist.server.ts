import "server-only";

import {graphql} from "@/gql";
import type {
    ChecklistAddFromTemplateInput,
    ChecklistItemCreateInput,
    ChecklistItemFilter,
    ChecklistItemSetStateInput,
    ChecklistItemUpdateInput,
    EventChecklistCreateInput,
    EventChecklistUpdateInput,
} from "@/gql/graphql";
import {runMutation, runQuery} from "@/lib/graphql.server";

const RevivalChecklistsQuery = graphql(`
    query RevivalChecklists($id: ID!, $filter: ChecklistItemFilter, $filtered: Boolean!) {
        revival(id: $id) {
            id
            workingTitle
            permissions { canWriteLog }
            ownerCandidates { id displayName }
        }
        checklists(revivalId: $id) { id kind phase name date cancelled openCount overdueCount totalCount }
        checklistItems(revivalId: $id, filter: $filter) @include(if: $filtered) { ...ChecklistItemFields }
    }
`);

const ChecklistQuery = graphql(`
    query Checklist($id: ID!, $revivalId: ID!) {
        revival(id: $revivalId) {
            id
            workingTitle
            permissions { canWriteLog canWaiveRequirement }
            ownerCandidates { id displayName }
        }
        checklist(id: $id) {
            id
            revivalId
            kind
            phase
            chapterTitle { sv en }
            name
            date
            cancelled
            version
            template { id name { sv en } }
            templatesAvailable { id kind phase name { sv en } }
            tips { ...GuideItemFields }
            items { ...ChecklistItemFields }
        }
    }
`);

const EventChecklistCreateMutation = graphql(`
    mutation EventChecklistCreate($input: EventChecklistCreateInput!) {
        eventChecklistCreate(input: $input) { id }
    }
`);

const EventChecklistUpdateMutation = graphql(`
    mutation EventChecklistUpdate($input: EventChecklistUpdateInput!) {
        eventChecklistUpdate(input: $input) { id }
    }
`);

const EventChecklistCancelMutation = graphql(`
    mutation EventChecklistCancel($id: ID!, $version: Int!) {
        eventChecklistCancel(id: $id, version: $version) { id }
    }
`);

const ChecklistAddFromTemplateMutation = graphql(`
    mutation ChecklistAddFromTemplate($input: ChecklistAddFromTemplateInput!) {
        checklistAddFromTemplate(input: $input) { id }
    }
`);

const ChecklistItemCreateMutation = graphql(`
    mutation ChecklistItemCreate($input: ChecklistItemCreateInput!) {
        checklistItemCreate(input: $input) { id }
    }
`);

const ChecklistItemUpdateMutation = graphql(`
    mutation ChecklistItemUpdate($input: ChecklistItemUpdateInput!) {
        checklistItemUpdate(input: $input) { id }
    }
`);

const ChecklistItemSetStateMutation = graphql(`
    mutation ChecklistItemSetState($input: ChecklistItemSetStateInput!) {
        checklistItemSetState(input: $input) { id state }
    }
`);

export async function getRevivalChecklists(revivalId: string, filter: ChecklistItemFilter | null) {
    const data = await runQuery(RevivalChecklistsQuery, {id: revivalId, filter, filtered: filter !== null});

    return data?.revival ? {revival: data.revival, checklists: data.checklists, items: data.checklistItems ?? null} : null;
}

export async function getChecklist(revivalId: string, id: string) {
    const data = await runQuery(ChecklistQuery, {id, revivalId});

    return data?.revival && data.checklist && data.checklist.revivalId === revivalId ? {revival: data.revival, checklist: data.checklist} : null;
}

export async function createChecklistItem(input: ChecklistItemCreateInput) {
    await runMutation(ChecklistItemCreateMutation, {input});
}

export async function updateChecklistItem(input: ChecklistItemUpdateInput) {
    await runMutation(ChecklistItemUpdateMutation, {input});
}

export async function setChecklistItemState(input: ChecklistItemSetStateInput) {
    await runMutation(ChecklistItemSetStateMutation, {input});
}

export async function createEventChecklist(input: EventChecklistCreateInput) {
    return (await runMutation(EventChecklistCreateMutation, {input}))?.eventChecklistCreate ?? null;
}

export async function updateEventChecklist(input: EventChecklistUpdateInput) {
    await runMutation(EventChecklistUpdateMutation, {input});
}

export async function cancelEventChecklist(id: string, version: number) {
    await runMutation(EventChecklistCancelMutation, {id, version});
}

export async function addChecklistItemsFromTemplate(input: ChecklistAddFromTemplateInput) {
    await runMutation(ChecklistAddFromTemplateMutation, {input});
}
