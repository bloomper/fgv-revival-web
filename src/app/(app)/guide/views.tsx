import * as React from "react";
import Link from "next/link";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {ArrowLeft} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import {chapterNumbers, navChapters} from "@/components/guide/chapters";
import {GuideChapterNav} from "@/components/guide/guide-chapter-nav.client";
import {GuideChapterPager} from "@/components/guide/guide-chapter-pager";
import {GuideOverview} from "@/components/guide/guide-overview";
import {GuidePdfButton} from "@/components/guide/guide-pdf-button.client";
import {GuideSearch} from "@/components/guide/guide-search.client";
import {GuideVersionSelect} from "@/components/guide/guide-version-select.client";
import {GuideChapterView} from "@/components/guide/guide-view.client";
import {loadGuide} from "@/app/(app)/guide/load.server";

/**
 * The guide's pages for the latest published version ({@code /guide}) or a chosen one ({@code /guide/versions/<id>}),
 * which differ only in where they are.
 */
function basePathOf(version: string | undefined) {
    return version ? `/guide/versions/${encodeURIComponent(version)}` : "/guide";
}

async function Refused() {
    const t = await getTranslations("Guide");

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
            <h2 className="text-lg font-bold tracking-tight">{t("title")}</h2>
            <Card><CardContent className="pt-6 text-sm">{t("refused")}</CardContent></Card>
        </div>
    );
}

async function title(shown: { label?: string | null; status: string }) {
    const t = await getTranslations("Guide");

    return `${t("title")}${shown.label ? ` ${shown.label}` : shown.status === "DRAFT" ? ` (${t("draft")})` : ""}`;
}

/**
 * The start page: the version's introduction and chapters (FR-001–FR-003, US2). Each chapter is read on its own page.
 */
export async function GuideStart({version}: { version?: string }) {
    const t = await getTranslations("Guide");
    const {versions, shown, refused} = await loadGuide(version);
    const basePath = basePathOf(version);

    if (refused) {
        return <Refused/>;
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-bold tracking-tight">{shown ? await title(shown) : t("title")}</h2>
                {versions.length > 1 && shown?.status === "PUBLISHED" && <GuideVersionSelect versions={versions} current={shown.id}/>}
            </div>
            {shown ? (
                <>
                    <div><GuidePdfButton versionId={shown.id}/></div>
                    <GuideSearch versionId={shown.id} basePath={basePath} chapterNumbers={chapterNumbers(shown)}/>
                    <GuideOverview version={shown} basePath={basePath}/>
                </>
            ) : (
                <Card><CardContent className="pt-6 text-sm">{t("notPublished")}</CardContent></Card>
            )}
        </div>
    );
}

/**
 * Around a version's chapters: the heading, the search and the chapter list, which stay while moving between chapters.
 */
export async function GuideChapters({version, children}: { version?: string; children: React.ReactNode }) {
    const t = await getTranslations("Guide");
    const {shown, refused} = await loadGuide(version);
    const basePath = basePathOf(version);

    if (refused) {
        return <Refused/>;
    }
    if (!shown) {
        notFound();
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-bold tracking-tight">{await title(shown)}</h2>
                <Link href={basePath} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
                    <ArrowLeft className="size-4"/>
                    {t("startPage")}
                </Link>
            </div>
            <GuideSearch versionId={shown.id} basePath={basePath} chapterNumbers={chapterNumbers(shown)}/>
            <div className="flex flex-col gap-6 lg:flex-row">
                <GuideChapterNav chapters={navChapters(shown)} basePath={basePath}/>
                <div className="min-w-0 flex-1 space-y-8">{children}</div>
            </div>
        </div>
    );
}

/**
 * One chapter of the version, and the way to the previous and next.
 */
export async function GuideChapter({version, chapterKey}: { version?: string; chapterKey: string }) {
    const {shown, refused} = await loadGuide(version);
    const key = decodeURIComponent(chapterKey);
    const index = shown?.chapters.findIndex(chapter => chapter.key === key) ?? -1;

    // The layout says why instead.
    if (refused) {
        return null;
    }
    if (!shown || index < 0) {
        notFound();
    }

    return (
        <>
            <GuideChapterView chapter={shown.chapters[index]} number={index + 1}/>
            <GuideChapterPager chapters={navChapters(shown)} current={key} basePath={basePathOf(version)}/>
        </>
    );
}
