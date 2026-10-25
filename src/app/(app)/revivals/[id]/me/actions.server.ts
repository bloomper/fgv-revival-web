"use server";

import {revalidatePath} from "next/cache";
import type {z} from "zod";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {
    createReferral,
    respondToParticipation,
    setParticipationDietary,
    updateParticipationContact,
} from "@/lib/participant/participant.server";
import {contactSchema, dietarySchema, referralSchema, respondSchema} from "@/lib/participant/schema";
import {setAvailability, signUpForShift, withdrawFromShift} from "@/lib/staffing/staffing.server";
import {availabilitySchema, shiftOwnSchema} from "@/lib/staffing/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

// The participant's own page. The steering group's list shows the same answers, so the whole revival is
// revalidated.
function revalidate(revivalId: string) {
    revalidatePath(`/revivals/${revivalId}`, "layout");
}

export async function respondAction(input: z.input<typeof respondSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, values} = respondSchema.parse(input);
        const response = values.response || "MAYBE";
        const asksConsent = response === "YES" || response === "MAYBE";

        await respondToParticipation({
            revivalId,
            response,
            preferredPositionId: values.preferredPositionId || null,
            comment: values.comment || null,
            termsAccepted: response === "YES" ? values.termsAccepted : null,
            registerConsent: asksConsent && values.registerConsent ? values.registerConsent === "yes" : null,
        });
        revalidate(revivalId);
        return null;
    }));
}

export async function updateContactAction(input: z.input<typeof contactSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, values} = contactSchema.parse(input);

        await updateParticipationContact({
            revivalId,
            email: values.email ? values.email.toLowerCase() : null,
            phone: values.phone || null,
            streetAddress: values.streetAddress || null,
            postalCode: values.postalCode || null,
            city: values.city || null,
        });
        revalidate(revivalId);
        return null;
    }));
}

export async function setDietaryAction(input: z.input<typeof dietarySchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, values} = dietarySchema.parse(input);

        await setParticipationDietary(revivalId, values.text || null);
        revalidate(revivalId);
        return null;
    }));
}

export async function createReferralAction(input: z.input<typeof referralSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, values} = referralSchema.parse(input);

        await createReferral({
            revivalId,
            name: values.name,
            contact: values.contact || null,
            comment: values.comment || null
        });
        return null;
    }));
}

/**
 * The participant's availability for the days of one event: each day sent is set, or cleared without an
 * answer. Only the days the form changed are sent, one call each, as the contract sets one day at a time.
 */
export async function setAvailabilityAction(input: z.input<typeof availabilitySchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, eventId, values} = availabilitySchema.parse(input);

        for (const day of values.days) {
            await setAvailability({
                revivalId,
                eventId,
                date: day.date,
                answer: day.answer || null,
                comment: day.answer ? day.comment || null : null
            });
        }
        revalidate(revivalId);
        return null;
    }));
}

export async function signUpForShiftAction(input: z.input<typeof shiftOwnSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, slotId} = shiftOwnSchema.parse(input);

        await signUpForShift(slotId);
        revalidate(revivalId);
        return null;
    }));
}

export async function withdrawFromShiftAction(input: z.input<typeof shiftOwnSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, slotId} = shiftOwnSchema.parse(input);

        await withdrawFromShift(slotId);
        revalidate(revivalId);
        return null;
    }));
}
