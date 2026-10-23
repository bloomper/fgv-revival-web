import "server-only";

import {graphql} from "@/gql";
import type {CapabilityCreateInput, CapabilityUpdateInput, GuideItemTypeCreateInput, GuideItemTypeUpdateInput} from "@/gql/graphql";
import {runMutation, runQuery} from "@/lib/graphql.server";

const CapabilitiesQuery = graphql(`
    query Capabilities($includeRetired: Boolean) {
        capabilities(includeRetired: $includeRetired) { ...CapabilityFields position inUse version }
    }
`);

const CapabilityCreateMutation = graphql(`
    mutation CapabilityCreate($input: CapabilityCreateInput!) {
        capabilityCreate(input: $input) { id }
    }
`);

const CapabilityUpdateMutation = graphql(`
    mutation CapabilityUpdate($input: CapabilityUpdateInput!) {
        capabilityUpdate(input: $input) { id }
    }
`);

const CapabilityMoveMutation = graphql(`
    mutation CapabilityMove($id: ID!, $version: Int!, $position: Int!) {
        capabilityMove(id: $id, version: $version, position: $position) { id }
    }
`);

const CapabilityRetireMutation = graphql(`
    mutation CapabilityRetire($id: ID!, $version: Int!) {
        capabilityRetire(id: $id, version: $version) { id }
    }
`);

const CapabilityRestoreMutation = graphql(`
    mutation CapabilityRestore($id: ID!, $version: Int!) {
        capabilityRestore(id: $id, version: $version) { id }
    }
`);

const CapabilityDeleteMutation = graphql(`
    mutation CapabilityDelete($id: ID!, $version: Int!) {
        capabilityDelete(id: $id, version: $version)
    }
`);

const GuideItemTypesQuery = graphql(`
    query GuideItemTypes($includeRetired: Boolean) {
        guideItemTypes(includeRetired: $includeRetired) { ...GuideItemTypeFields position inUse version }
    }
`);

const GuideItemTypeCreateMutation = graphql(`
    mutation GuideItemTypeCreate($input: GuideItemTypeCreateInput!) {
        guideItemTypeCreate(input: $input) { id }
    }
`);

const GuideItemTypeUpdateMutation = graphql(`
    mutation GuideItemTypeUpdate($input: GuideItemTypeUpdateInput!) {
        guideItemTypeUpdate(input: $input) { id }
    }
`);

const GuideItemTypeMoveMutation = graphql(`
    mutation GuideItemTypeMove($id: ID!, $version: Int!, $position: Int!) {
        guideItemTypeMove(id: $id, version: $version, position: $position) { id }
    }
`);

const GuideItemTypeRetireMutation = graphql(`
    mutation GuideItemTypeRetire($id: ID!, $version: Int!) {
        guideItemTypeRetire(id: $id, version: $version) { id }
    }
`);

const GuideItemTypeRestoreMutation = graphql(`
    mutation GuideItemTypeRestore($id: ID!, $version: Int!) {
        guideItemTypeRestore(id: $id, version: $version) { id }
    }
`);

const GuideItemTypeDeleteMutation = graphql(`
    mutation GuideItemTypeDelete($id: ID!, $version: Int!) {
        guideItemTypeDelete(id: $id, version: $version)
    }
`);

/**
 * The areas of responsibility, in list order. Retired ones only when asked for: pickers offer the active ones.
 */
export async function getCapabilities(includeRetired = false) {
    return (await runQuery(CapabilitiesQuery, {includeRetired}))?.capabilities ?? [];
}

export async function createCapability(input: CapabilityCreateInput) {
    return (await runMutation(CapabilityCreateMutation, {input}))?.capabilityCreate;
}

export async function updateCapability(input: CapabilityUpdateInput) {
    return (await runMutation(CapabilityUpdateMutation, {input}))?.capabilityUpdate;
}

export async function moveCapability(id: string, version: number, position: number) {
    return (await runMutation(CapabilityMoveMutation, {id, version, position}))?.capabilityMove;
}

export async function retireCapability(id: string, version: number) {
    return (await runMutation(CapabilityRetireMutation, {id, version}))?.capabilityRetire;
}

export async function restoreCapability(id: string, version: number) {
    return (await runMutation(CapabilityRestoreMutation, {id, version}))?.capabilityRestore;
}

export async function deleteCapability(id: string, version: number) {
    await runMutation(CapabilityDeleteMutation, {id, version});
}

/**
 * The guide item types, in list order. Retired ones only when asked for: pickers offer the active ones.
 */
export async function getGuideItemTypes(includeRetired = false) {
    return (await runQuery(GuideItemTypesQuery, {includeRetired}))?.guideItemTypes ?? [];
}

export async function createGuideItemType(input: GuideItemTypeCreateInput) {
    return (await runMutation(GuideItemTypeCreateMutation, {input}))?.guideItemTypeCreate;
}

export async function updateGuideItemType(input: GuideItemTypeUpdateInput) {
    return (await runMutation(GuideItemTypeUpdateMutation, {input}))?.guideItemTypeUpdate;
}

export async function moveGuideItemType(id: string, version: number, position: number) {
    return (await runMutation(GuideItemTypeMoveMutation, {id, version, position}))?.guideItemTypeMove;
}

export async function retireGuideItemType(id: string, version: number) {
    return (await runMutation(GuideItemTypeRetireMutation, {id, version}))?.guideItemTypeRetire;
}

export async function restoreGuideItemType(id: string, version: number) {
    return (await runMutation(GuideItemTypeRestoreMutation, {id, version}))?.guideItemTypeRestore;
}

export async function deleteGuideItemType(id: string, version: number) {
    await runMutation(GuideItemTypeDeleteMutation, {id, version});
}
