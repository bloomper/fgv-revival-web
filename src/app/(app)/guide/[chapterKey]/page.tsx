import Link from "next/link";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {ArrowLeft} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import {chapterNumbers, navChapters} from "@/components/guide/chapters";
import {GuideChapterNav} from "@/components/guide/guide-chapter-nav.client";
import {GuideChapterPager} from "@/components/guide/guide-chapter-pager";
import {GuideSearch} from "@/components/guide/guide-search.client";
import {GuideChapterView} from "@/components/guide/guide-view.client";
import {loadGuide} from "@/app/(app)/guide/load.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * One chapter of the guide, in the latest published version or the one in {@code ?version=}.
 */
export default async function GuideChapterPage({params, searchParams}: {
    params: Promise<{ chapterKey: string }>;
    searchParams: Promise<{ version?: string }>;
}) {
    const [{chapterKey}, {version}] = await Promise.all([params, searchParams]);

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const t = await getTranslations("Guide");
        const {shown, refused} = await loadGuide(version);
        const key = decodeURIComponent(chapterKey);
        const index = shown?.chapters.findIndex(chapter => chapter.key === key) ?? -1;
        const query = version ? `?version=${encodeURIComponent(version)}` : "";

        if (refused) {
            return (
                <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
                    <h2 className="text-lg font-bold tracking-tight">{t("title")}</h2>
                    <Card><CardContent className="pt-6 text-sm">{t("refused")}</CardContent></Card>
                </div>
            );
        }
        if (!shown || index < 0) {
            notFound();
        }

        const chapters = navChapters(shown);

        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="text-lg font-bold tracking-tight">
                        {t("title")}{shown.label ? ` ${shown.label}` : shown.status === "DRAFT" ? ` (${t("draft")})` : ""}
                    </h2>
                    <Link href={`/guide${query}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
                        <ArrowLeft className="size-4"/>
                        {t("startPage")}
                    </Link>
                </div>
                <GuideSearch versionId={shown.id} basePath="/guide" query={query} chapterNumbers={chapterNumbers(shown)}/>
                <div className="flex flex-col gap-6 lg:flex-row">
                    <GuideChapterNav chapters={chapters} current={key} basePath="/guide" query={query}/>
                    <div className="min-w-0 flex-1 space-y-8">
                        <GuideChapterView chapter={shown.chapters[index]} number={index + 1}/>
                        <GuideChapterPager chapters={chapters} current={key} basePath="/guide" query={query}/>
                    </div>
                </div>
            </div>
        );
    });
}
