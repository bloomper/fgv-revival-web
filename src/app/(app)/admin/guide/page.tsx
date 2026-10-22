import Link from "next/link";
import {getFormatter, getTranslations} from "next-intl/server";
import {MessagesSquare, PencilLine} from "lucide-react";
import {buttonVariants} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {GuideImportDialog} from "@/components/guide/admin/guide-import-dialog.client";
import {GuideImportReport} from "@/components/guide/admin/guide-import-report";
import {GuideDiscardDialog} from "@/components/guide/admin/guide-discard-dialog.client";
import {GuidePublishDialog} from "@/components/guide/admin/guide-publish-dialog.client";
import {GuideStartDraftButton} from "@/components/guide/admin/guide-start-draft-button.client";
import {getGuideDraft, getGuideVersions} from "@/lib/guide/guide.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * The guide for super admins: published versions, the draft and its import report, and importing, publishing and
 * discarding (US1, US3).
 */
export default async function AdminGuidePage() {
    return withPolicyPage(Policies.admin.requireSuperAdmin, async () => {
        const t = await getTranslations("Guide");
        const format = await getFormatter();
        const [versions, draft] = await Promise.all([getGuideVersions(), getGuideDraft()]);
        const canImport = versions.length === 0 && !draft;

        return (
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-bold tracking-tight">{t("admin.title")}</h2>
                    {canImport && <GuideImportDialog/>}
                    {!draft && <GuideStartDraftButton/>}
                    {versions.length > 0 && (
                        <Link href="/admin/guide/suggestions" className={buttonVariants({variant: "outline"})}>
                            <MessagesSquare/>
                            {t("suggestions.title")}
                        </Link>
                    )}
                </div>

                {draft ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("admin.draft")}</CardTitle>
                            <CardDescription>
                                {draft.draft.basedOn
                                    ? t("admin.basedOn", {label: draft.draft.basedOn.label ?? ""})
                                    : draft.importReport ? t("admin.fromImport") : t("admin.empty")}
                                {" · "}
                                {t("admin.untranslated", {count: draft.untranslatedCount})}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                <Link href="/admin/guide/draft" className={buttonVariants({variant: "outline"})}>
                                    <PencilLine/>
                                    {t("admin.edit")}
                                </Link>
                                <GuidePublishDialog draftId={draft.draft.id} version={draft.draft.version}/>
                                <GuideDiscardDialog draftId={draft.draft.id} version={draft.draft.version}
                                                    acceptedSuggestionCount={draft.acceptedSuggestionCount}/>
                            </div>
                            {draft.importReport && <GuideImportReport report={draft.importReport}/>}
                        </CardContent>
                    </Card>
                ) : (
                    !canImport && <p className="text-sm text-muted-foreground">{t("admin.noDraft")}</p>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>{t("admin.versions")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {versions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">{t("notPublished")}</p>
                        ) : (
                            <ul className="divide-y">
                                {versions.map(version => (
                                    <li key={version.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                                        <Link href={`/guide?version=${version.id}`} className="font-medium underline-offset-2 hover:underline">
                                            {version.label}
                                        </Link>
                                        <span className="text-sm text-muted-foreground">
                                            {version.publishedAt ? format.dateTime(new Date(version.publishedAt), {dateStyle: "medium"}) : ""}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    });
}
