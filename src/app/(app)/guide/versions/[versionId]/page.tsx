import {GuideStart} from "@/app/(app)/guide/views";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * The guide's start page for a version picked in the version selector (FR-002, FR-003).
 */
export default async function GuideVersionPage({params}: { params: Promise<{ versionId: string }> }) {
    const {versionId} = await params;

    return withPolicyPage(Policies.app.requireAccess, async () => <GuideStart version={decodeURIComponent(versionId)}/>);
}
