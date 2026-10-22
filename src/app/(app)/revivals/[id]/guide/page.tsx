import Link from "next/link";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {MessagesSquare} from "lucide-react";
import {buttonVariants} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {GuidePdfButton} from "@/components/guide/guide-pdf-button.client";
import {chapterNumbers} from "@/components/guide/chapters";
import {GuideOverview} from "@/components/guide/guide-overview";
import {GuideSearch} from "@/components/guide/guide-search.client";
import {GuideVersionBanner} from "@/components/guide/guide-version-banner";
import {GuideVersionChangeDialog} from "@/components/guide/guide-version-change-dialog.client";
import {loadRevivalGuide} from "@/app/(app)/revivals/[id]/guide/load.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * A revival's guide: the start page of the version it is pinned to (FR-019), with the version controls. Each chapter
 * is read on its own page. A revival the user cannot see is not found (M1 FR-017).
 */
export default async function RevivalGuidePage({params}: { params: Promise<{ id: string }> }) {
    const {id} = await params;

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const loaded = await loadRevivalGuide(id);

        if (!loaded) {
            notFound();
        }

        const t = await getTranslations("Guide");
        const {revival, version} = loaded;

        return (
            <div className="flex flex-1 flex-col gap-4">
                <h3 className="sr-only">
                    {t("title")}{revival.guideVersion?.label ? ` ${revival.guideVersion.label}` : ""}
                </h3>
                <div className="flex flex-wrap gap-2">
                    {version && <GuidePdfButton revivalId={revival.id}/>}
                    <Link href={`/revivals/${revival.id}/guide/suggestions`} className={buttonVariants({variant: "outline"})}>
                        <MessagesSquare/>
                        {t("suggestions.title")}
                    </Link>
                    <GuideVersionChangeDialog revivalId={revival.id} current={revival.guideVersion ?? null}
                                              allowed={revival.permissions.guideVersionsAllowed}/>
                </div>
                {revival.guideVersion && revival.newerGuideVersion && (
                    <GuideVersionBanner current={revival.guideVersion} newer={revival.newerGuideVersion}/>
                )}
                {version ? (
                    <>
                        <GuideSearch versionId={version.id} basePath={`/revivals/${revival.id}/guide`} chapterNumbers={chapterNumbers(version)}/>
                        <GuideOverview version={version} basePath={`/revivals/${revival.id}/guide`}/>
                    </>
                ) : (
                    <Card><CardContent className="pt-6 text-sm">{t("notPublished")}</CardContent></Card>
                )}
                {revival.guideVersionHistory.length > 0 && (
                    <section className="space-y-2" aria-label={t("version.history")}>
                        <h3 className="font-medium">{t("version.history")}</h3>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                            {revival.guideVersionHistory.map((change, index) => (
                                <li key={index}>
                                    {t("version.historyEntry", {
                                        from: change.fromLabel ?? "–", to: change.toLabel, name: change.changedBy ?? "", at: change.changedAt.slice(0, 10),
                                    })}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        );
    });
}
