"use client";

import {useLocale, useTranslations} from "next-intl";
import {Plus} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardAction, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {catalogName} from "@/components/catalog/catalog";
import type {LocalizedTextValue} from "@/components/guide/localized";
import {formatEventDates} from "@/components/event/timeline";
import {formatDate} from "@/utils/format";

export type EventProposal = {
    type: { id: string; name: LocalizedTextValue };
    startDate: string;
    endDate: string;
    earliest: string;
    latest: string;
};

/**
 * The events the guide's example timeline proposes from the premiere that the revival has not added yet, one
 * compact card each. Adding one opens the event dialog with its type and dates.
 */
export function EventProposals({proposals, onAdd}: {
    proposals: EventProposal[];
    onAdd: (proposal: EventProposal) => void
}) {
    const t = useTranslations("Event");
    const locale = useLocale();

    if (proposals.length === 0) {
        return null;
    }

    return (
        <section aria-labelledby="event-proposals" className="space-y-2">
            <h4 id="event-proposals" className="text-sm font-medium">{t("proposals")}</h4>
            <p className="text-sm text-muted-foreground">{t("proposalsDescription")}</p>
            <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {proposals.map(proposal => {
                    const name = catalogName(proposal.type, locale);

                    return (
                        <li key={proposal.type.id}>
                            <Card className="h-full gap-2 py-4">
                                <CardHeader>
                                    <CardTitle>{name}</CardTitle>
                                    <CardDescription className="space-y-0.5">
                                        <span className="block tabular-nums">{formatEventDates(proposal)}</span>
                                        <span className="block text-xs">
                                            {t("allowedRange", {
                                                earliest: formatDate(proposal.earliest) ?? "",
                                                latest: formatDate(proposal.latest) ?? ""
                                            })}
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
