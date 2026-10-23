"use server";

import {revalidatePath} from "next/cache";
import type {z} from "zod";
import type {ChecklistTemplateItemUpdateInput} from "@/gql/graphql";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {
    createChecklistTemplate,
    createChecklistTemplateItem,
    moveChecklistTemplateItem,
    restoreChecklistTemplate,
    restoreChecklistTemplateItem,
    retireChecklistTemplate,
    retireChecklistTemplateItem,
    updateChecklistTemplate,
    updateChecklistTemplateItem,
} from "@/lib/checklist/template.server";
import {templateCreateSchema, templateItemSaveSchema, templateItemTransitionSchema} from "@/lib/checklist/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

const ADMIN_PATH = "/admin/checklist-templates";

function revalidate() {
    revalidatePath(ADMIN_PATH, "layout");
}

export async function createTemplateAction(input: z.input<typeof templateCreateSchema>): Promise<ActionResult<{ id: string }>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const parsed = templateCreateSchema.parse(input);
        const created = await createChecklistTemplate(parsed.kind === "CHAPTER"
            ? {kind: "CHAPTER", chapterKey: parsed.chapterKey}
            : {kind: "EVENT", name: {sv: parsed.name.sv, en: parsed.name.en || null}});

        revalidate();
        return {id: created?.id ?? ""};
    }));
}

export async function renameTemplateAction(input: { id: string; version: number; sv: string; en?: string }): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        await updateChecklistTemplate({id: input.id, version: input.version, name: {sv: input.sv, en: input.en || null}});
        revalidate();
        return null;
    }));
}

export async function retireTemplateAction(input: { id: string; version: number }): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        await retireChecklistTemplate(input.id, input.version);
        revalidate();
        return null;
    }));
}

export async function restoreTemplateAction(input: { id: string; version: number }): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        await restoreChecklistTemplate(input.id, input.version);
        revalidate();
        return null;
    }));
}

export async function saveTemplateItemAction(input: z.input<typeof templateItemSaveSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {templateId, item, values} = templateItemSaveSchema.parse(input);
        const text = {sv: values.text.sv, en: values.text.en || null};

        if (item) {
            const update: ChecklistTemplateItemUpdateInput = {id: item.id, version: item.version, text};

            if (values.guideItemKey) {
                update.guideItemKey = values.guideItemKey;
            } else {
                update.clearGuideItem = true;
            }
            if (values.defaultCapability) {
                update.defaultCapability = values.defaultCapability;
            } else {
                update.clearDefaultCapability = true;
            }
            if (values.deadline) {
                update.deadline = values.deadline;
            } else {
                update.clearDeadline = true;
            }
            await updateChecklistTemplateItem(update);
        } else {
            await createChecklistTemplateItem({
                templateId, text, guideItemKey: values.guideItemKey, defaultCapability: values.defaultCapability, deadline: values.deadline,
            });
        }
        revalidate();
        return null;
    }));
}

export async function moveTemplateItemAction(input: z.input<typeof templateItemTransitionSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version, position} = templateItemTransitionSchema.parse(input);

        await moveChecklistTemplateItem(id, version, position ?? 0);
        revalidate();
        return null;
    }));
}

export async function retireTemplateItemAction(input: z.input<typeof templateItemTransitionSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version} = templateItemTransitionSchema.parse(input);

        await retireChecklistTemplateItem(id, version);
        revalidate();
        return null;
    }));
}

export async function restoreTemplateItemAction(input: z.input<typeof templateItemTransitionSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version} = templateItemTransitionSchema.parse(input);

        await restoreChecklistTemplateItem(id, version);
        revalidate();
        return null;
    }));
}
