import { getTranslations } from "next-intl/server";
import { ShowRetiredSwitch } from "@/components/show-retired-switch.client";
import { BudgetCategoryEditor } from "@/components/budget/admin/budget-category-editor.client";
import { getBudgetCategories } from "@/lib/budget/reference.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";

/**
 * The budget categories every revival's budget uses, for super admins: income or cost, fixed at creation, and the
 * role a category plays in scenarios. Retired ones only when asked for.
 */
export default async function BudgetCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const retired = (await searchParams).retired === "1";

  return withPolicyPage(Policies.admin.requireSuperAdmin, async () => {
    const t = await getTranslations();
    const categories = await getBudgetCategories(retired);

    return (
      <Page variant="content">
        <PageHeader
          title={t("BudgetCategoryAdmin.title")}
          actions={
            <ShowRetiredSwitch
              shown={retired}
              label={t("Catalog.showRetired")}
            />
          }
        />
        <p className="text-muted-foreground max-w-prose text-sm">{t("BudgetCategoryAdmin.description")}</p>
        <BudgetCategoryEditor entries={categories} />
      </Page>
    );
  });
}
