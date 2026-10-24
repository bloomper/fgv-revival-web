"use server";

import {revalidatePath} from "next/cache";
import type {z} from "zod";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {createReferenceRevival, deleteReferenceRevival, updateReferenceRevival} from "@/lib/budget/reference.server";
import {
    referenceRevivalCreateSchema,
    referenceRevivalDeleteSchema,
    referenceRevivalUpdateSchema,
    toReferenceRevivalInput,
} from "@/lib/budget/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

// Every revival's budget shows the reference figures beside its categories, so every page is revalidated.
function revalidate() {
    revalidatePath("/", "layout");
}

export async function createReferenceRevivalAction(input: z.input<typeof referenceRevivalCreateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {values} = referenceRevivalCreateSchema.parse(input);

        await createReferenceRevival(toReferenceRevivalInput(values));
        revalidate();
        return null;
    }));
}

export async function updateReferenceRevivalAction(input: z.input<typeof referenceRevivalUpdateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version, values} = referenceRevivalUpdateSchema.parse(input);

        await updateReferenceRevival(id, version, toReferenceRevivalInput(values));
        revalidate();
        return null;
    }));
}

/**
 * Reference figures are not revival data, so they are deleted for real.
 */
export async function deleteReferenceRevivalAction(input: z.input<typeof referenceRevivalDeleteSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version} = referenceRevivalDeleteSchema.parse(input);

        await deleteReferenceRevival(id, version);
        revalidate();
        return null;
    }));
}
