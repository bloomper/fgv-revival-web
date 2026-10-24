"use server";

import {revalidatePath} from "next/cache";
import type {z} from "zod";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {
    createBudgetCategory,
    deleteBudgetCategory,
    moveBudgetCategory,
    restoreBudgetCategory,
    retireBudgetCategory,
    updateBudgetCategory,
} from "@/lib/budget/reference.server";
import {catalogMoveSchema, catalogTransitionSchema} from "@/lib/catalog/schema";
import {budgetCategoryCreateSchema, budgetCategoryUpdateSchema} from "@/lib/budget/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

// Every revival's budget, the reference figures and the event types show the names, so every page is revalidated.
function revalidate() {
    revalidatePath("/", "layout");
}

export async function createBudgetCategoryAction(input: z.input<typeof budgetCategoryCreateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {name, kind, role} = budgetCategoryCreateSchema.parse(input);

        await createBudgetCategory({name: {sv: name.sv, en: name.en || null}, kind, role: role || null});
        revalidate();
        return null;
    }));
}

/**
 * Renames a category and sets or clears its role; its kind is fixed.
 */
export async function updateBudgetCategoryAction(input: z.input<typeof budgetCategoryUpdateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version, name, role} = budgetCategoryUpdateSchema.parse(input);

        await updateBudgetCategory({id, version, name: {sv: name.sv, en: name.en || null}, role: role || null});
        revalidate();
        return null;
    }));
}

export async function moveBudgetCategoryAction(input: z.input<typeof catalogMoveSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version, position} = catalogMoveSchema.parse(input);

        await moveBudgetCategory(id, version, position);
        revalidate();
        return null;
    }));
}

export async function retireBudgetCategoryAction(input: z.input<typeof catalogTransitionSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version} = catalogTransitionSchema.parse(input);

        await retireBudgetCategory(id, version);
        revalidate();
        return null;
    }));
}

export async function restoreBudgetCategoryAction(input: z.input<typeof catalogTransitionSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version} = catalogTransitionSchema.parse(input);

        await restoreBudgetCategory(id, version);
        revalidate();
        return null;
    }));
}

export async function deleteBudgetCategoryAction(input: z.input<typeof catalogTransitionSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version} = catalogTransitionSchema.parse(input);

        await deleteBudgetCategory(id, version);
        revalidate();
        return null;
    }));
}
