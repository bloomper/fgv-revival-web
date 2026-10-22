"use server";

import {revalidatePath} from "next/cache";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {deleteGuideVersion, discardGuideDraft, publishGuideDraft} from "@/lib/guide/guide.server";
import {guideDiscardSchema, guidePublishSchema, guideRemoveSchema} from "@/lib/guide/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

export async function publishGuideAction(input: { id: string; version: number; note?: string }): Promise<ActionResult<{ id: string }>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const parsed = guidePublishSchema.parse(input);
        const published = await publishGuideDraft({...parsed, note: parsed.note || null});

        revalidatePath("/", "layout");
        return {id: published?.id ?? ""};
    }));
}

export async function discardGuideAction(input: { id: string; version: number }): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const parsed = guideDiscardSchema.parse(input);

        await discardGuideDraft(parsed.id, parsed.version);
        revalidatePath("/admin/guide", "layout");
        return null;
    }));
}

/**
 * Deletes a published version no revival follows; the server refuses one that is still in use.
 */
export async function deleteGuideVersionAction(input: { id: string; version: number }): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const parsed = guideRemoveSchema.parse(input);

        await deleteGuideVersion(parsed.id, parsed.version);
        revalidatePath("/", "layout");
        return null;
    }));
}
