"use server";

import {revalidatePath} from "next/cache";
import type {z} from "zod";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {createLibraryEntry, restoreLibraryEntry, retireLibraryEntry, updateLibraryEntry} from "@/lib/library/library.server";
import {
    libraryEntryCreateSchema,
    libraryEntryTransitionSchema,
    libraryEntryUpdateSchema,
    toLibraryEntryInput,
} from "@/lib/library/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

// Guide items everywhere show the entries they link to, so every page is revalidated.
function revalidate() {
    revalidatePath("/", "layout");
}

export async function createLibraryEntryAction(input: z.input<typeof libraryEntryCreateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {values} = libraryEntryCreateSchema.parse(input);

        await createLibraryEntry(toLibraryEntryInput(values));
        revalidate();
        return null;
    }));
}

export async function updateLibraryEntryAction(input: z.input<typeof libraryEntryUpdateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version, values} = libraryEntryUpdateSchema.parse(input);

        await updateLibraryEntry(id, version, toLibraryEntryInput(values));
        revalidate();
        return null;
    }));
}

export async function retireLibraryEntryAction(input: z.input<typeof libraryEntryTransitionSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version} = libraryEntryTransitionSchema.parse(input);

        await retireLibraryEntry(id, version);
        revalidate();
        return null;
    }));
}

export async function restoreLibraryEntryAction(input: z.input<typeof libraryEntryTransitionSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.admin.requireSuperAdmin, () => toActionResult(async () => {
        const {id, version} = libraryEntryTransitionSchema.parse(input);

        await restoreLibraryEntry(id, version);
        revalidate();
        return null;
    }));
}
