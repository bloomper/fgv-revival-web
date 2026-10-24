"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import {Check, Copy} from "lucide-react";
import {toast} from "sonner";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {formatAmount, formatInstant} from "@/utils/format";

export type SwishValue = { number: string; amount: string; message: string; qrAvailable: boolean };

function CopyRow({label, value, shown}: { label: string; value: string; shown?: string }) {
    const t = useTranslations("Participation");
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            toast.success(t("copied", {label}));
        } catch {
            toast.error(t("copyFailed"));
        }
    };

    return (
        <div className="flex items-center justify-between gap-3 py-1">
            <div className="flex min-w-0 flex-col">
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="font-mono text-base break-all">{shown ?? value}</dd>
            </div>
            <Button type="button" variant="outline" className="size-11 shrink-0" aria-label={t("copy", {label})} onClick={copy}>
                {copied ? <Check/> : <Copy/>}
            </Button>
        </div>
    );
}

/**
 * The participant's fee and, while it is unpaid, how to pay it by Swish: the QR code for someone paying from another
 * device, and the number, amount and message to copy, since a phone cannot scan its own screen.
 */
export function FeeDetails({revivalId, fee, paid, paidAt, swish}: {
    revivalId: string;
    fee: string;
    paid: boolean;
    paidAt?: string | null;
    swish: SwishValue | null;
}) {
    const t = useTranslations("Participation");
    const [qrFailed, setQrFailed] = useState(false);
    // The amount is copied the way the Swish app takes it, with a decimal comma and no spaces
    const amountForSwish = swish ? swish.amount.replace(".", ",") : "";

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-2xl font-bold tabular-nums">{formatAmount(fee)}</span>
                {paid
                    ? <Badge variant="secondary">{paidAt ? t("feePaidOn", {date: formatInstant(paidAt) ?? ""}) : t("feePaid")}</Badge>
                    : <Badge variant="outline">{t("feeUnpaid")}</Badge>}
            </div>
            {!paid && swish && (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    {swish.qrAvailable && !qrFailed && (
                        // eslint-disable-next-line @next/next/no-img-element -- next/image would fetch it without the user's session
                        <img src={`/api/swish-qr/${revivalId}`} alt={t("swishQrAlt", {amount: formatAmount(swish.amount) ?? ""})} width={200} height={200}
                             className="size-50 self-center rounded-md border bg-white p-2 sm:self-start" onError={() => setQrFailed(true)}/>
                    )}
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <p className="text-sm">{t("swishInstructions")}</p>
                        <dl className="flex flex-col divide-y">
                            <CopyRow label={t("swishNumber")} value={swish.number}/>
                            <CopyRow label={t("swishAmount")} value={amountForSwish} shown={formatAmount(swish.amount) ?? swish.amount}/>
                            <CopyRow label={t("swishMessage")} value={swish.message}/>
                        </dl>
                    </div>
                </div>
            )}
        </div>
    );
}
