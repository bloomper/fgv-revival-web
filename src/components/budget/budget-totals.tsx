import {useTranslations} from "next-intl";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {AmountText} from "@/components/budget/budget-labels";

export type BudgetTotalsValue = {
    budgetedIncome: string;
    budgetedCost: string;
    budgetedResult: string;
    actualIncome: string;
    actualCost: string;
    actualResult: string;
    unreimbursed: string;
    unreimbursedCount: number;
    missingReceipts: number;
};

function Row({label, budgeted, actual}: { label: string; budgeted: string; actual: string }) {
    return (
        <>
            <span className="text-muted-foreground">{label}</span>
            <AmountText value={budgeted} className="text-right"/>
            <AmountText value={actual} className="text-right"/>
        </>
    );
}

/**
 * The budget's position (M5-FR-7): the result budgeted and so far, income and costs, what people are owed and how many
 * transactions lack a receipt. The loan is neither income nor cost.
 */
export function BudgetTotals({totals}: { totals: BudgetTotalsValue }) {
    const t = useTranslations("Budget");

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card role="region" className="gap-2" aria-label={t("result")}>
                <CardHeader>
                    <CardDescription>{t("result")}</CardDescription>
                    <CardTitle className="text-2xl"><AmountText value={totals.budgetedResult} signed/></CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    {t("actualSoFar")} <AmountText value={totals.actualResult} signed
                                                   className="font-medium text-foreground"/>
                </CardContent>
            </Card>
            <Card role="region" className="gap-2" aria-label={t("incomeAndCost")}>
                <CardHeader>
                    <CardDescription>{t("incomeAndCost")}</CardDescription>
                </CardHeader>
                {/* One grid for the header and both rows, so the amount columns share their widths. */}
                <CardContent className="grid grid-cols-[1fr_auto_auto] items-baseline gap-x-4 gap-y-1 text-sm">
                    <span/>
                    <span className="text-right text-xs text-muted-foreground">{t("budgeted")}</span>
                    <span className="text-right text-xs text-muted-foreground">{t("actual")}</span>
                    <Row label={t("kinds.INCOME")} budgeted={totals.budgetedIncome} actual={totals.actualIncome}/>
                    <Row label={t("kinds.COST")} budgeted={totals.budgetedCost} actual={totals.actualCost}/>
                </CardContent>
            </Card>
            <Card role="region" className="gap-2" aria-label={t("unreimbursed")}>
                <CardHeader>
                    <CardDescription>{t("unreimbursed")}</CardDescription>
                    <CardTitle className="text-2xl"><AmountText value={totals.unreimbursed}/></CardTitle>
                </CardHeader>
                <CardContent
                    className="text-sm text-muted-foreground">{t("unreimbursedCount", {count: totals.unreimbursedCount})}</CardContent>
            </Card>
            <Card role="region" className="gap-2" aria-label={t("missingReceipts")}>
                <CardHeader>
                    <CardDescription>{t("missingReceipts")}</CardDescription>
                    <CardTitle
                        className={totals.missingReceipts > 0 ? "text-2xl text-destructive" : "text-2xl"}>{totals.missingReceipts}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{t("missingReceiptsHint")}</CardContent>
            </Card>
        </div>
    );
}
