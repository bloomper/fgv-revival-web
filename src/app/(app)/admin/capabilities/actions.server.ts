"use server";

import {revalidatePath} from "next/cache";
import type {z} from "zod";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {
    createCapability,
    deleteCapability,
    moveCapability,
    restoreCapability,
    retireCapability,
    updateCapability,
} from "@/lib/catalog/catalog.server";
import {
    catalogCreateSchema,
    catalogMoveSchema,
    catalogTransitionSchema,
    catalogUpdateSchema
} from "@/lib/catalog/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

// Members, checklists and templates show the names, so every page is revalidated.
function revalidate() {
    revalidatePath("/", "layout");
}

export async function createCapabilityAction(input: z.input<typeof catalogCreateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {name} = catalogCreateSchema.parse(input);

        await createCapability({name: {sv: name.sv, en: name.en || null}});
        revalidate();
        return null;
    }));
}

export async function updateCapabilityAction(input: z.input<typeof catalogUpdateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version, name} = catalogUpdateSchema.parse(input);

        await updateCapability({id, version, name: {sv: name.sv, en: name.en || null}});
        revalidate();
        return null;
    }));
}

export async function moveCapabilityAction(input: z.input<typeof catalogMoveSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version, position} = catalogMoveSchema.parse(input);

        await moveCapability(id, version, position);
        revalidate();
        return null;
    }));
}

export async function retireCapabilityAction(input: z.input<typeof catalogTransitionSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version} = catalogTransitionSchema.parse(input);

        await retireCapability(id, version);
        revalidate();
        return null;
    }));
}

export async function restoreCapabilityAction(input: z.input<typeof catalogTransitionSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version} = catalogTransitionSchema.parse(input);

        await restoreCapability(id, version);
        revalidate();
        return null;
    }));
}

export async function deleteCapabilityAction(input: z.input<typeof catalogTransitionSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version} = catalogTransitionSchema.parse(input);

        await deleteCapability(id, version);
        revalidate();
        return null;
    }));
}
