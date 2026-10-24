import * as React from "react";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {BudgetNav} from "@/components/budget/budget-nav.client";
import {BudgetReadOnlyNotice} from "@/components/budget/budget-read-only-notice";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getBudgetAccess} from "@/lib/budget/budget.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

async function load(id: string) {
    try {
        return await getBudgetAccess(id);
    } catch (error) {
        if (error instanceof GraphQLRequestError && (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")) {
            return null;
        }
        throw error;
    }
}

/**
 * A revival's budget (M5): overview, lines, transactions and scenarios, each its own route. Only those who may read the
 * budget find it (M5-FR-6); everyone else is shown not found, as for a revival they cannot see.
 */
export default async function BudgetLayout({children, params}: {
    children: React.ReactNode;
    params: Promise<{ id: string }>
}) {
    const {id} = await params;

    return withPolicyPage(Policies.app.requireAccess, async ({roles}) => {
        const revival = await load(id);

        if (!revival?.permissions.canReadBudget) {
            notFound();
        }

        const t = await getTranslations("Budget");

        return (
            <div className="flex flex-1 flex-col gap-4">
                <h3 className="sr-only">{t("title")}</h3>
                <BudgetReadOnlyNotice status={revival.status} canWrite={revival.permissions.canWriteBudget}
                                      roles={roles}/>
                <BudgetNav revivalId={revival.id}/>
                {children}
            </div>
        );
    });
}
