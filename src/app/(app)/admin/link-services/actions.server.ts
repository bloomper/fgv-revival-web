"use server";

import {revalidatePath} from "next/cache";
import type {z} from "zod";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {catalogMoveSchema, catalogTransitionSchema} from "@/lib/catalog/schema";
import {
    createLinkService,
    deleteLinkService,
    moveLinkService,
    restoreLinkService,
    retireLinkService,
    updateLinkService,
} from "@/lib/material/material.server";
import {linkServiceCreateSchema, linkServiceUpdateSchema, toLinkServiceInput} from "@/lib/material/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

// Every revival's materials and the participants' pages show the services, so every page is revalidated.
function revalidate() {
    revalidatePath("/", "layout");
}

export async function createLinkServiceAction(input: z.input<typeof linkServiceCreateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {name, details} = linkServiceCreateSchema.parse(input);

        await createLinkService(toLinkServiceInput(name, details));
        revalidate();
        return null;
    }));
}

export async function updateLinkServiceAction(input: z.input<typeof linkServiceUpdateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version, name, details} = linkServiceUpdateSchema.parse(input);

        await updateLinkService(id, version, toLinkServiceInput(name, details));
        revalidate();
        return null;
    }));
}

export async function moveLinkServiceAction(input: z.input<typeof catalogMoveSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version, position} = catalogMoveSchema.parse(input);

        await moveLinkService(id, version, position);
        revalidate();
        return null;
    }));
}

export async function retireLinkServiceAction(input: z.input<typeof catalogTransitionSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version} = catalogTransitionSchema.parse(input);

        await retireLinkService(id, version);
        revalidate();
        return null;
    }));
}

export async function restoreLinkServiceAction(input: z.input<typeof catalogTransitionSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version} = catalogTransitionSchema.parse(input);

        await restoreLinkService(id, version);
        revalidate();
        return null;
    }));
}

export async function deleteLinkServiceAction(input: z.input<typeof catalogTransitionSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version} = catalogTransitionSchema.parse(input);

        await deleteLinkService(id, version);
        revalidate();
        return null;
    }));
}
