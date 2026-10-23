import {GuideChapter} from "@/app/(app)/guide/views";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * One chapter of a chosen version.
 */
export default async function GuideVersionChapterPage({params}: { params: Promise<{ versionId: string; chapterKey: string }> }) {
    const {versionId, chapterKey} = await params;

    return withPolicyPage(Policies.app.requireAccess, async () => <GuideChapter version={decodeURIComponent(versionId)} chapterKey={chapterKey}/>);
}
