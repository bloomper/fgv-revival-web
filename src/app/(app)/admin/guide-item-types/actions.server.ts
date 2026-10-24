"use server";

import {revalidatePath} from "next/cache";
import type {z} from "zod";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {
    createGuideItemType,
    deleteGuideItemType,
    moveGuideItemType,
    restoreGuideItemType,
    retireGuideItemType,
    updateGuideItemType,
} from "@/lib/catalog/catalog.server";
import {
    catalogCreateSchema,
    catalogMoveSchema,
    catalogTransitionSchema,
    catalogUpdateSchema
} from "@/lib/catalog/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

// The guide, checklists, the log and suggestions show the names, so every page is revalidated.
function revalidate() {
    revalidatePath("/", "layout");
}

export async function createGuideItemTypeAction(input: z.input<typeof catalogCreateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {name, kind} = catalogCreateSchema.parse(input);

        if (!kind) {
            throw new Error("A guide item type needs a kind");
        }
        await createGuideItemType({kind, name: {sv: name.sv, en: name.en || null}});
        revalidate();
        return null;
    }));
}

export async function updateGuideItemTypeAction(input: z.input<typeof catalogUpdateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version, name} = catalogUpdateSchema.parse(input);

        await updateGuideItemType({id, version, name: {sv: name.sv, en: name.en || null}});
        revalidate();
        return null;
    }));
}

export async function moveGuideItemTypeAction(input: z.input<typeof catalogMoveSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version, position} = catalogMoveSchema.parse(input);

        await moveGuideItemType(id, version, position);
        revalidate();
        return null;
    }));
}

export async function retireGuideItemTypeAction(input: z.input<typeof catalogTransitionSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version} = catalogTransitionSchema.parse(input);

        await retireGuideItemType(id, version);
        revalidate();
        return null;
    }));
}

export async function restoreGuideItemTypeAction(input: z.input<typeof catalogTransitionSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version} = catalogTransitionSchema.parse(input);

        await restoreGuideItemType(id, version);
        revalidate();
        return null;
    }));
}

export async function deleteGuideItemTypeAction(input: z.input<typeof catalogTransitionSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version} = catalogTransitionSchema.parse(input);

        await deleteGuideItemType(id, version);
        revalidate();
        return null;
    }));
}
