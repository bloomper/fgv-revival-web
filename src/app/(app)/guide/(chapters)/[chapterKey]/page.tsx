import {GuideChapter} from "@/app/(app)/guide/views";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * One chapter of the latest published version.
 */
export default async function GuideChapterPage({params}: { params: Promise<{ chapterKey: string }> }) {
    const {chapterKey} = await params;

    return withPolicyPage(Policies.app.requireAccess, async () => <GuideChapter chapterKey={chapterKey}/>);
}
