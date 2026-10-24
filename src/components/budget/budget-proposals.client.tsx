"use client";

import {useLocale, useTranslations} from "next-intl";
import {Plus} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardAction, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import type {LocalizedTextValue} from "@/components/guide/localized";
import {pickText} from "@/components/guide/localized";
import {AmountText} from "@/components/budget/budget-labels";
import {formatDate} from "@/utils/format";

export type BudgetLineProposal = {
    event: { id: string; title: string; startDate: string };
    line: {
        id: string;
        category: { id: string };
        description: LocalizedTextValue;
        quantityRule: "FIXED" | "PER_PARTICIPANT";
        quantity?: number | null;
        unitAmount: string;
    };
    quantity?: number | null;
    amount?: string | null;
};

/**
 * The lines the revival's events' types propose and that have not been added for that event (M5-FR-9), one compact
 * card each. Adding one opens the line dialog filled in from it.
 */
export function BudgetProposals({proposals, onAdd}: {
    proposals: BudgetLineProposal[];
    onAdd: (proposal: BudgetLineProposal) => void
}) {
    const t = useTranslations("Budget");
    const locale = useLocale();

    if (proposals.length === 0) {
        return null;
    }

    return (
        <section aria-labelledby="budget-proposals" className="space-y-2">
            <h4 id="budget-proposals" className="text-sm font-medium">{t("proposals")}</h4>
            <p className="text-sm text-muted-foreground">{t("proposalsDescription")}</p>
            <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {proposals.map(proposal => {
                    const description = pickText(proposal.line.description, locale).text;
                    const name = `${description} (${proposal.event.title})`;

                    return (
                        <li key={`${proposal.event.id}-${proposal.line.id}`}>
                            <Card className="h-full gap-2 py-4">
                                <CardHeader>
                                    <CardTitle>{description}</CardTitle>
                                    <CardDescription className="space-y-0.5">
                                        <span
                                            className="block">{formatDate(proposal.event.startDate)} {proposal.event.title}</span>
                                        <span className="block text-xs">
                                            {proposal.amount
                                                ? <AmountText value={proposal.amount}/>
                                                : proposal.line.quantityRule === "PER_PARTICIPANT" ? t("perParticipantUnset") : null}
                                        </span>
                                    </CardDescription>
                                    <CardAction>
                                        <Button size="sm" variant="outline" aria-label={t("addProposal", {name})}
                                                onClick={() => onAdd(proposal)}>
                                            <Plus/>{t("add")}
                                        </Button>
                                    </CardAction>
                                </CardHeader>
                            </Card>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
