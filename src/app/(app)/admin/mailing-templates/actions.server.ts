"use server";

import {revalidatePath} from "next/cache";
import type {z} from "zod";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {
    createMailingTemplate,
    moveMailingTemplate,
    restoreMailingTemplate,
    retireMailingTemplate,
    updateMailingTemplate,
} from "@/lib/mailing/mailing.server";
import {
    mailingTemplateCreateSchema,
    mailingTemplateMoveSchema,
    mailingTemplateTransitionSchema,
    mailingTemplateUpdateSchema,
    toMailingTemplateInput,
} from "@/lib/mailing/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

// Every revival's mailing plan follows the templates, so every page is revalidated.
function revalidate() {
    revalidatePath("/", "layout");
}

export async function createMailingTemplateAction(input: z.input<typeof mailingTemplateCreateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {values} = mailingTemplateCreateSchema.parse(input);

        await createMailingTemplate(toMailingTemplateInput(values));
        revalidate();
        return null;
    }));
}

export async function updateMailingTemplateAction(input: z.input<typeof mailingTemplateUpdateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version, values} = mailingTemplateUpdateSchema.parse(input);

        await updateMailingTemplate(id, version, toMailingTemplateInput(values));
        revalidate();
        return null;
    }));
}

export async function moveMailingTemplateAction(input: z.input<typeof mailingTemplateMoveSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version, position} = mailingTemplateMoveSchema.parse(input);

        await moveMailingTemplate(id, version, position);
        revalidate();
        return null;
    }));
}

export async function retireMailingTemplateAction(input: z.input<typeof mailingTemplateTransitionSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version} = mailingTemplateTransitionSchema.parse(input);

        await retireMailingTemplate(id, version);
        revalidate();
        return null;
    }));
}

export async function restoreMailingTemplateAction(input: z.input<typeof mailingTemplateTransitionSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version} = mailingTemplateTransitionSchema.parse(input);

        await restoreMailingTemplate(id, version);
        revalidate();
        return null;
    }));
}
