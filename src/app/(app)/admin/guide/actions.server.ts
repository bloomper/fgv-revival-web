"use server";

import {revalidatePath} from "next/cache";
import {getTranslations} from "next-intl/server";
import {type ActionResult, GraphQLRequestError, toActionResult} from "@/lib/graphql.server";
import {discardGuideDraft, importGuide, publishGuideDraft} from "@/lib/guide/guide.server";
import {guideDiscardSchema, guidePublishSchema, MAX_IMPORT_BYTES} from "@/lib/guide/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

export async function importGuideAction(formData: FormData): Promise<ActionResult<{ draftId: number }>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const file = formData.get("file");

        if (!(file instanceof File) || file.size === 0 || file.size > MAX_IMPORT_BYTES) {
            const t = await getTranslations("Guide.import");

            throw new GraphQLRequestError("BAD_REQUEST", t("tooLarge"));
        }

        const result = await importGuide(file);

        revalidatePath("/admin/guide");
        return result;
    }));
}

export async function publishGuideAction(input: { id: string; version: number; label: string; note?: string }): Promise<ActionResult<{ id: string }>> {
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
        revalidatePath("/admin/guide");
        return null;
    }));
}
