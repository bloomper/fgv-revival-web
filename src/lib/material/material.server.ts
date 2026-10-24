import "server-only";

import {graphql} from "@/gql";
import type {InventoryItemInput, LinkServiceInput, MaterialInput} from "@/gql/graphql";
import {runMutation, runQuery} from "@/lib/graphql.server";

// Materials, the inventory and the link services they are recognised by (M8, contract material.graphqls). Positions
// come from Spexregister and are fetched on their own (getPositions), so the lists work while it is down.

const MaterialsAccessQuery = graphql(`
    query MaterialsAccess($id: ID!) {
        revival(id: $id) {
            id
            status
            permissions { canReadMaterials canWriteMaterials }
        }
    }
`);

const RevivalMaterialsQuery = graphql(`
    query RevivalMaterials($id: ID!, $includeRemoved: Boolean!) {
        revival(id: $id) {
            id
            status
            permissions { canWriteMaterials }
        }
        materials(revivalId: $id, includeRemoved: $includeRemoved) { ...MaterialFields }
        linkServices { ...LinkServiceFields }
    }
`);

const RevivalInventoryQuery = graphql(`
    query RevivalInventory($id: ID!, $includeRemoved: Boolean!) {
        revival(id: $id) {
            id
            status
            permissions { canWriteMaterials }
            ownerCandidates { id displayName }
        }
        inventory(revivalId: $id, includeRemoved: $includeRemoved) { ...InventoryItemFields }
        materials(revivalId: $id) { id title url removed }
    }
`);

const LinkServicesQuery = graphql(`
    query LinkServices($includeRetired: Boolean) {
        linkServices(includeRetired: $includeRetired) { ...LinkServiceFields position inUse version }
    }
`);

const MaterialCreateMutation = graphql(`
    mutation MaterialCreate($input: MaterialInput!) {
        materialCreate(input: $input) { id service { id } }
    }
`);

const MaterialUpdateMutation = graphql(`
    mutation MaterialUpdate($id: ID!, $version: Int!, $input: MaterialInput!) {
        materialUpdate(id: $id, version: $version, input: $input) { id }
    }
`);

const MaterialRemoveMutation = graphql(`
    mutation MaterialRemove($id: ID!, $version: Int!) {
        materialRemove(id: $id, version: $version) { id }
    }
`);

const MaterialRestoreMutation = graphql(`
    mutation MaterialRestore($id: ID!, $version: Int!) {
        materialRestore(id: $id, version: $version) { id }
    }
`);

const InventoryItemCreateMutation = graphql(`
    mutation InventoryItemCreate($input: InventoryItemInput!) {
        inventoryItemCreate(input: $input) { id }
    }
`);

const InventoryItemUpdateMutation = graphql(`
    mutation InventoryItemUpdate($id: ID!, $version: Int!, $input: InventoryItemInput!) {
        inventoryItemUpdate(id: $id, version: $version, input: $input) { id }
    }
`);

const InventoryItemRemoveMutation = graphql(`
    mutation InventoryItemRemove($id: ID!, $version: Int!) {
        inventoryItemRemove(id: $id, version: $version) { id }
    }
`);

const InventoryItemRestoreMutation = graphql(`
    mutation InventoryItemRestore($id: ID!, $version: Int!) {
        inventoryItemRestore(id: $id, version: $version) { id }
    }
`);

const LinkServiceCreateMutation = graphql(`
    mutation LinkServiceCreate($input: LinkServiceInput!) {
        linkServiceCreate(input: $input) { id }
    }
`);

const LinkServiceUpdateMutation = graphql(`
    mutation LinkServiceUpdate($id: ID!, $version: Int!, $input: LinkServiceInput!) {
        linkServiceUpdate(id: $id, version: $version, input: $input) { id }
    }
`);

const LinkServiceMoveMutation = graphql(`
    mutation LinkServiceMove($id: ID!, $version: Int!, $position: Int!) {
        linkServiceMove(id: $id, version: $version, position: $position) { id }
    }
`);

const LinkServiceRetireMutation = graphql(`
    mutation LinkServiceRetire($id: ID!, $version: Int!) {
        linkServiceRetire(id: $id, version: $version) { id }
    }
`);

const LinkServiceRestoreMutation = graphql(`
    mutation LinkServiceRestore($id: ID!, $version: Int!) {
        linkServiceRestore(id: $id, version: $version) { id }
    }
`);

const LinkServiceDeleteMutation = graphql(`
    mutation LinkServiceDelete($id: ID!, $version: Int!) {
        linkServiceDelete(id: $id, version: $version)
    }
`);

/**
 * The revival's status and whether the caller reads and writes its materials, for the materials' layout.
 */
export async function getMaterialsAccess(revivalId: string) {
    return (await runQuery(MaterialsAccessQuery, {id: revivalId}))?.revival ?? null;
}

/**
 * The revival's materials with the active link services, for the recognition hint and the service picker.
 */
export async function getRevivalMaterials(revivalId: string, includeRemoved = false) {
    const data = await runQuery(RevivalMaterialsQuery, {id: revivalId, includeRemoved});

    return data?.revival ? {revival: data.revival, materials: data.materials, services: data.linkServices} : null;
}

/**
 * The revival's inventory with the owner candidates and the materials an item may link to.
 */
export async function getRevivalInventory(revivalId: string, includeRemoved = false) {
    const data = await runQuery(RevivalInventoryQuery, {id: revivalId, includeRemoved});

    return data?.revival ? {revival: data.revival, items: data.inventory, materials: data.materials} : null;
}

/**
 * The link services in list order. Retired ones only when asked for.
 */
export async function getLinkServices(includeRetired = false) {
    return (await runQuery(LinkServicesQuery, {includeRetired}))?.linkServices ?? [];
}

export async function createMaterial(input: MaterialInput) {
    return (await runMutation(MaterialCreateMutation, {input}))?.materialCreate ?? null;
}

export async function updateMaterial(id: string, version: number, input: MaterialInput) {
    await runMutation(MaterialUpdateMutation, {id, version, input});
}

export async function removeMaterial(id: string, version: number) {
    await runMutation(MaterialRemoveMutation, {id, version});
}

export async function restoreMaterial(id: string, version: number) {
    await runMutation(MaterialRestoreMutation, {id, version});
}

export async function createInventoryItem(input: InventoryItemInput) {
    return (await runMutation(InventoryItemCreateMutation, {input}))?.inventoryItemCreate ?? null;
}

export async function updateInventoryItem(id: string, version: number, input: InventoryItemInput) {
    await runMutation(InventoryItemUpdateMutation, {id, version, input});
}

export async function removeInventoryItem(id: string, version: number) {
    await runMutation(InventoryItemRemoveMutation, {id, version});
}

export async function restoreInventoryItem(id: string, version: number) {
    await runMutation(InventoryItemRestoreMutation, {id, version});
}

export async function createLinkService(input: LinkServiceInput) {
    return (await runMutation(LinkServiceCreateMutation, {input}))?.linkServiceCreate;
}

export async function updateLinkService(id: string, version: number, input: LinkServiceInput) {
    await runMutation(LinkServiceUpdateMutation, {id, version, input});
}

export async function moveLinkService(id: string, version: number, position: number) {
    await runMutation(LinkServiceMoveMutation, {id, version, position});
}

export async function retireLinkService(id: string, version: number) {
    await runMutation(LinkServiceRetireMutation, {id, version});
}

export async function restoreLinkService(id: string, version: number) {
    await runMutation(LinkServiceRestoreMutation, {id, version});
}

export async function deleteLinkService(id: string, version: number) {
    await runMutation(LinkServiceDeleteMutation, {id, version});
}
