"use server";

import {revalidatePath} from "next/cache";
import type {z} from "zod";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {
    createGuideItem,
    createGuideSection,
    moveGuideItem,
    moveGuideSection,
    removeGuideItem,
    removeGuideSection,
    startGuideDraft,
    updateGuideChapter,
    updateGuideIntroduction,
    updateGuideItem,
    updateGuideSection,
} from "@/lib/guide/guide.server";
import {
    guideChapterUpdateSchema,
    guideIntroductionUpdateSchema,
    guideItemCreateSchema,
    guideItemMoveSchema,
    guideItemUpdateSchema,
    guideRemoveSchema,
    guideSectionCreateSchema,
    guideSectionMoveSchema,
    guideSectionUpdateSchema,
} from "@/lib/guide/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

/**
 * Validates, runs one edit of the draft as super admin, and refreshes the draft pages.
 */
async function edit<S extends z.ZodType>(schema: S, input: unknown, work: (parsed: z.infer<S>) => Promise<unknown>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        await work(schema.parse(input));
        revalidatePath("/admin/guide", "layout");
        return null;
    }));
}

const en = (text: { en?: string | null }) => text.en || null;

export async function startDraftAction(): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        await startGuideDraft();
        revalidatePath("/admin/guide", "layout");
        return null;
    }));
}

export async function updateIntroductionAction(input: z.input<typeof guideIntroductionUpdateSchema>) {
    return edit(guideIntroductionUpdateSchema, input, parsed =>
        updateGuideIntroduction({...parsed, introduction: {sv: parsed.introduction.sv, en: en(parsed.introduction)}}));
}

export async function updateChapterAction(input: z.input<typeof guideChapterUpdateSchema>) {
    return edit(guideChapterUpdateSchema, input, parsed => updateGuideChapter({...parsed, title: {sv: parsed.title.sv, en: en(parsed.title)}}));
}

export async function createSectionAction(input: z.input<typeof guideSectionCreateSchema>) {
    return edit(guideSectionCreateSchema, input, parsed =>
        createGuideSection({chapterId: parsed.chapterId, position: parsed.position ?? null, title: {sv: parsed.title.sv, en: en(parsed.title)}}));
}

export async function updateSectionAction(input: z.input<typeof guideSectionUpdateSchema>) {
    return edit(guideSectionUpdateSchema, input, parsed => updateGuideSection({...parsed, title: {sv: parsed.title.sv, en: en(parsed.title)}}));
}

export async function moveSectionAction(input: z.input<typeof guideSectionMoveSchema>) {
    return edit(guideSectionMoveSchema, input, parsed => moveGuideSection(parsed));
}

export async function removeSectionAction(input: z.input<typeof guideRemoveSchema>) {
    return edit(guideRemoveSchema, input, parsed => removeGuideSection(parsed.id, parsed.version));
}

export async function createItemAction(input: z.input<typeof guideItemCreateSchema>) {
    return edit(guideItemCreateSchema, input, parsed => createGuideItem({
        chapterId: parsed.chapterId, sectionId: parsed.sectionId ?? null, position: parsed.position ?? null, type: parsed.type,
        text: {sv: parsed.text.sv, en: en(parsed.text)},
    }));
}

export async function updateItemAction(input: z.input<typeof guideItemUpdateSchema>) {
    return edit(guideItemUpdateSchema, input, parsed =>
        updateGuideItem({id: parsed.id, version: parsed.version, type: parsed.type, text: {sv: parsed.text.sv, en: en(parsed.text)}}));
}

export async function moveItemAction(input: z.input<typeof guideItemMoveSchema>) {
    return edit(guideItemMoveSchema, input, parsed => moveGuideItem({...parsed, sectionId: parsed.sectionId ?? null}));
}

export async function removeItemAction(input: z.input<typeof guideRemoveSchema>) {
    return edit(guideRemoveSchema, input, parsed => removeGuideItem(parsed.id, parsed.version));
}
