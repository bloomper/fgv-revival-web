"use server";

import {revalidatePath} from "next/cache";
import type {z} from "zod";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {
    changeRevivalGuideVersion,
    createGuideSuggestion,
    getGuideChanges,
    getGuideVersionChangeImpact,
    withdrawGuideSuggestion,
} from "@/lib/guide/guide.server";
import {guideRemoveSchema, guideSuggestionCreateSchema, revivalGuideVersionChangeSchema} from "@/lib/guide/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

export async function changeGuideVersionAction(input: z.input<typeof revivalGuideVersionChangeSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const parsed = revivalGuideVersionChangeSchema.parse(input);

        await changeRevivalGuideVersion(parsed);
        revalidatePath(`/revivals/${parsed.revivalId}`, "layout");
        return null;
    }));
}

export async function guideVersionChangeImpactAction(revivalId: string, toId: string):
    Promise<ActionResult<Awaited<ReturnType<typeof getGuideVersionChangeImpact>>>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(() => getGuideVersionChangeImpact(revivalId, toId)));
}

export async function guideChangesAction(fromId: string, toId: string): Promise<ActionResult<Awaited<ReturnType<typeof getGuideChanges>>>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(() => getGuideChanges(fromId, toId)));
}

export async function suggestAction(input: z.input<typeof guideSuggestionCreateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {values, ...place} = guideSuggestionCreateSchema.parse(input);

        await createGuideSuggestion({
            ...place,
            itemKey: place.itemKey ?? null,
            chapterKey: place.chapterKey ?? null,
            sectionKey: place.sectionKey ?? null,
            kind: values.kind,
            proposedType: values.proposedType ?? null,
            proposedTextSv: values.proposedTextSv || null,
            proposedTextEn: values.proposedTextEn || null,
            reason: values.reason || null,
        });
        revalidatePath(`/revivals/${place.revivalId}/guide`, "layout");
        return null;
    }));
}

export async function withdrawSuggestionAction(input: z.input<typeof guideRemoveSchema> & {
    revivalId: string
}): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const parsed = guideRemoveSchema.parse(input);

        await withdrawGuideSuggestion(parsed.id, parsed.version);
        revalidatePath(`/revivals/${input.revivalId}/guide`, "layout");
        return null;
    }));
}
