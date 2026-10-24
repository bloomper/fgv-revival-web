"use server";

import {revalidatePath} from "next/cache";
import type {z} from "zod";
import type {MailingRecipientStatus} from "@/gql/graphql";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {
    cancelMailing,
    createMailing,
    previewMailingAudience,
    retryMailing,
    sendMailing,
    updateMailing
} from "@/lib/mailing/mailing.server";
import {
    audiencePreviewSchema,
    mailingCreateSchema,
    mailingRetrySchema,
    mailingTransitionSchema,
    mailingUpdateSchema,
    toAudienceInput,
} from "@/lib/mailing/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

// Mailings (M6b). The plan on the tab shows each entry's mailing, so the whole revival's mailings are revalidated.
function revalidate(revivalId: string) {
    revalidatePath(`/revivals/${revivalId}/mailings`, "layout");
}

const counts = (recipients: { status: MailingRecipientStatus }[]) => ({
    sent: recipients.filter(recipient => recipient.status === "SENT").length,
    failed: recipients.filter(recipient => recipient.status === "FAILED").length,
    noAddress: recipients.filter(recipient => recipient.status === "NO_ADDRESS").length,
});

/** Who the audience reaches now, by name, for the editor's live preview and the send dialog. */
export async function previewAudienceAction(input: z.input<typeof audiencePreviewSchema>): Promise<ActionResult<{
    displayName: string;
    hasAddress: boolean
}[]>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, audience} = audiencePreviewSchema.parse(input);

        return previewMailingAudience(revivalId, toAudienceInput(audience));
    }));
}

/** A new draft, from a plan entry or not. Returns its id so the editor can open it. */
export async function createMailingAction(input: z.input<typeof mailingCreateSchema>): Promise<ActionResult<string | null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, planned, values} = mailingCreateSchema.parse(input);
        const created = await createMailing({
            revivalId, audience: toAudienceInput(values.audience), subject: values.subject, body: values.body,
            templateId: planned?.templateId ?? null, eventId: planned?.eventId ?? null,
        });

        revalidate(revivalId);
        return created?.id ?? null;
    }));
}

export async function updateMailingAction(input: z.input<typeof mailingUpdateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, id, version, planned, values} = mailingUpdateSchema.parse(input);

        await updateMailing(id, version, {
            audience: toAudienceInput(values.audience), subject: values.subject, body: values.body,
            templateId: planned?.templateId ?? null, eventId: planned?.eventId ?? null,
        });
        revalidate(revivalId);
        return null;
    }));
}

export async function cancelMailingAction(input: z.input<typeof mailingTransitionSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, id, version} = mailingTransitionSchema.parse(input);

        await cancelMailing(id, version);
        revalidate(revivalId);
        return null;
    }));
}

/** Sends the draft to its audience as it is now (M6B-FR-9); returns how it went per status. */
export async function sendMailingAction(input: z.input<typeof mailingTransitionSchema>): Promise<ActionResult<ReturnType<typeof counts>>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, id, version} = mailingTransitionSchema.parse(input);
        const sent = await sendMailing(id, version);

        revalidate(revivalId);
        return counts(sent?.recipients ?? []);
    }));
}

/** Sends again to the recipients it failed for. */
export async function retryMailingAction(input: z.input<typeof mailingRetrySchema>): Promise<ActionResult<ReturnType<typeof counts>>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, id} = mailingRetrySchema.parse(input);
        const sent = await retryMailing(id);

        revalidate(revivalId);
        return counts(sent?.recipients ?? []);
    }));
}
