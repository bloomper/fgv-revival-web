"use server";

import {revalidatePath} from "next/cache";
import type {z} from "zod";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {acceptGuideSuggestion, rejectGuideSuggestion} from "@/lib/guide/guide.server";
import {guideSuggestionAcceptSchema, guideSuggestionRejectSchema} from "@/lib/guide/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

export async function acceptSuggestionAction(input: z.input<typeof guideSuggestionAcceptSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const parsed = guideSuggestionAcceptSchema.parse(input);
        const resolution = parsed.resolution;

        await acceptGuideSuggestion({
            id: parsed.id,
            version: parsed.version,
            note: parsed.note || null,
            resolution: resolution ? {
                keep: resolution.keep ?? false,
                type: resolution.type ?? null,
                text: resolution.text ? {sv: resolution.text.sv, en: resolution.text.en || null} : null,
            } : null,
        });
        revalidatePath("/admin/guide", "layout");
        return null;
    }));
}

export async function rejectSuggestionAction(input: z.input<typeof guideSuggestionRejectSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const parsed = guideSuggestionRejectSchema.parse(input);

        await rejectGuideSuggestion({id: parsed.id, version: parsed.version, reason: parsed.reason || null});
        revalidatePath("/admin/guide", "layout");
        return null;
    }));
}
