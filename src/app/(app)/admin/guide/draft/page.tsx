import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { GuideDraftChapters } from "@/components/guide/admin/guide-draft-chapters.client";
import { GuideDraftIntroduction } from "@/components/guide/admin/guide-draft-editor.client";
import { GuideDiscardDialog } from "@/components/guide/admin/guide-discard-dialog.client";
import { GuidePublishDialog } from "@/components/guide/admin/guide-publish-dialog.client";
import { GuidePdfButton } from "@/components/guide/guide-pdf-button.client";
import { getGuideDraft, getRemovedChapters } from "@/lib/guide/guide.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";

/**
 * Editing the draft: its introduction and its chapters, each opened on its own page. Super admins only.
 * Without a draft (discarded, published, or the URL typed by hand) it sends you to the guide admin page, which explains
 * drafts and offers to start one.
 */
export default async function GuideDraftPage() {
  return withPolicyPage(Policies.admin.requireSuperAdmin, async () => {
    const t = await getTranslations("Guide");
    const draft = await getGuideDraft();
    if (!draft) {
      redirect("/admin/guide");
    }
    const removedChapters = await getRemovedChapters(draft.draft);

    return (
      <Page>
        <Link
          href="/admin/guide"
          className="text-muted-foreground hover:text-link inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" />
          {t("admin.title")}
        </Link>
        <PageHeader
          title={t("admin.draft")}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground text-sm">
                {t("admin.untranslated", { count: draft.untranslatedCount })}
              </span>
              <GuidePdfButton versionId={draft.draft.id} />
              <GuidePublishDialog
                draftId={draft.draft.id}
                version={draft.draft.version}
                removedChapters={removedChapters}
              />
              <GuideDiscardDialog
                draftId={draft.draft.id}
                version={draft.draft.version}
                acceptedSuggestionCount={draft.acceptedSuggestionCount}
              />
            </div>
          }
        />
        <GuideDraftIntroduction draft={draft.draft} />
        <GuideDraftChapters draft={draft.draft} />
      </Page>
    );
  });
}
