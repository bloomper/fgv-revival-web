"use server";

import {revalidatePath} from "next/cache";
import type {z} from "zod";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {
    assignShift,
    createShiftSlot,
    removeShiftSlot,
    unassignShift,
    updateShiftSlot
} from "@/lib/staffing/staffing.server";
import {
    shiftAssignmentSchema,
    shiftSlotCreateSchema,
    shiftSlotRemoveSchema,
    shiftSlotUpdateSchema,
    toShiftSlotInput,
} from "@/lib/staffing/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

// Participants see their shifts on their own page, so the whole revival is revalidated.
function revalidate(revivalId: string) {
    revalidatePath(`/revivals/${revivalId}`, "layout");
}

export async function createShiftSlotAction(input: z.input<typeof shiftSlotCreateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, eventId, values} = shiftSlotCreateSchema.parse(input);

        await createShiftSlot(toShiftSlotInput(values, eventId));
        revalidate(revivalId);
        return null;
    }));
}

export async function updateShiftSlotAction(input: z.input<typeof shiftSlotUpdateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, id, version, values} = shiftSlotUpdateSchema.parse(input);

        await updateShiftSlot(id, version, toShiftSlotInput(values));
        revalidate(revivalId);
        return null;
    }));
}

/** Only while nobody is assigned; the server refuses otherwise. */
export async function removeShiftSlotAction(input: z.input<typeof shiftSlotRemoveSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, id, version} = shiftSlotRemoveSchema.parse(input);

        await removeShiftSlot(id, version);
        revalidate(revivalId);
        return null;
    }));
}

export async function assignShiftAction(input: z.input<typeof shiftAssignmentSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, slotId, participantId} = shiftAssignmentSchema.parse(input);

        await assignShift(slotId, participantId);
        revalidate(revivalId);
        return null;
    }));
}

export async function unassignShiftAction(input: z.input<typeof shiftAssignmentSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, slotId, participantId} = shiftAssignmentSchema.parse(input);

        await unassignShift(slotId, participantId);
        revalidate(revivalId);
        return null;
    }));
}
