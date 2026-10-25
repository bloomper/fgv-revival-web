"use server";

import {revalidatePath} from "next/cache";
import type {z} from "zod";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {updateApplicationSettings} from "@/lib/settings/settings.server";
import {applicationSettingsSchema, toApplicationSettingsInput} from "@/lib/settings/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

export async function updateApplicationSettingsAction(input: z.input<typeof applicationSettingsSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {version, values} = applicationSettingsSchema.parse(input);

        await updateApplicationSettings(version, toApplicationSettingsInput(values));
        // Every participant page shows the terms
        revalidatePath("/", "layout");
        return null;
    }));
}
