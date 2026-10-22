import Link from "next/link";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {ArrowLeft} from "lucide-react";
import {GuideDraftEditor} from "@/components/guide/admin/guide-draft-editor.client";
import {navChapters} from "@/components/guide/chapters";
import {GuideChapterNav} from "@/components/guide/guide-chapter-nav.client";
import {GuideChapterPager} from "@/components/guide/guide-chapter-pager";
import {getGuideDraft} from "@/lib/guide/guide.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * Editing one chapter of the draft: its title, sections and items (US3, FR-013). Super admins only.
 */
export default async function GuideDraftChapterPage({params}: { params: Promise<{ chapterKey: string }> }) {
    const {chapterKey} = await params;

    return withPolicyPage(Policies.admin.requireSuperAdmin, async () => {
        const t = await getTranslations("Guide");
        const draft = await getGuideDraft();
        const key = decodeURIComponent(chapterKey);

        if (!draft || !draft.draft.chapters.some(chapter => chapter.key === key)) {
            notFound();
        }

        const chapters = navChapters(draft.draft);

        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
                <Link href="/admin/guide/draft" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
                    <ArrowLeft className="size-4"/>
                    {t("admin.draft")}
                </Link>
                <div className="flex flex-col gap-6 lg:flex-row">
                    <GuideChapterNav chapters={chapters} current={key} basePath="/admin/guide/draft"/>
                    <div className="min-w-0 flex-1 space-y-8">
                        <GuideDraftEditor draft={draft.draft} chapterKey={key}/>
                        <GuideChapterPager chapters={chapters} current={key} basePath="/admin/guide/draft"/>
                    </div>
                </div>
            </div>
        );
    });
}
