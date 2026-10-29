"use server";

import {revalidatePath} from "next/cache";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {createRevival, deleteRevival, updateRevival} from "@/lib/revival/revival.server";
import {searchSpex} from "@/lib/spex/spex.server";
import {revivalCoreSchema, revivalCreateSchema} from "@/lib/revival/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

// Status changes and directeurs use the actions in revivals/[id]/actions.server.ts.

export type SpexOption = { id: string; title: string | null; year: number | null };

export async function searchSpexAction(query: string): Promise<ActionResult<SpexOption[]>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const found = await searchSpex(query);

        return found.map(spex => ({id: spex.id, title: spex.title ?? null, year: spex.year ?? null}));
    }));
}

export async function createRevivalAction(input: { spexId: string; year: number; past: boolean }): Promise<ActionResult<{
    id: string
}>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const parsed = revivalCreateSchema.parse(input);
        const created = await createRevival(parsed);

        revalidatePath("/", "layout");
        return {id: created?.id ?? ""};
    }));
}

export async function updateRevivalAction(input: {
    id: string;
    version: number;
    spexId: string;
    year: number;
    past: boolean
}): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version, spexId, year, past} = revivalCoreSchema.parse(input);

        await updateRevival({id, version, spexId, year, past});
        revalidatePath("/", "layout");
        return null;
    }));
}

/**
 * Deletes the revivals one by one and stops at the first refusal, which it reports.
 */
export async function deleteRevivalsAction(revivals: { id: string; version: number }[]): Promise<ActionResult<{
    deleted: number
}>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        let deleted = 0;

        try {
            for (const revival of revivals) {
                await deleteRevival(revival.id, revival.version);
                deleted++;
            }
        } finally {
            revalidatePath("/", "layout");
        }
        return {deleted};
    }));
}
