import Link from "next/link";
import {useTranslations} from "next-intl";
import {ChevronRight} from "lucide-react";
import {buttonVariants} from "@/components/ui/button";
import {Card, CardAction, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {AmountText} from "@/components/budget/budget-labels";

/**
 * The budget's position on the revival's overview, for those who may read it: the result budgeted and so far.
 */
export function BudgetSummaryCard({revivalId, totals}: {
    revivalId: string;
    totals: {
        budgetedResult: string;
        actualResult: string;
        budgetedIncome: string;
        budgetedCost: string;
        actualIncome: string;
        actualCost: string
    };
}) {
    const t = useTranslations("Budget");

    return (
        <Card role="region" aria-label={t("title")}>
            <CardHeader>
                <CardTitle>{t("title")}</CardTitle>
                <CardAction>
                    <Link href={`/revivals/${revivalId}/budget`}
                          className={buttonVariants({variant: "outline", size: "sm"})}>
                        {t("open")}
                        <ChevronRight/>
                    </Link>
                </CardAction>
            </CardHeader>
            <CardContent>
                <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 text-sm sm:max-w-md">
                    <dt className="text-muted-foreground">{t("budgetedResult")}</dt>
                    <dd className="text-right font-medium"><AmountText value={totals.budgetedResult} signed/></dd>
                    <dt className="text-muted-foreground">{t("actualResult")}</dt>
                    <dd className="text-right font-medium"><AmountText value={totals.actualResult} signed/></dd>
                    <dt className="text-muted-foreground">{t("actualCostOfBudgeted")}</dt>
                    <dd className="text-right"><AmountText value={totals.actualCost}/> / <AmountText
                        value={totals.budgetedCost}/></dd>
                </dl>
            </CardContent>
        </Card>
    );
}
