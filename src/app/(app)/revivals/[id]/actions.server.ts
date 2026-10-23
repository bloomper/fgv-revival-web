"use server";

import {revalidatePath} from "next/cache";
import type {RevivalRole, RevivalStatus} from "@/gql/graphql";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {changeStatus, updateRevival} from "@/lib/revival/revival.server";
import {addMember, removeMember, setCapabilities} from "@/lib/member/member.server";
import {memberAddSchema, memberCapabilitiesSchema, revivalStatusChangeSchema} from "@/lib/revival/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

// Every action needs access to the application; the server decides what the user may do with the revival.

export async function updateDetailsAction(input: {
    id: string;
    version: number;
    premiereDate: string;
    showDates: string[];
    venues: string[];
}): Promise<ActionResult<{ version: number }>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const updated = await updateRevival({
            id: input.id,
            version: input.version,
            premiereDate: input.premiereDate || null,
            clearPremiereDate: !input.premiereDate,
            showDates: input.showDates,
            venues: input.venues.map(venue => venue.trim()),
        });

        revalidatePath(`/revivals/${input.id}`);
        return {version: updated?.version ?? input.version};
    }));
}

export async function changeStatusAction(input: { id: string; from: RevivalStatus; to: RevivalStatus }): Promise<ActionResult<{ status: RevivalStatus }>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const parsed = revivalStatusChangeSchema.parse(input);
        const changed = await changeStatus(parsed);

        revalidatePath("/", "layout");
        return {status: changed?.status ?? parsed.to};
    }));
}

export async function addMemberAction(input: {
    revivalId: string;
    email: string;
    role: Extract<RevivalRole, "DIRECTEUR" | "STEERING_GROUP">;
    /** Capability ids. */
    capabilities: string[];
}): Promise<ActionResult<{ id: string }>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const parsed = memberAddSchema.parse(input);
        const added = await addMember(parsed);

        revalidatePath("/", "layout");
        return {id: added?.id ?? ""};
    }));
}

export async function setCapabilitiesAction(input: { id: string; version: number; capabilities: string[] }): Promise<ActionResult<{ version: number }>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const parsed = memberCapabilitiesSchema.parse(input);
        const updated = await setCapabilities(parsed);

        revalidatePath("/", "layout");
        return {version: updated?.version ?? parsed.version};
    }));
}

export async function removeMemberAction(id: string): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        await removeMember(id);

        revalidatePath("/", "layout");
        return null;
    }));
}
