import Link from "next/link";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {ArrowLeft} from "lucide-react";
import {CatalogProvider} from "@/components/catalog/catalog-provider.client";
import {chapterNumbers, navChapters} from "@/components/guide/chapters";
import {GuideChapterNav} from "@/components/guide/guide-chapter-nav.client";
import {GuideChapterPager} from "@/components/guide/guide-chapter-pager";
import {GuideSearch} from "@/components/guide/guide-search.client";
import {RevivalGuideChapter} from "@/components/guide/suggestion/revival-guide-view.client";
import {loadRevivalGuide} from "@/app/(app)/revivals/[id]/guide/load.server";
import {getGuideItemTypes} from "@/lib/catalog/catalog.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * One chapter of the version a revival is pinned to, with suggestion controls for those who may suggest (FR-031).
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

        const t = await getTranslations("Guide");
        const {revival, version} = loaded;
        const basePath = `/revivals/${revival.id}/guide`;
        const chapters = navChapters(version);
        // Types to suggest, only for those who may suggest; items already carry their own type
        const itemTypes = revival.permissions.canSuggestGuideChange ? await getGuideItemTypes() : [];

        return (
            <div className="flex flex-1 flex-col gap-4">
                <h3 className="sr-only">
                    {t("title")}{revival.guideVersion?.label ? ` ${revival.guideVersion.label}` : ""}
                </h3>
                <Link href={basePath} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
                    <ArrowLeft className="size-4"/>
                    {t("startPage")}
                </Link>
                <GuideSearch versionId={version.id} basePath={basePath} chapterNumbers={chapterNumbers(version)}/>
                <div className="flex flex-col gap-6 lg:flex-row">
                    <GuideChapterNav chapters={chapters} current={key} basePath={basePath}/>
                    <div className="min-w-0 flex-1 space-y-8">
                        <CatalogProvider itemTypes={itemTypes}>
                            <RevivalGuideChapter chapter={version.chapters[index]} number={index + 1} versionId={version.id} revivalId={revival.id}
                                                 canSuggest={revival.permissions.canSuggestGuideChange}/>
                        </CatalogProvider>
                        <GuideChapterPager chapters={chapters} current={key} basePath={basePath}/>
                    </div>
                </div>
            </div>
        );
    });
}
