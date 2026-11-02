"use server";

import {revalidatePath} from "next/cache";
import type {MaintenanceJob} from "@/gql/graphql";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {runMaintenanceJob} from "@/lib/maintenance/maintenance.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

/**
 * Starts a maintenance job in the background. The data is false when it is already running.
 */
export async function runMaintenanceJobAction(job: MaintenanceJob): Promise<ActionResult<boolean>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const started = await runMaintenanceJob(job);

        revalidatePath("/admin/maintenance");
        return started;
    }));
}
