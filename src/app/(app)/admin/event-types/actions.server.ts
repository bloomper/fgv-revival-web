"use server";

import {revalidatePath} from "next/cache";
import type {z} from "zod";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {
    createEventType,
    moveEventType,
    restoreEventType,
    retireEventType,
    updateEventType
} from "@/lib/event/event.server";
import {
    eventTypeCreateSchema,
    eventTypeMoveSchema,
    eventTypeTransitionSchema,
    eventTypeUpdateSchema,
    toEventTypeInput,
} from "@/lib/event/schema";
import {
    createEventTypeBudgetLine,
    removeEventTypeBudgetLine,
    updateEventTypeBudgetLine
} from "@/lib/budget/reference.server";
import {
    eventTypeBudgetLineCreateSchema,
    eventTypeBudgetLineRemoveSchema,
    eventTypeBudgetLineUpdateSchema,
    toEventTypeBudgetLineInput,
} from "@/lib/budget/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

// Every revival's events and proposals show the types, so every page is revalidated.
function revalidate() {
    revalidatePath("/", "layout");
}

export async function createEventTypeAction(input: z.input<typeof eventTypeCreateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {values} = eventTypeCreateSchema.parse(input);

        await createEventType(toEventTypeInput(values));
        revalidate();
        return null;
    }));
}

export async function updateEventTypeAction(input: z.input<typeof eventTypeUpdateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version, values} = eventTypeUpdateSchema.parse(input);

        await updateEventType(id, version, toEventTypeInput(values));
        revalidate();
        return null;
    }));
}

export async function moveEventTypeAction(input: z.input<typeof eventTypeMoveSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version, position} = eventTypeMoveSchema.parse(input);

        await moveEventType(id, version, position);
        revalidate();
        return null;
    }));
}

export async function retireEventTypeAction(input: z.input<typeof eventTypeTransitionSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version} = eventTypeTransitionSchema.parse(input);

        await retireEventType(id, version);
        revalidate();
        return null;
    }));
}

export async function restoreEventTypeAction(input: z.input<typeof eventTypeTransitionSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version} = eventTypeTransitionSchema.parse(input);

        await restoreEventType(id, version);
        revalidate();
        return null;
    }));
}

export async function createEventTypeBudgetLineAction(input: z.input<typeof eventTypeBudgetLineCreateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {eventTypeId, values} = eventTypeBudgetLineCreateSchema.parse(input);

        await createEventTypeBudgetLine({eventTypeId, ...toEventTypeBudgetLineInput(values)});
        revalidate();
        return null;
    }));
}

export async function updateEventTypeBudgetLineAction(input: z.input<typeof eventTypeBudgetLineUpdateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version, values} = eventTypeBudgetLineUpdateSchema.parse(input);

        await updateEventTypeBudgetLine(id, version, toEventTypeBudgetLineInput(values));
        revalidate();
        return null;
    }));
}

/**
 * Removes a line from the type; budget lines already added from it keep their history.
 */
export async function removeEventTypeBudgetLineAction(input: z.input<typeof eventTypeBudgetLineRemoveSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version} = eventTypeBudgetLineRemoveSchema.parse(input);

        await removeEventTypeBudgetLine(id, version);
        revalidate();
        return null;
    }));
}
