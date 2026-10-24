import Link from "next/link";
import {getTranslations} from "next-intl/server";
import {MessagesSquare, PencilLine} from "lucide-react";
import {buttonVariants} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {GuideDiscardDialog} from "@/components/guide/admin/guide-discard-dialog.client";
import {GuidePublishDialog} from "@/components/guide/admin/guide-publish-dialog.client";
import {GuideStartDraftButton} from "@/components/guide/admin/guide-start-draft-button.client";
import {GuideVersionTable} from "@/components/guide/admin/guide-version-table.client";
import {getGuideDraft, getGuideSuggestions, getGuideVersionsAdmin, getRemovedChapters} from "@/lib/guide/guide.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * The guide for super admins: the draft, the suggestions waiting for it, and the published versions (US1, US3, US5).
 */
export default async function AdminGuidePage() {
    return withPolicyPage(Policies.admin.requireSuperAdmin, async () => {
        const t = await getTranslations("Guide");
        const [versions, draft, openSuggestions] = await Promise.all([getGuideVersionsAdmin(), getGuideDraft(), getGuideSuggestions(["OPEN"], null)]);
        const removedChapters = draft ? await getRemovedChapters(draft.draft) : [];
        // Suggestions are made on a published version, so there are none to handle before the first one
        const showSuggestions = versions.length > 0;

        return (
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                <h2 className="text-lg font-bold tracking-tight">{t("admin.title")}</h2>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card className={showSuggestions ? undefined : "md:col-span-2"}>
                        <CardHeader>
                            <CardTitle>{t("admin.draft")}</CardTitle>
                            <CardDescription>
                                {draft ? (
                                    <>
                                        {draft.draft.basedOn
                                            ? t("admin.basedOn", {label: draft.draft.basedOn.label ?? ""})
                                            : t("admin.empty")}
                                        {" · "}
                                        {t("admin.untranslated", {count: draft.untranslatedCount})}
                                    </>
                                ) : (
                                    `${t("admin.noDraft")} ${t("admin.noDraftHint")}`
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto flex flex-wrap gap-2">
                            {draft ? (
                                <>
                                    <Link href="/admin/guide/draft" className={buttonVariants({variant: "outline"})}>
                                        <PencilLine/>
                                        {t("admin.edit")}
                                    </Link>
                                    <GuidePublishDialog draftId={draft.draft.id} version={draft.draft.version}
                                                        removedChapters={removedChapters}/>
                                    <GuideDiscardDialog draftId={draft.draft.id} version={draft.draft.version}
                                                        acceptedSuggestionCount={draft.acceptedSuggestionCount}/>
                                </>
                            ) : (
                                <GuideStartDraftButton/>
                            )}
                        </CardContent>
                    </Card>

                    {showSuggestions && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("suggestions.title")}</CardTitle>
                                <CardDescription>
                                    {`${t("admin.openSuggestions", {count: openSuggestions.length})} ${t("admin.suggestionsHint")}`}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="mt-auto flex flex-wrap gap-2">
                                <Link href="/admin/guide/suggestions" className={buttonVariants({variant: "outline"})}>
                                    <MessagesSquare/>
                                    {t("admin.handleSuggestions")}
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <section className="flex flex-col gap-4">
                    <h3 className="font-semibold tracking-tight">{t("admin.versions")}</h3>
                    <GuideVersionTable versions={versions}/>
                </section>
            </div>
        );
    });
}
