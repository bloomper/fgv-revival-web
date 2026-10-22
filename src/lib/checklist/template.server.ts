import "server-only";

import {graphql} from "@/gql";
import type {
    ChecklistTemplateCreateInput,
    ChecklistTemplateItemCreateInput,
    ChecklistTemplateItemUpdateInput,
    ChecklistTemplateUpdateInput,
} from "@/gql/graphql";
import {runMutation, runQuery} from "@/lib/graphql.server";

const ChecklistTemplatesQuery = graphql(`
    query ChecklistTemplates($includeRetired: Boolean) {
        checklistTemplates(includeRetired: $includeRetired) { id kind chapterKey chapterTitle { sv en } name { sv en } retired version items { id } }
    }
`);

const ChecklistTemplateQuery = graphql(`
    query ChecklistTemplate($id: ID!) {
        checklistTemplate(id: $id) {
            id
            kind
            chapterKey
            chapterTitle { sv en }
            name { sv en }
            retired
            version
            items {
                id
                position
                text { sv en }
                guideItemKey
                guideItem { ...GuideItemFields }
                defaultCapability
                deadline { kind amount weekday }
                version
            }
        }
    }
`);

const EventTemplatesQuery = graphql(`
    query EventChecklistTemplates {
        checklistTemplates { id kind name { sv en } }
    }
`);

const CreateMutation = graphql(`
    mutation ChecklistTemplateCreate($input: ChecklistTemplateCreateInput!) {
        checklistTemplateCreate(input: $input) { id }
    }
`);

const UpdateMutation = graphql(`
    mutation ChecklistTemplateUpdate($input: ChecklistTemplateUpdateInput!) {
        checklistTemplateUpdate(input: $input) { id }
    }
`);

const RetireMutation = graphql(`
    mutation ChecklistTemplateRetire($id: ID!, $version: Int!) {
        checklistTemplateRetire(id: $id, version: $version) { id }
    }
`);

const ItemCreateMutation = graphql(`
    mutation ChecklistTemplateItemCreate($input: ChecklistTemplateItemCreateInput!) {
        checklistTemplateItemCreate(input: $input) { id }
    }
`);

const ItemUpdateMutation = graphql(`
    mutation ChecklistTemplateItemUpdate($input: ChecklistTemplateItemUpdateInput!) {
        checklistTemplateItemUpdate(input: $input) { id }
    }
`);

const ItemMoveMutation = graphql(`
    mutation ChecklistTemplateItemMove($id: ID!, $version: Int!, $position: Int!) {
        checklistTemplateItemMove(id: $id, version: $version, position: $position) { id }
    }
`);

const ItemRetireMutation = graphql(`
    mutation ChecklistTemplateItemRetire($id: ID!, $version: Int!) {
        checklistTemplateItemRetire(id: $id, version: $version) { id }
    }
`);

export async function getChecklistTemplates(includeRetired: boolean) {
    return (await runQuery(ChecklistTemplatesQuery, {includeRetired}))?.checklistTemplates ?? [];
}

export async function getChecklistTemplate(id: string) {
    return (await runQuery(ChecklistTemplateQuery, {id}))?.checklistTemplate ?? null;
}

export async function getEventChecklistTemplates() {
    return ((await runQuery(EventTemplatesQuery, {}))?.checklistTemplates ?? []).filter(template => template.kind === "EVENT");
}

export async function createChecklistTemplate(input: ChecklistTemplateCreateInput) {
    return (await runMutation(CreateMutation, {input}))?.checklistTemplateCreate ?? null;
}

export async function updateChecklistTemplate(input: ChecklistTemplateUpdateInput) {
    await runMutation(UpdateMutation, {input});
}

export async function retireChecklistTemplate(id: string, version: number) {
    await runMutation(RetireMutation, {id, version});
}

export async function createChecklistTemplateItem(input: ChecklistTemplateItemCreateInput) {
    await runMutation(ItemCreateMutation, {input});
}

export async function updateChecklistTemplateItem(input: ChecklistTemplateItemUpdateInput) {
    await runMutation(ItemUpdateMutation, {input});
}

export async function moveChecklistTemplateItem(id: string, version: number, position: number) {
    await runMutation(ItemMoveMutation, {id, version, position});
}

export async function retireChecklistTemplateItem(id: string, version: number) {
    await runMutation(ItemRetireMutation, {id, version});
}
