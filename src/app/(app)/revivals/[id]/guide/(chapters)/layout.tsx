import * as React from "react";
import Link from "next/link";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {ArrowLeft} from "lucide-react";
import {chapterNumbers, navChapters} from "@/components/guide/chapters";
import {GuideChapterNav} from "@/components/guide/guide-chapter-nav.client";
import {GuideSearch} from "@/components/guide/guide-search.client";
import {loadRevivalGuide} from "@/app/(app)/revivals/[id]/guide/load.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * The chapters of the version a revival is pinned to, with the chapter list that stays while moving between them.
 */
export default async function RevivalGuideChaptersLayout({children, params}: {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}) {
    const {id} = await params;

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const loaded = await loadRevivalGuide(id);

        if (!loaded?.version) {
            notFound();
        }

        const t = await getTranslations("Guide");
        const {revival, version} = loaded;
        const basePath = `/revivals/${revival.id}/guide`;

        return (
            <div className="flex flex-1 flex-col gap-4">
                <h3 className="sr-only">
                    {t("title")}{revival.guideVersion?.label ? ` ${revival.guideVersion.label}` : ""}
                </h3>
                <Link href={basePath} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
                    <ArrowLeft className="size-4"/>
                    {t("tab.back")}
                </Link>
                <GuideSearch versionId={version.id} basePath={basePath} chapterNumbers={chapterNumbers(version)}/>
                <div className="flex flex-col gap-6 lg:flex-row">
                    <GuideChapterNav chapters={navChapters(version)} basePath={basePath}/>
                    <div className="min-w-0 flex-1 space-y-8">{children}</div>
                </div>
            </div>
        );
    });
}
