import {notFound} from "next/navigation";
import {CatalogProvider} from "@/components/catalog/catalog-provider.client";
import {navChapters} from "@/components/guide/chapters";
import {GuideChapterPager} from "@/components/guide/guide-chapter-pager";
import {RevivalGuideChapter} from "@/components/guide/suggestion/revival-guide-view.client";
import {loadRevivalGuide} from "@/app/(app)/revivals/[id]/guide/load.server";
import {getGuideItemTypes} from "@/lib/catalog/catalog.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * One chapter of the version a revival is pinned to, with suggestion controls for those who may suggest (FR-031). The
 * heading, search and chapter list are in the layout.
 */
export default async function RevivalGuideChapterPage({params}: { params: Promise<{ id: string; chapterKey: string }> }) {
    const {id, chapterKey} = await params;

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const loaded = await loadRevivalGuide(id);
        const key = decodeURIComponent(chapterKey);
        const index = loaded?.version?.chapters.findIndex(chapter => chapter.key === key) ?? -1;

        if (!loaded?.version || index < 0) {
            notFound();
        }

        const {revival, version} = loaded;
        // Types to suggest, only for those who may suggest; items already carry their own type
        const itemTypes = revival.permissions.canSuggestGuideChange ? await getGuideItemTypes() : [];

        return (
            <>
                <CatalogProvider itemTypes={itemTypes}>
                    <RevivalGuideChapter chapter={version.chapters[index]} number={index + 1} versionId={version.id} revivalId={revival.id}
                                         canSuggest={revival.permissions.canSuggestGuideChange}/>
                </CatalogProvider>
                <GuideChapterPager chapters={navChapters(version)} current={key} basePath={`/revivals/${revival.id}/guide`}/>
            </>
        );
    });
}
