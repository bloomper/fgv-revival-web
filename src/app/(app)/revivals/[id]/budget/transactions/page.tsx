import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {TransactionTable} from "@/components/budget/transaction-table.client";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getBudgetTransactions} from "@/lib/budget/budget.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

async function load(id: string, includeCancelled: boolean) {
    try {
        return await getBudgetTransactions(id, includeCancelled);
    } catch (error) {
        if (error instanceof GraphQLRequestError && (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")) {
            return null;
        }
        throw error;
    }
}

/**
 * The budget's transactions with their receipts (M5). Cancelled ones only with {@code ?cancelled=1}.
 */
export default async function BudgetTransactionsPage({params, searchParams}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const {id} = await params;
    const showCancelled = (await searchParams).cancelled === "1";

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const loaded = await load(id, showCancelled);
        const budget = loaded?.revival.budget;

        if (!loaded || !budget) {
            notFound();
        }

        const t = await getTranslations("Budget");
        const {revival, categories} = loaded;

        return (
            <div className="flex flex-col gap-4">
                <h4 className="sr-only">{t("transactions")}</h4>
                <TransactionTable revivalId={revival.id} transactions={budget.transactions} categories={categories}
                                  lines={budget.lines}
                                  members={revival.ownerCandidates} canWrite={revival.permissions.canWriteBudget}
                                  showCancelled={showCancelled}/>
            </div>
        );
    });
}
