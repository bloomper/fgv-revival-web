import Link from "next/link";
import {getTranslations} from "next-intl/server";
import {ArrowLeft} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import {GuideDraftEditor} from "@/components/guide/admin/guide-draft-editor.client";
import {GuideDiscardDialog} from "@/components/guide/admin/guide-discard-dialog.client";
import {GuidePublishDialog} from "@/components/guide/admin/guide-publish-dialog.client";
import {GuidePdfButton} from "@/components/guide/guide-pdf-button.client";
import {getGuideDraft} from "@/lib/guide/guide.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * Editing the draft (US3, FR-013). Super admins only.
 */
export default async function GuideDraftPage() {
    return withPolicyPage(Policies.admin.requireSuperAdmin, async () => {
        const t = await getTranslations("Guide");
        const draft = await getGuideDraft();

        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
                <Link href="/admin/guide" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
                    <ArrowLeft className="size-4"/>
                    {t("admin.title")}
                </Link>
                {draft ? (
                    <>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h2 className="text-2xl font-bold tracking-tight">{t("admin.draft")}</h2>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm text-muted-foreground">{t("admin.untranslated", {count: draft.untranslatedCount})}</span>
                                <GuidePdfButton versionId={draft.draft.id}/>
                                <GuidePublishDialog draftId={draft.draft.id} version={draft.draft.version}/>
                                <GuideDiscardDialog draftId={draft.draft.id} version={draft.draft.version}
                                                    acceptedSuggestionCount={draft.acceptedSuggestionCount}/>
                            </div>
                        </div>
                        <GuideDraftEditor draft={draft.draft}/>
                    </>
                ) : (
                    <Card><CardContent className="pt-6 text-sm">{t("admin.noDraft")}</CardContent></Card>
                )}
            </div>
        );
    });
}
