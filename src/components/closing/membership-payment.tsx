import {useTranslations} from "next-intl";
import type {RevivalClosingQuery} from "@/gql/graphql";
import {Badge} from "@/components/ui/badge";

type Payment = NonNullable<NonNullable<NonNullable<RevivalClosingQuery["revival"]>["closing"]>["membershipPayment"]>;

/**
 * The payment request in Medlemskap for the memberships the revival pays: what to pay, to whom and with what message.
 * The treasurer matches the payment there, and the memberships then count.
 */
export function MembershipPayment({payment}: { payment: Payment }) {
    const t = useTranslations("Closing.payment");

    return (
        <div className="space-y-3 text-sm" data-testid="membership-payment">
            <p>{t("intro", {count: payment.included})}</p>
            <dl className="grid max-w-md grid-cols-[auto_1fr] gap-x-6 gap-y-1">
                <dt className="text-muted-foreground">{t("amount")}</dt>
                <dd className="font-medium">{payment.amount} kr</dd>
                {payment.swishNumber && (<><dt className="text-muted-foreground">Swish</dt><dd>{payment.swishNumber}</dd></>)}
                {payment.bankgiro && (<><dt className="text-muted-foreground">{t("bankgiro")}</dt><dd>{payment.bankgiro}</dd></>)}
                {payment.bankAccount && (<><dt className="text-muted-foreground">{t("bankAccount")}</dt><dd>{payment.bankAccount}</dd></>)}
                <dt className="text-muted-foreground">{t("reference")}</dt>
                <dd className="font-mono font-medium">{payment.reference}</dd>
                <dt className="text-muted-foreground">{t("status")}</dt>
                <dd>
                    <Badge variant={payment.status === "MATCHED" ? "default" : "secondary"}>{t(`statuses.${payment.status}`)}</Badge>
                    {payment.paid > 0 && <span className="ml-2">{t("paid", {amount: payment.paid})}</span>}
                </dd>
            </dl>
            <p className="text-muted-foreground">{t("how")}</p>
        </div>
    );
}
