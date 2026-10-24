import type {ReactNode} from "react";
import Link from "next/link";
import {useTranslations} from "next-intl";
import {ChevronRight, CircleAlert, CircleCheck, ClipboardCheck, Gavel, Lightbulb, Wallet} from "lucide-react";
import type {RevivalClosingQuery} from "@/gql/graphql";
import {buttonVariants} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {AmountText} from "@/components/budget/budget-labels";
import type {OwnerMember} from "@/components/owner/owner-field.client";
import {SurplusDecisionButton} from "@/components/closing/surplus-decision-button.client";

type Closing = NonNullable<NonNullable<RevivalClosingQuery["revival"]>["closing"]>;

function Check({done, label}: { done: boolean; label: string }) {
    return done
        ?
        <CircleCheck className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-label={label} role="img"/>
        : <CircleAlert className="size-5 shrink-0 text-muted-foreground" aria-label={label} role="img"/>;
}

function SummaryCard({title, icon: Icon, done, children, footer}: {
    title: string;
    icon: typeof Wallet;
    /** Left out where the page cannot tell. */
    done?: boolean;
    children: ReactNode;
    footer?: ReactNode;
}) {
    const t = useTranslations("Closing");

    return (
        <Card role="region" aria-label={title} className="gap-3">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Icon className="size-4 text-muted-foreground"/>
                    <span className="flex-1">{title}</span>
                    {done !== undefined && <Check done={done} label={done ? t("done") : t("notDone")}/>}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 text-sm">{children}</CardContent>
            {footer && <CardFooter>{footer}</CardFooter>}
        </Card>
    );
}

function OpenLink({href, children}: { href: string; children: ReactNode }) {
    return (
        <Link href={href} className={buttonVariants({variant: "outline", size: "sm"})}>
            {children}
            <ChevronRight/>
        </Link>
    );
}

/**
 * Where the revival stands on closing (5.11), as a checklist of cards: the financial result and the loan, the surplus
 * decision in the log, the lessons learned for the guide, and the chapter checklists.
 */
export function ClosingSummary({revivalId, closing, canReadBudget, canWriteLog, members}: {
    revivalId: string;
    closing: Closing;
    canReadBudget: boolean;
    canWriteLog: boolean;
    members: OwnerMember[];
}) {
    const t = useTranslations("Closing");
    const decision = closing.surplusDecision;

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard title={t("finances")} icon={Wallet} done={closing.loanRepaid}
                         footer={canReadBudget &&
                             <OpenLink href={`/revivals/${revivalId}/budget`}>{t("openBudget")}</OpenLink>}>
                <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
                    <dt className="text-muted-foreground">{t("actualResult")}</dt>
                    <dd className="text-right font-medium">{closing.actualResult != null ?
                        <AmountText value={closing.actualResult} signed/> : "–"}</dd>
                    <dt className="text-muted-foreground">{t("loan")}</dt>
                    <dd className="text-right">
                        {closing.loanAmount != null
                            ? <><AmountText
                                value={closing.loanAmount}/>, {closing.loanRepaid ? t("loanRepaid") : t("loanNotRepaid")}</>
                            : t("noLoan")}
                    </dd>
                </dl>
            </SummaryCard>
            <SummaryCard title={t("surplusDecision")} icon={Gavel} done={!!decision}
                         footer={decision
                             ? <OpenLink href={`/revivals/${revivalId}/log?type=DECISION`}>{t("openLog")}</OpenLink>
                             : canWriteLog && <SurplusDecisionButton revivalId={revivalId} members={members}/>}>
                <p>{decision ? t("surplusRecorded", {number: decision.number}) : t("surplusMissing")}</p>
                <CardDescription className="mt-1">{t("surplusHint")}</CardDescription>
            </SummaryCard>
            <SummaryCard title={t("lessons")} icon={Lightbulb} done={closing.suggestions > 0}
                         footer={<OpenLink
                             href={`/revivals/${revivalId}/guide/suggestions`}>{t("openSuggestions")}</OpenLink>}>
                <p>{t("suggestions", {count: closing.suggestions})}</p>
                <CardDescription className="mt-1">{t("lessonsHint")}</CardDescription>
            </SummaryCard>
            <SummaryCard title={t("checklists")} icon={ClipboardCheck}
                         footer={<OpenLink href={`/revivals/${revivalId}/checklists`}>{t("openChecklists")}</OpenLink>}>
                <p>{t("checklistsHint")}</p>
            </SummaryCard>
        </div>
    );
}
