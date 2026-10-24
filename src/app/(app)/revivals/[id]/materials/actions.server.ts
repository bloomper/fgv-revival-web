"use server";

import {revalidatePath} from "next/cache";
import type {z} from "zod";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {
    createInventoryItem,
    createMaterial,
    removeInventoryItem,
    removeMaterial,
    restoreInventoryItem,
    restoreMaterial,
    updateInventoryItem,
    updateMaterial,
} from "@/lib/material/material.server";
import {
    inventoryCreateSchema,
    inventoryTransitionSchema,
    inventoryUpdateSchema,
    materialCreateSchema,
    materialTransitionSchema,
    materialUpdateSchema,
    toInventoryItemInput,
    toMaterialInput,
} from "@/lib/material/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

// The materials, the inventory (which links to them) and the participants' own pages show them, so the revival is
// revalidated as a whole.
function revalidate(revivalId: string) {
    revalidatePath(`/revivals/${revivalId}`, "layout");
}

/**
 * Adds a material. {@code recognised} says whether the server found the service from the link's host, for statistics.
 */
export async function createMaterialAction(input: z.input<typeof materialCreateSchema>): Promise<ActionResult<{
    id: string;
    recognised: boolean
}>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, values} = materialCreateSchema.parse(input);
        const created = await createMaterial({...toMaterialInput(values), revivalId});

        revalidate(revivalId);
        return {id: created?.id ?? "", recognised: !values.serviceId && !!created?.service};
    }));
}

export async function updateMaterialAction(input: z.input<typeof materialUpdateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {id, version, revivalId, values} = materialUpdateSchema.parse(input);

        await updateMaterial(id, version, toMaterialInput(values));
        revalidate(revivalId);
        return null;
    }));
}

async function transition<S extends typeof materialTransitionSchema | typeof inventoryTransitionSchema>(
    schema: S, input: z.input<S>, run: (id: string, version: number) => Promise<void>,
): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {id, version, revivalId} = schema.parse(input);

        await run(id, version);
        revalidate(revivalId);
        return null;
    }));
}

export async function removeMaterialAction(input: z.input<typeof materialTransitionSchema>) {
    return transition(materialTransitionSchema, input, removeMaterial);
}

export async function restoreMaterialAction(input: z.input<typeof materialTransitionSchema>) {
    return transition(materialTransitionSchema, input, restoreMaterial);
}

export async function createInventoryItemAction(input: z.input<typeof inventoryCreateSchema>): Promise<ActionResult<{
    id: string
}>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, values} = inventoryCreateSchema.parse(input);
        const created = await createInventoryItem({...toInventoryItemInput(values), revivalId});

        revalidate(revivalId);
        return {id: created?.id ?? ""};
    }));
}

export async function updateInventoryItemAction(input: z.input<typeof inventoryUpdateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {id, version, revivalId, values} = inventoryUpdateSchema.parse(input);

        await updateInventoryItem(id, version, toInventoryItemInput(values));
        revalidate(revivalId);
        return null;
    }));
}

export async function removeInventoryItemAction(input: z.input<typeof inventoryTransitionSchema>) {
    return transition(inventoryTransitionSchema, input, removeInventoryItem);
}

export async function restoreInventoryItemAction(input: z.input<typeof inventoryTransitionSchema>) {
    return transition(inventoryTransitionSchema, input, restoreInventoryItem);
}
