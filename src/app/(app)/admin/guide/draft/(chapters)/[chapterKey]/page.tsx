import {notFound} from "next/navigation";
import {CatalogProvider} from "@/components/catalog/catalog-provider.client";
import {GuideDraftEditor} from "@/components/guide/admin/guide-draft-editor.client";
import {navChapters} from "@/components/guide/chapters";
import {GuideChapterPager} from "@/components/guide/guide-chapter-pager";
import {loadGuideDraft} from "@/app/(app)/admin/guide/draft/load.server";
import {getGuideItemTypes} from "@/lib/catalog/catalog.server";
import {getLibraryEntries} from "@/lib/library/library.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * Editing one chapter of the draft: its title, sections and items. Super admins only. The chapter list is
 * in the layout.
 */
export default async function GuideDraftChapterPage({params}: { params: Promise<{ chapterKey: string }> }) {
    const {chapterKey} = await params;

    return withPolicyPage(Policies.admin.requireSuperAdmin, async () => {
        const [draft, itemTypes, library] = await Promise.all([loadGuideDraft(), getGuideItemTypes(), getLibraryEntries()]);
        const key = decodeURIComponent(chapterKey);

        if (!draft || !draft.draft.chapters.some(chapter => chapter.key === key)) {
            notFound();
        }

        return (
            <>
                <CatalogProvider itemTypes={itemTypes} library={library}>
                    <GuideDraftEditor draft={draft.draft} chapterKey={key}/>
                </CatalogProvider>
                <GuideChapterPager chapters={navChapters(draft.draft)} current={key} basePath="/admin/guide/draft"/>
            </>
        );
    });
}
