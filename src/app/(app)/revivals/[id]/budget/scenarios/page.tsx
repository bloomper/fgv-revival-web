import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {ScenarioPanel} from "@/components/budget/scenario-panel.client";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getBudgetScenarios} from "@/lib/budget/budget.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

async function load(id: string) {
    try {
        return await getBudgetScenarios(id);
    } catch (error) {
        if (error instanceof GraphQLRequestError && (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")) {
            return null;
        }
        throw error;
    }
}

/**
 * What-if over the budget: the calculator and the saved scenarios.
 */
export default async function BudgetScenariosPage({params}: { params: Promise<{ id: string }> }) {
    const {id} = await params;

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const loaded = await load(id);
        const budget = loaded?.revival.budget;

        if (!loaded || !budget || !loaded.current) {
            notFound();
        }

        const t = await getTranslations("Budget");

        return (
            <div className="flex flex-col gap-4">
                <h4 className="sr-only">{t("scenarios")}</h4>
                <ScenarioPanel revivalId={loaded.revival.id} current={loaded.current} scenarios={budget.scenarios}
                               canWrite={loaded.revival.permissions.canWriteBudget}/>
            </div>
        );
    });
}
