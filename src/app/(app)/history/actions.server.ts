"use server";

import type {z} from "zod";
import type {RevisionsQuery} from "@/gql/graphql";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {getRevisions} from "@/lib/audit/audit.server";
import {revisionsSchema} from "@/lib/audit/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

export type Revision = RevisionsQuery["revisions"][number];

/**
 * A record's history, fetched when the history dialog opens. The server refuses whoever may not read the record.
 */
export async function getRevisionsAction(input: z.input<typeof revisionsSchema>): Promise<ActionResult<Revision[]>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {type, id} = revisionsSchema.parse(input);

        return getRevisions(type, id);
    }));
}
