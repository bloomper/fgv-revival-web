import Link from "next/link";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {ArrowLeft, MessagesSquare} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {GuidePdfButton} from "@/components/guide/guide-pdf-button.client";
import {GuideSearch} from "@/components/guide/guide-search.client";
import {RevivalGuideView} from "@/components/guide/suggestion/revival-guide-view.client";
import {GuideVersionBanner} from "@/components/guide/guide-version-banner";
import {GuideVersionChangeDialog} from "@/components/guide/guide-version-change-dialog.client";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getRevivalGuide} from "@/lib/guide/guide.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

async function load(id: string) {
    try {
        return await getRevivalGuide(id);
    } catch (error) {
        if (error instanceof GraphQLRequestError && (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")) {
            return null;
        }
        throw error;
    }
}

/**
 * A revival's guide: the version it is pinned to (FR-019). A revival the user cannot see is not found (M1 FR-017).
 */
export default async function RevivalGuidePage({params}: { params: Promise<{ id: string }> }) {
    const {id} = await params;

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const loaded = await load(id);

        if (!loaded) {
            notFound();
        }

        const t = await getTranslations("Guide");
        const {revival, version} = loaded;

        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
                <div className="space-y-1">
                    <Link href={`/revivals/${revival.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
                        <ArrowLeft className="size-4"/>
                        {revival.workingTitle}
                    </Link>
                    <h2 className="text-2xl font-bold tracking-tight">
                        {t("title")}{revival.guideVersion?.label ? ` ${revival.guideVersion.label}` : ""}
                    </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                    {version && <GuidePdfButton revivalId={revival.id}/>}
                    <Button variant="outline" render={<Link href={`/revivals/${revival.id}/guide/suggestions`}/>}>
                        <MessagesSquare/>
                        {t("suggestions.title")}
                    </Button>
                    <GuideVersionChangeDialog revivalId={revival.id} current={revival.guideVersion ?? null}
                                              allowed={revival.permissions.guideVersionsAllowed}/>
                </div>
                {revival.guideVersion && revival.newerGuideVersion && (
                    <GuideVersionBanner current={revival.guideVersion} newer={revival.newerGuideVersion}/>
                )}
                {version ? (
                    <>
                        <GuideSearch versionId={version.id}/>
                        <RevivalGuideView version={version} revivalId={revival.id} canSuggest={revival.permissions.canSuggestGuideChange}/>
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
                                        from: change.from?.label ?? "–", to: change.to.label ?? "", name: change.changedBy ?? "", at: change.changedAt.slice(0, 10),
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
