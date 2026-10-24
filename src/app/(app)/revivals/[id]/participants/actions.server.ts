"use server";

import {revalidatePath} from "next/cache";
import type {z} from "zod";
import type {ParticipantUpdateInput, ReferralOutcome, SpexareCandidateFieldsFragment} from "@/gql/graphql";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {parseAmount} from "@/lib/budget/amount";
import {normalizeSwishNumber} from "@/lib/participant/contact";
import {
    addParticipant,
    addSpexareParticipants,
    getParticipantCandidates,
    handleReferral,
    inviteParticipants,
    removeParticipant,
    searchSpexare,
    setParticipantFeePaid,
    updateParticipant,
    updateParticipationSettings,
} from "@/lib/participant/participant.server";
import {
    participantAddPendingSchema,
    participantAddSpexareSchema,
    participantFeePaidSchema,
    participantsInviteSchema,
    participantTransitionSchema,
    participantUpdateSchema,
    participationSettingsSchema,
    referralHandleSchema,
    spexareSearchSchema,
} from "@/lib/participant/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

// The counts on the tab and the participant's own page change with the list, so the whole revival is revalidated.
function revalidate(revivalId: string) {
    revalidatePath(`/revivals/${revivalId}`, "layout");
}

const amountOrNull = (value: string) => value ? parseAmount(value) : null;

export async function participantCandidatesAction(revivalId: string): Promise<ActionResult<SpexareCandidateFieldsFragment[]>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(() => getParticipantCandidates(revivalId)));
}

export async function spexareSearchAction(input: z.input<typeof spexareSearchSchema>): Promise<ActionResult<SpexareCandidateFieldsFragment[]>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, query} = spexareSearchSchema.parse(input);

        return searchSpexare(revivalId, query);
    }));
}

export async function addSpexareParticipantsAction(input: z.input<typeof participantAddSpexareSchema>): Promise<ActionResult<{ count: number }>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, spexareIds} = participantAddSpexareSchema.parse(input);
        const added = await addSpexareParticipants(revivalId, spexareIds);

        revalidate(revivalId);
        return {count: added.length};
    }));
}

export async function addPendingParticipantAction(input: z.input<typeof participantAddPendingSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, values} = participantAddPendingSchema.parse(input);

        await addParticipant({
            revivalId,
            kind: values.kind,
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email ? values.email.toLowerCase() : null,
            phone: values.phone || null,
            positionId: values.positionId || null,
            compensationPerShift: values.kind === "HELPER" ? amountOrNull(values.compensationPerShift) : null,
        });
        revalidate(revivalId);
        return null;
    }));
}

/**
 * Sends the position, and the role name and vocal part only for a position that takes them (clearing them otherwise).
 * A blank fee leaves the participant's own amount as it is; a pending person's details are sent only for them.
 */
export async function updateParticipantAction(input: z.input<typeof participantUpdateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, id, version, pending, kind, hasRole, values} = participantUpdateSchema.parse(input);
        const update: ParticipantUpdateInput = {
            id, version,
            ...(values.positionId ? {positionId: values.positionId} : {clearPosition: true}),
            ...(hasRole && values.roleName ? {roleName: values.roleName} : {clearRoleName: true}),
            ...(hasRole && values.vocalPartId ? {vocalPartId: values.vocalPartId} : {clearVocalPart: true}),
        };

        if (kind === "PARTICIPANT") {
            if (values.revivalFee || !values.fee) {
                update.clearFee = true;
            } else {
                update.fee = parseAmount(values.fee);
            }
        } else if (values.compensationPerShift) {
            update.compensationPerShift = parseAmount(values.compensationPerShift);
        }
        if (pending) {
            update.firstName = values.firstName;
            update.lastName = values.lastName;
            // Blank clears (participant.graphqls); the schema keeps the email a participant needs, or a helper's one of two
            if (values.email) {
                update.email = values.email.toLowerCase();
            } else {
                update.clearEmail = true;
            }
            if (values.phone) {
                update.phone = values.phone;
            } else {
                update.clearPhone = true;
            }
        }

        await updateParticipant(update);
        revalidate(revivalId);
        return null;
    }));
}

export async function removeParticipantAction(input: z.input<typeof participantTransitionSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, id, version} = participantTransitionSchema.parse(input);

        await removeParticipant(id, version);
        revalidate(revivalId);
        return null;
    }));
}

export type InviteOutcome = {
    invited: number;
    skipped: { id: string; firstName: string; lastName: string; nickName?: string | null; removed: boolean; reason: string }[];
};

export async function inviteParticipantsAction(input: z.input<typeof participantsInviteSchema>): Promise<ActionResult<InviteOutcome>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, participantIds, email, language} = participantsInviteSchema.parse(input);
        const result = await inviteParticipants({
            revivalId, participantIds, language,
            email: email && participantIds.length === 1 ? email.toLowerCase() : null,
        });

        revalidate(revivalId);
        return {
            invited: result.invited.length,
            skipped: result.skipped.map(skip => ({...skip.participant, reason: skip.reason})),
        };
    }));
}

export async function setParticipantFeePaidAction(input: z.input<typeof participantFeePaidSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, id, version, paid} = participantFeePaidSchema.parse(input);

        await setParticipantFeePaid(id, version, paid);
        revalidate(revivalId);
        return null;
    }));
}

export async function updateParticipationSettingsAction(input: z.input<typeof participationSettingsSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, version, values} = participationSettingsSchema.parse(input);

        await updateParticipationSettings({
            revivalId, version,
            swishNumber: values.swishNumber ? normalizeSwishNumber(values.swishNumber) : null,
            whatsappLink: values.whatsappLink || null,
            terms: values.terms || null,
        });
        revalidate(revivalId);
        return null;
    }));
}

export async function handleReferralAction(input: z.input<typeof referralHandleSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, id, outcome} = referralHandleSchema.parse(input);

        await handleReferral(id, outcome as ReferralOutcome);
        revalidate(revivalId);
        return null;
    }));
}
