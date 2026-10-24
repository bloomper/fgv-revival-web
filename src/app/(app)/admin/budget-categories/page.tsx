import {getTranslations} from "next-intl/server";
import {ShowRetiredSwitch} from "@/components/show-retired-switch.client";
import {BudgetCategoryEditor} from "@/components/budget/admin/budget-category-editor.client";
import {getBudgetCategories} from "@/lib/budget/reference.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * The budget categories every revival's budget uses, for super admins (M5): income or cost, fixed at creation, and the
 * role a category plays in scenarios. Retired ones only when asked for.
 */
export default async function BudgetCategoriesPage({searchParams}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
    const retired = (await searchParams).retired === "1";

    return withPolicyPage(Policies.admin.requireSuperAdmin, async () => {
        const t = await getTranslations();
        const categories = await getBudgetCategories(retired);

        return (
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-bold tracking-tight">{t("BudgetCategoryAdmin.title")}</h2>
                    <ShowRetiredSwitch shown={retired} label={t("Catalog.showRetired")}/>
                </div>
                <p className="max-w-prose text-sm text-muted-foreground">{t("BudgetCategoryAdmin.description")}</p>
                <BudgetCategoryEditor entries={categories}/>
            </div>
        );
    });
}
