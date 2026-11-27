import { getTranslations } from "next-intl/server";
import { ReferenceRevivalEditor } from "@/components/budget/admin/reference-revival-editor.client";
import { getBudgetCategories, getReferenceRevivals } from "@/lib/budget/reference.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";

/**
 * Earlier revivals' budgets and outcomes, kept as reference by the super admin: every revival's budget shows
 * them beside its categories. Revivals that were deleted are added here automatically.
 */
export default async function ReferenceFiguresPage() {
  return withPolicyPage(Policies.admin.requireSuperAdmin, async () => {
    const t = await getTranslations("ReferenceAdmin");
    const [references, categories] = await Promise.all([getReferenceRevivals(), getBudgetCategories(true)]);

    return (
      <Page variant="content">
        <PageHeader
          title={t("title")}
          description={t("description")}
        />
        <ReferenceRevivalEditor
          references={references}
          categories={categories}
        />
      </Page>
    );
  });
}
