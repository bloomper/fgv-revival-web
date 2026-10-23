import Link from "next/link";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {BookOpen, MessageSquarePlus, MessagesSquare} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button, buttonVariants} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {CatalogProvider} from "@/components/catalog/catalog-provider.client";
import {GuidePdfButton} from "@/components/guide/guide-pdf-button.client";
import {GuideVersionBanner} from "@/components/guide/guide-version-banner";
import {GuideVersionChangeDialog} from "@/components/guide/guide-version-change-dialog.client";
import {SuggestionDialog} from "@/components/guide/suggestion/suggestion-dialog.client";
import {ReadOnlyNotice} from "@/components/revival/read-only-notice";
import {loadRevivalGuide} from "@/app/(app)/revivals/[id]/guide/load.server";
import {getGuideItemTypes} from "@/lib/catalog/catalog.server";
import {getGuideSuggestions} from "@/lib/guide/guide.server";
import {formatInstant} from "@/utils/format";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

const SUGGESTION_STATUSES = ["OPEN", "ACCEPTED", "REJECTED", "WITHDRAWN"] as const;

/**
 * A revival's guide tab: the version it follows with the way to change it and see what changed (FR-019, FR-020), a
 * way into the guide itself, read one chapter per page under this revival, and its suggestions (FR-031, FR-035). A
 * revival the user cannot see is not found (M1 FR-017).
 */
export default async function RevivalGuidePage({params}: { params: Promise<{ id: string }> }) {
    const {id} = await params;

    return withPolicyPage(Policies.app.requireAccess, async ({roles}) => {
        const loaded = await loadRevivalGuide(id);

        if (!loaded) {
            notFound();
        }

        const t = await getTranslations("Guide");
        const {revival, version} = loaded;
        const canSuggest = revival.permissions.canSuggestGuideChange;
        const [suggestions, itemTypes] = await Promise.all([
            getGuideSuggestions(null, revival.id),
            canSuggest && version ? getGuideItemTypes() : [],
        ]);
        const counts = SUGGESTION_STATUSES.map(status => ({status, count: suggestions.filter(suggestion => suggestion.status === status).length}))
            .filter(entry => entry.count > 0);
        const chapters = version?.chapters.map(chapter => ({key: chapter.key, title: chapter.title})) ?? [];
        const basePath = `/revivals/${revival.id}/guide`;

        return (
            <div className="flex flex-1 flex-col gap-4">
                <h3 className="sr-only">{t("title")}</h3>
                <ReadOnlyNotice revivalId={revival.id} status={revival.status} canWrite={canSuggest} roles={roles}/>
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("tab.versionTitle")}</CardTitle>
                            <CardDescription>
                                {revival.guideVersion
                                    ? t("tab.follows", {label: revival.guideVersion.label ?? "", at: formatInstant(revival.guideVersion.publishedAt)?.slice(0, 10) ?? "–"})
                                    : t("notPublished")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {revival.guideVersion && revival.newerGuideVersion && (
                                <GuideVersionBanner current={revival.guideVersion} newer={revival.newerGuideVersion}/>
                            )}
                            {revival.guideVersionHistory.length > 0 && (
                                <section className="space-y-2" aria-label={t("version.history")}>
                                    <h4 className="text-sm font-medium">{t("version.history")}</h4>
                                    <ul className="space-y-1 text-sm text-muted-foreground">
                                        {revival.guideVersionHistory.map((change, index) => (
                                            <li key={index}>
                                                {t("version.historyEntry", {
                                                    from: change.fromLabel ?? "–", to: change.toLabel, name: change.changedBy ?? "",
                                                    at: formatInstant(change.changedAt)?.slice(0, 10) ?? "",
                                                })}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}
                        </CardContent>
                        {revival.permissions.guideVersionsAllowed.length > 0 && (
                            <CardFooter>
                                <GuideVersionChangeDialog revivalId={revival.id} current={revival.guideVersion ?? null}
                                                          allowed={revival.permissions.guideVersionsAllowed}/>
                            </CardFooter>
                        )}
                    </Card>

                    {version && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("tab.readTitle")}</CardTitle>
                                <CardDescription>{t("tab.readDescription", {count: chapters.length})}</CardDescription>
                            </CardHeader>
                            <CardFooter className="flex flex-wrap gap-2">
                                {chapters[0] && (
                                    <Link href={`${basePath}/${encodeURIComponent(chapters[0].key)}`} className={buttonVariants()}>
                                        <BookOpen/>
                                        {t("tab.open")}
                                    </Link>
                                )}
                                <GuidePdfButton revivalId={revival.id}/>
                            </CardFooter>
                        </Card>
                    )}

                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>{t("suggestions.title")}</CardTitle>
                            <CardDescription>{canSuggest ? t("tab.suggestDescription") : t("tab.suggestionsDescription")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {counts.length === 0 ? (
                                <p className="text-sm text-muted-foreground">{t("suggestions.none")}</p>
                            ) : (
                                <ul className="flex flex-wrap gap-2" aria-label={t("suggestions.title")}>
                                    {counts.map(({status, count}) => (
                                        <li key={status}>
                                            <Badge variant={status === "OPEN" ? "default" : "secondary"}>{t(`suggestions.status.${status}`)}: {count}</Badge>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-wrap gap-2">
                            {canSuggest && version && (
                                <CatalogProvider itemTypes={itemTypes}>
                                    <SuggestionDialog trigger={<Button/>} revivalId={revival.id} versionId={version.id} kind="ADD" chapters={chapters}>
                                        <MessageSquarePlus/>
                                        {t("suggest.add")}
                                    </SuggestionDialog>
                                </CatalogProvider>
                            )}
                            <Link href={`${basePath}/suggestions`} className={buttonVariants({variant: "outline"})}>
                                <MessagesSquare/>
                                {t("tab.allSuggestions")}
                            </Link>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        );
    });
}
