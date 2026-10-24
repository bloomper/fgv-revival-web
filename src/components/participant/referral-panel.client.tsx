"use client";

import {useTransition} from "react";
import {useTranslations} from "next-intl";
import {UserPlus, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {PlainText} from "@/components/plain-text";
import {handleReferralAction} from "@/app/(app)/revivals/[id]/participants/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {formatInstant} from "@/utils/format";

export type ReferralValue = {
    id: string;
    name: string;
    contact?: string | null;
    comment?: string | null;
    referredBy?: string | null;
    createdAt: string;
};

/**
 * People the participants think the steering group is missing. Adding one makes a pending person from the name and
 * contact as written, to be corrected afterwards; either way the suggestion's text is then deleted.
 */
export function ReferralPanel({revivalId, referrals, canWrite}: {
    revivalId: string;
    referrals: ReferralValue[];
    canWrite: boolean
}) {
    const t = useTranslations();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();

    if (referrals.length === 0) {
        return null;
    }

    const handle = (id: string, outcome: "ADDED" | "DISMISSED") => startTransition(async () => {
        feedback(await handleReferralAction({
            revivalId,
            id,
            outcome
        }), outcome === "ADDED" ? t("Participants.referralAdded") : t("Participants.referralDismissed"));
    });

    return (
        <Card role="region" aria-label={t("Participants.referrals")}>
            <CardHeader>
                <CardTitle className="text-base">{t("Participants.referrals")}</CardTitle>
                <CardDescription>{t("Participants.referralsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="flex flex-col divide-y">
                    {referrals.map(referral => (
                        <li key={referral.id}
                            className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex min-w-0 flex-col gap-1 text-sm">
                                <span className="font-medium">{referral.name}</span>
                                {referral.contact && <span className="text-muted-foreground">{referral.contact}</span>}
                                {referral.comment &&
                                    <PlainText text={referral.comment} className="text-muted-foreground"/>}
                                <span className="text-xs text-muted-foreground">
                                    {t("Participants.referredBy", {
                                        name: referral.referredBy ?? "—",
                                        date: formatInstant(referral.createdAt) ?? ""
                                    })}
                                </span>
                            </div>
                            {canWrite && (
                                <div className="flex shrink-0 gap-2">
                                    <Button size="sm" variant="outline" disabled={pending}
                                            onClick={() => handle(referral.id, "ADDED")}
                                            aria-label={t("Participants.addReferral", {name: referral.name})}>
                                        <UserPlus/>{t("Participants.addAsPending")}
                                    </Button>
                                    <Button size="sm" variant="ghost" disabled={pending}
                                            onClick={() => handle(referral.id, "DISMISSED")}
                                            aria-label={t("Participants.dismissReferral", {name: referral.name})}>
                                        <X/>{t("Participants.dismiss")}
                                    </Button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
