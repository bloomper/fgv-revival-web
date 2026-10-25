import Link from "next/link";
import {useLocale, useTranslations} from "next-intl";
import {Plus} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {buttonVariants} from "@/components/ui/button";
import {pickText} from "@/components/guide/localized";
import {AudienceText, MailingStatusBadge} from "@/components/mailing/mailing-labels";
import type {MailingAudienceKind, MailingStatus} from "@/gql/graphql";
import {formatDate} from "@/utils/format";
import {cn} from "@/utils/utils";

export type PlanEntry = {
    template: { id: string; name: { sv: string; en?: string | null }; audience: MailingAudienceKind };
    event?: { id: string; title: string; startDate: string } | null;
    dueDate: string;
    mailing?: { id: string; status: MailingStatus; subject: string; sentAt?: string | null } | null;
    due: boolean;
};

/** The link that opens the editor prefilled from a plan entry. */
export function planEntryHref(revivalId: string, entry: { template: { id: string }; event?: { id: string } | null }) {
    return `/revivals/${revivalId}/mailings/new?${new URLSearchParams({template: entry.template.id, ...(entry.event ? {event: entry.event.id} : {})})}`;
}

/**
 * The revival's mailing plan: each planned mailing with its due date, the event it belongs to (or the
 * premiere), and the mailing made from it. Entries due within a week with nothing sent are highlighted, with a button
 * that drafts the mailing from the template.
 */
export function MailingPlan({revivalId, entries, canDraft}: {
    revivalId: string;
    entries: PlanEntry[];
    canDraft: boolean
}) {
    const t = useTranslations("Mailings");
    const locale = useLocale();

    if (entries.length === 0) {
        return <p className="text-sm text-muted-foreground">{t("planEmpty")}</p>;
    }
    return (
        <ol className="flex flex-col gap-2">
            {entries.map(entry => {
                const name = pickText(entry.template.name, locale).text;
                const sent = entry.mailing?.status === "SENT";

                return (
                    <li key={`${entry.template.id}-${entry.event?.id ?? "premiere"}`}
                        className={cn("flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center", entry.due && "border-amber-500 bg-amber-50 dark:bg-amber-950/30")}>
                        <div className="w-28 shrink-0 tabular-nums">
                            <span className="sr-only">{t("dueDate")} </span>{formatDate(entry.dueDate)}
                        </div>
                        <div className="min-w-0 flex-1 space-y-0.5">
                            <p className="flex flex-wrap items-center gap-2 font-medium">
                                {name}
                                {entry.due && <Badge variant="destructive">{t("dueNow")}</Badge>}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {entry.event ? t("forEvent", {
                                    event: entry.event.title,
                                    date: formatDate(entry.event.startDate) ?? ""
                                }) : t("forPremiere")}
                                {" · "}<AudienceText audience={{kind: entry.template.audience, event: entry.event}}/>
                            </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            {entry.mailing && (
                                <Link href={`/revivals/${revivalId}/mailings/${entry.mailing.id}`}
                                      className="flex items-center gap-2 text-sm underline-offset-2 hover:underline"
                                      aria-label={t("openMailing", {subject: entry.mailing.subject})}>
                                    <MailingStatusBadge status={entry.mailing.status}/>
                                    {sent && entry.mailing.sentAt && <span
                                        className="tabular-nums text-muted-foreground">{formatDate(entry.mailing.sentAt)}</span>}
                                </Link>
                            )}
                            {canDraft && !entry.mailing && (
                                <Link href={planEntryHref(revivalId, entry)} className={buttonVariants({
                                    variant: entry.due ? "default" : "outline",
                                    size: "sm"
                                })}
                                      aria-label={t("createDraftFor", {name})}>
                                    <Plus/>{t("createDraft")}
                                </Link>
                            )}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}
