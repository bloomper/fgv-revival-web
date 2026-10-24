"use server";

import {revalidatePath} from "next/cache";
import type {z} from "zod";
import type {ChecklistItemUpdateInput, OwnerInput} from "@/gql/graphql";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {
    addChecklistItemsFromTemplate,
    cancelEventChecklist,
    createChecklistItem,
    createEventChecklist,
    setChecklistItemState,
    updateChecklistItem,
    updateEventChecklist,
} from "@/lib/checklist/checklist.server";
import {
    checklistItemCreateSchema,
    checklistItemStateSchema,
    checklistItemUpdateSchema,
    checklistTransitionSchema,
    eventChecklistSaveSchema,
} from "@/lib/checklist/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

function ownerInput(owner: { personId?: string | null; name?: string | null } | null | undefined): OwnerInput | null {
    if (owner?.personId) {
        return {personId: owner.personId};
    }
    return owner?.name ? {name: owner.name} : null;
}

function revalidate(revivalId: string) {
    revalidatePath(`/revivals/${revivalId}`, "layout");
}

export async function createChecklistItemAction(input: z.input<typeof checklistItemCreateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {checklistId, revivalId, values} = checklistItemCreateSchema.parse(input);

        await createChecklistItem({
            checklistId,
            text: values.text,
            owner: ownerInput(values.owner),
            deadline: values.deadline || null,
            comment: values.comment || null,
        });
        revalidate(revivalId);
        return null;
    }));
}

export async function updateChecklistItemAction(input: z.input<typeof checklistItemUpdateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {id, version, revivalId, values} = checklistItemUpdateSchema.parse(input);
        const update: ChecklistItemUpdateInput = {id, version};
        const owner = ownerInput(values.owner);

        if (values.text) {
            update.text = values.text;
        }
        if (values.owner !== undefined) {
            if (owner) {
                update.owner = owner;
            } else {
                update.clearOwner = true;
            }
        }
        if (values.deadline !== undefined) {
            if (values.deadline) {
                update.deadline = values.deadline;
            } else {
                update.clearDeadline = true;
            }
        }
        if (values.comment !== undefined) {
            if (values.comment) {
                update.comment = values.comment;
            } else {
                update.clearComment = true;
            }
        }
        await updateChecklistItem(update);
        revalidate(revivalId);
        return null;
    }));
}

export async function setChecklistItemStateAction(input: z.input<typeof checklistItemStateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {id, version, revivalId, state, reason} = checklistItemStateSchema.parse(input);

        await setChecklistItemState({id, version, state, reason: reason || null});
        revalidate(revivalId);
        return null;
    }));
}

export async function saveEventChecklistAction(input: z.input<typeof eventChecklistSaveSchema>): Promise<ActionResult<{
    id: string
}>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, checklist, values} = eventChecklistSaveSchema.parse(input);
        let id = checklist?.id ?? "";

        if (checklist) {
            await updateEventChecklist({
                id: checklist.id,
                version: checklist.version,
                name: values.name,
                date: values.date,
                clearDate: !values.date
            });
        } else {
            id = (await createEventChecklist({
                revivalId,
                name: values.name,
                date: values.date,
                templateId: values.templateId || null
            }))?.id ?? "";
        }
        revalidate(revivalId);
        return {id};
    }));
}

export async function cancelEventChecklistAction(input: z.input<typeof checklistTransitionSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, id, version} = checklistTransitionSchema.parse(input);

        await cancelEventChecklist(id, version);
        revalidate(revivalId);
        return null;
    }));
}

export async function addFromTemplateAction(input: z.input<typeof checklistTransitionSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, id, version, templateId} = checklistTransitionSchema.parse(input);

        await addChecklistItemsFromTemplate({checklistId: id, version, templateId: templateId || null});
        revalidate(revivalId);
        return null;
    }));
}
