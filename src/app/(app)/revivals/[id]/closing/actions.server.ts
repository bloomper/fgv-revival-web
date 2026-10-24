"use server";

import {revalidatePath} from "next/cache";
import type {z} from "zod";
import type {SyncRunFieldsFragment} from "@/gql/graphql";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {anonymizeRevival, getSyncRun, setMembership, startSync} from "@/lib/closing/closing.server";
import {membershipSetSchema, revivalAnonymizeSchema, syncRunSchema, syncStartSchema} from "@/lib/closing/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

// The banner, the participants and the tabs all change with these, so the whole revival is revalidated
function revalidate(revivalId: string) {
    revalidatePath(`/revivals/${revivalId}`, "layout");
}

export async function setMembershipAction(input: z.input<typeof membershipSetSchema>): Promise<ActionResult<{ count: number }>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const parsed = membershipSetSchema.parse(input);
        const updated = await setMembership(parsed);

        revalidate(parsed.revivalId);
        return {count: updated.filter(participant => participant.membershipPaid).length};
    }));
}

export async function startSyncAction(input: z.input<typeof syncStartSchema>): Promise<ActionResult<SyncRunFieldsFragment | null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, previewHash} = syncStartSchema.parse(input);

        return startSync(revivalId, previewHash);
    }));
}

/**
 * Polled every two seconds while a run is going on. Nothing is revalidated here: the page refreshes once the run ends.
 */
export async function syncRunAction(input: z.input<typeof syncRunSchema>): Promise<ActionResult<SyncRunFieldsFragment | null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {id} = syncRunSchema.parse(input);

        return getSyncRun(id);
    }));
}

/** Revalidates the revival once a sync run has ended, so the preview and the summary show what is now there. */
export async function syncFinishedAction(revivalId: string): Promise<void> {
    await withPolicyAction(Policies.app.requireAccess, async () => revalidate(revivalId));
}

export async function anonymizeRevivalAction(input: z.input<typeof revivalAnonymizeSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {id, version, confirmation} = revivalAnonymizeSchema.parse(input);

        await anonymizeRevival(id, version, confirmation);
        revalidatePath("/", "layout");
        return null;
    }));
}
