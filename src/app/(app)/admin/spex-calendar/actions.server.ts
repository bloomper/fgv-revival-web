"use server";

import {revalidatePath} from "next/cache";
import type {z} from "zod";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {createSpexCalendarDate, deleteSpexCalendarDate, updateSpexCalendarDate} from "@/lib/spex-calendar/spex-calendar.server";
import {spexCalendarDateCreateSchema, spexCalendarDateDeleteSchema, spexCalendarDateUpdateSchema} from "@/lib/spex-calendar/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

// The timeline of all revivals shows the dates.
function revalidate() {
    revalidatePath("/admin/spex-calendar");
    revalidatePath("/revivals/manage");
}

export async function createSpexCalendarDateAction(input: z.input<typeof spexCalendarDateCreateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {values} = spexCalendarDateCreateSchema.parse(input);

        await createSpexCalendarDate(values);
        revalidate();
        return null;
    }));
}

export async function updateSpexCalendarDateAction(input: z.input<typeof spexCalendarDateUpdateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version, values} = spexCalendarDateUpdateSchema.parse(input);

        await updateSpexCalendarDate(id, version, values);
        revalidate();
        return null;
    }));
}

/**
 * The dates are not revival data, so they are deleted for real.
 */
export async function deleteSpexCalendarDateAction(input: z.input<typeof spexCalendarDateDeleteSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version} = spexCalendarDateDeleteSchema.parse(input);

        await deleteSpexCalendarDate(id, version);
        revalidate();
        return null;
    }));
}
