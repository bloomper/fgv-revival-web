import {getTranslations} from "next-intl/server";
import {Card, CardContent} from "@/components/ui/card";
import {chapterNumbers} from "@/components/guide/chapters";
import {GuideOverview} from "@/components/guide/guide-overview";
import {GuidePdfButton} from "@/components/guide/guide-pdf-button.client";
import {GuideSearch} from "@/components/guide/guide-search.client";
import {GuideVersionSelect} from "@/components/guide/guide-version-select.client";
import {loadGuide} from "@/app/(app)/guide/load.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * The guide's start page: the latest published version, or the one in {@code ?version=} picked in the version
 * selector, with its introduction and chapters (FR-001–FR-003, US2). Each chapter is read on its own page.
 */
export default async function GuidePage({searchParams}: { searchParams: Promise<{ version?: string }> }) {
    const {version} = await searchParams;

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const t = await getTranslations("Guide");
        const {versions, shown, refused} = await loadGuide(version);
        const query = version ? `?version=${encodeURIComponent(version)}` : "";

        if (refused) {
            return (
                <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
                    <h2 className="text-lg font-bold tracking-tight">{t("title")}</h2>
                    <Card><CardContent className="pt-6 text-sm">{t("refused")}</CardContent></Card>
                </div>
            );
        }

        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-bold tracking-tight">
                        {t("title")}{shown?.label ? ` ${shown.label}` : shown?.status === "DRAFT" ? ` (${t("draft")})` : ""}
                    </h2>
                    {versions.length > 1 && shown?.status === "PUBLISHED" && <GuideVersionSelect versions={versions} current={shown.id}/>}
                </div>
                {shown ? (
                    <>
                        <div><GuidePdfButton versionId={shown.id}/></div>
                        <GuideSearch versionId={shown.id} basePath="/guide" query={query} chapterNumbers={chapterNumbers(shown)}/>
                        <GuideOverview version={shown} basePath="/guide" query={query}/>
                    </>
                ) : (
                    <Card><CardContent className="pt-6 text-sm">{t("notPublished")}</CardContent></Card>
                )}
            </div>
        );
    });
}
