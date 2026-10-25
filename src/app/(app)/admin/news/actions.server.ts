"use server";

import {revalidatePath} from "next/cache";
import type {z} from "zod";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {createNews, deleteNews, updateNews} from "@/lib/news/news.server";
import {newsCreateSchema, newsDeleteSchema, newsUpdateSchema} from "@/lib/news/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

// The start page shows the news.
function revalidate() {
    revalidatePath("/admin/news");
    revalidatePath("/");
}

export async function createNewsAction(input: z.input<typeof newsCreateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {values} = newsCreateSchema.parse(input);

        await createNews(values);
        revalidate();
        return null;
    }));
}

export async function updateNewsAction(input: z.input<typeof newsUpdateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version, values} = newsUpdateSchema.parse(input);

        await updateNews(id, version, values);
        revalidate();
        return null;
    }));
}

/**
 * News is not revival data, so it is deleted for real; its history stays.
 */
export async function deleteNewsAction(input: z.input<typeof newsDeleteSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version} = newsDeleteSchema.parse(input);

        await deleteNews(id, version);
        revalidate();
        return null;
    }));
}
