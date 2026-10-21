"use server";

import type {GuideSearchQuery} from "@/gql/graphql";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {searchGuide} from "@/lib/guide/guide.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

export type GuideSearchHit = GuideSearchQuery["guideSearch"][number];

export async function searchGuideAction(versionId: string | null, query: string): Promise<ActionResult<GuideSearchHit[]>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(() => searchGuide(versionId, query.trim())));
}
