import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {BudgetLineTable} from "@/components/budget/budget-line-table.client";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getBudgetLines} from "@/lib/budget/budget.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

async function load(id: string, includeRemoved: boolean) {
    try {
        return await getBudgetLines(id, includeRemoved);
    } catch (error) {
        if (error instanceof GraphQLRequestError && (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")) {
            return null;
        }
        throw error;
    }
}

/**
 * The budget's lines with the events' proposals (M5-FR-4, FR-9). Removed lines only with {@code ?removed=1}.
 */
export default async function BudgetLinesPage({params, searchParams}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const {id} = await params;
    const showRemoved = (await searchParams).removed === "1";

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const loaded = await load(id, showRemoved);
        const budget = loaded?.revival.budget;

        if (!loaded || !budget) {
            notFound();
        }

        const t = await getTranslations("Budget");
        const {revival, events, decisions, categories} = loaded;

        return (
            <div className="flex flex-col gap-4">
                <h4 className="sr-only">{t("lines")}</h4>
                <BudgetLineTable revivalId={revival.id} lines={budget.lines} proposals={budget.proposals} categories={categories}
                                 events={events} decisions={decisions} canWrite={revival.permissions.canWriteBudget} showRemoved={showRemoved}/>
            </div>
        );
    });
}
