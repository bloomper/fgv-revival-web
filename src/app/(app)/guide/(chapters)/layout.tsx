import * as React from "react";
import {GuideChapters} from "@/app/(app)/guide/views";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * The latest published version's chapters, with the chapter list that stays while moving between them.
 */
export default async function GuideChaptersLayout({children}: { children: React.ReactNode }) {
    return withPolicyPage(Policies.app.requireAccess, async () => <GuideChapters>{children}</GuideChapters>);
}
