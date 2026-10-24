import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {BudgetCategoryTable} from "@/components/budget/budget-category-table.client";
import {BudgetExportButton} from "@/components/budget/budget-export-button.client";
import {BudgetSettingsCard} from "@/components/budget/budget-settings-card.client";
import {BudgetTotals} from "@/components/budget/budget-totals";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getBudgetOverview} from "@/lib/budget/budget.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

async function load(id: string) {
    try {
        return await getBudgetOverview(id);
    } catch (error) {
        if (error instanceof GraphQLRequestError && (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")) {
            return null;
        }
        throw error;
    }
}

/**
 * The budget's overview (M5-FR-7, FR-8): the totals, the categories with earlier revivals' figures, the settings and
 * the Excel export.
 */
export default async function BudgetOverviewPage({params}: { params: Promise<{ id: string }> }) {
    const {id} = await params;

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const revival = await load(id);

        if (!revival?.budget) {
            notFound();
        }

        const t = await getTranslations("Budget");
        const {budget} = revival;

        return (
            <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-base font-semibold">{t("overview")}</h4>
                    <BudgetExportButton revivalId={revival.id}/>
                </div>
                <BudgetTotals totals={budget.totals}/>
                <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                    <section aria-labelledby="budget-categories" className="space-y-2">
                        <h4 id="budget-categories" className="text-sm font-medium">{t("categories")}</h4>
                        <p className="text-sm text-muted-foreground">{t("categoriesHint")}</p>
                        <BudgetCategoryTable categories={budget.categories}/>
                    </section>
                    <div>
                        <BudgetSettingsCard revivalId={revival.id} settings={budget.settings} canWrite={revival.permissions.canWriteBudget}/>
                    </div>
                </div>
            </div>
        );
    });
}
