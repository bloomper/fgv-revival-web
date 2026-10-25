import Link from "next/link";
import {useTranslations} from "next-intl";
import {Drama, PartyPopper, TriangleAlert} from "lucide-react";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Badge} from "@/components/ui/badge";
import type {Clash, CrossTimelineMonth} from "@/components/revival/timeline-clashes";
import {formatDate} from "@/utils/format";
import {cn} from "@/utils/utils";

function weekLabel(week: string) {
    const [year, number] = week.split("-W");

    return {year, week: Number(number)};
}

/**
 * Every revival's shows and the Chalmersspex's dates by month, for super admins and observers. Weeks
 * where two revivals play, or a revival plays when the Chalmersspex does, are flagged and summed up on top.
 */
export function RevivalTimeline({months, clashes}: { months: CrossTimelineMonth[]; clashes: Clash[] }) {
    const t = useTranslations();

    if (months.length === 0) {
        return <p className="text-sm text-muted-foreground">{t("RevivalTimeline.empty")}</p>;
    }

    return (
        <div className="flex flex-col gap-6" role="region" aria-label={t("RevivalTimeline.title")}>
            {clashes.length > 0 && (
                <Alert variant="destructive">
                    <TriangleAlert/>
                    <AlertTitle>{t("RevivalTimeline.clashesTitle", {count: clashes.length})}</AlertTitle>
                    <AlertDescription>
                        <ul className="list-disc pl-4">
                            {clashes.map(clash => (
                                <li key={clash.week}>
                                    {t("RevivalTimeline.clash", {
                                        ...weekLabel(clash.week),
                                        names: [...clash.revivals, ...clash.spex].join(", ")
                                    })}
                                </li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}
            {months.map(({month, items}) => {
                const [year, number] = month.split("-");

                return (
                    <section key={month} aria-labelledby={`timeline-${month}`} className="space-y-2">
                        <h3 id={`timeline-${month}`} className="text-sm font-semibold text-muted-foreground">
                            {t("Event.month", {month: t(`Event.months.${number}`), year})}
                        </h3>
                        <ol className="space-y-2 border-l pl-4">
                            {items.map(item => (
                                <li key={item.key}
                                    className={cn("flex flex-col gap-1 rounded-md border p-3 text-sm sm:flex-row sm:items-center sm:gap-4",
                                        item.clash && "border-destructive/60 bg-destructive/5")}>
                                    <span
                                        className="flex items-center gap-2 font-medium tabular-nums sm:w-48 sm:shrink-0">
                                        {item.kind === "show" ?
                                            <Drama className="size-4 text-muted-foreground" aria-hidden/> :
                                            <PartyPopper className="size-4 text-muted-foreground" aria-hidden/>}
                                        {formatDate(item.date)}{item.kind === "show" && item.time ? ` ${item.time}` : ""}
                                    </span>
                                    <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                                        {item.kind === "show" ? (
                                            <>
                                                <Link href={`/revivals/${item.revivalId}`}
                                                      className="font-medium hover:underline">{item.revivalTitle}</Link>
                                                {item.venue &&
                                                    <span className="text-muted-foreground">{item.venue}</span>}
                                            </>
                                        ) : (
                                            <>
                                                <span className="font-medium">{item.label}</span>
                                                <Badge variant="secondary">{t("RevivalTimeline.chalmersspex")}</Badge>
                                            </>
                                        )}
                                        {item.clash &&
                                            <Badge variant="destructive">{t("RevivalTimeline.clashBadge")}</Badge>}
                                    </span>
                                    <span
                                        className="text-xs text-muted-foreground">{t("RevivalTimeline.week", {week: weekLabel(item.week).week})}</span>
                                </li>
                            ))}
                        </ol>
                    </section>
                );
            })}
        </div>
    );
}
