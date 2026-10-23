import * as React from "react";
import {GuideChapters} from "@/app/(app)/guide/views";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * A chosen version's chapters, with the chapter list that stays while moving between them.
 */
export default async function GuideVersionChaptersLayout({children, params}: {
    children: React.ReactNode;
    params: Promise<{ versionId: string }>;
}) {
    const {versionId} = await params;

    return withPolicyPage(Policies.app.requireAccess, async () => <GuideChapters version={decodeURIComponent(versionId)}>{children}</GuideChapters>);
}
