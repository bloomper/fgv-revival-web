import Link from "next/link";
import {useTranslations} from "next-intl";
import {CalendarCheck, CalendarDays, ClipboardCheck, Drama, Star} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {CancelledBadge, PremiereDistanceLabel} from "@/components/event/event-labels";
import {formatEventDates, type TimelineItem, type TimelineMonth} from "@/components/event/timeline";
import {formatDate} from "@/utils/format";
import {cn} from "@/utils/utils";

const ICONS = {premiere: Star, show: Drama, meeting: CalendarCheck, event: CalendarDays};

function When({item}: { item: TimelineItem }) {
    if (item.kind === "event") {
        return <>{formatEventDates(item.event)}</>;
    }
    return <>{formatDate(item.date)}{item.kind === "show" && item.time ? ` ${item.time}` : ""}</>;
}

function What({item, revivalId}: { item: TimelineItem; revivalId: string }) {
    const t = useTranslations("Event");

    switch (item.kind) {
        case "premiere":
            return <span className="font-semibold">{t("premiere")}</span>;
        case "show":
            return <span>{t("show")}{item.venue ? `, ${item.venue}` : ""}</span>;
        case "meeting":
            return (
                <Link href={`/revivals/${revivalId}/meetings/${item.id}`} className="hover:underline">
                    {item.title || t("meeting")}
                </Link>
            );
        case "event":
            return (
                <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{item.event.title}</span>
                    {item.event.typeName && <Badge variant="secondary">{item.event.typeName}</Badge>}
                    {item.event.cancelled && <CancelledBadge/>}
                    {item.event.location && <span className="text-muted-foreground">{item.event.location}</span>}
                    {item.event.checklist && (
                        <Link href={`/revivals/${revivalId}/checklists/${item.event.checklist.id}`}
                              className="inline-flex items-center gap-1 text-muted-foreground tabular-nums hover:underline"
                              aria-label={t("checklistLink", {
                                  open: item.event.checklist.openCount,
                                  total: item.event.checklist.totalCount
                              })}>
                            <ClipboardCheck className="size-4"/>
                            {item.event.checklist.openCount}/{item.event.checklist.totalCount}
                        </Link>
                    )}
                </span>
            );
    }
}

/**
 * A revival's events, shows and meetings in one list by month, with the premiere marked and each item's distance from
 * it in weeks. One column, so it reads the same on a phone.
 */
export function EventTimeline({revivalId, months}: { revivalId: string; months: TimelineMonth[] }) {
    const t = useTranslations("Event");

    if (months.length === 0) {
        return <p className="text-sm text-muted-foreground">{t("timelineEmpty")}</p>;
    }

    return (
        <div className="flex flex-col gap-6" aria-label={t("timeline")} role="region">
            {months.map(({month, items}) => {
                const [year, number] = month.split("-");

                return (
                    <section key={month} aria-labelledby={`month-${month}`} className="space-y-2">
                        <h4 id={`month-${month}`} className="text-sm font-semibold text-muted-foreground">
                            {t("month", {month: t(`months.${number}`), year})}
                        </h4>
                        <ol className="space-y-2 border-l pl-4">
                            {items.map(item => {
                                const Icon = ICONS[item.kind];

                                return (
                                    <li key={item.key}
                                        className={cn("relative flex flex-col gap-1 rounded-md border p-3 text-sm sm:flex-row sm:items-start sm:gap-4",
                                            item.kind === "premiere" && "border-primary bg-primary/5",
                                            item.kind === "event" && item.event.cancelled && "text-muted-foreground")}
                                        data-kind={item.kind}>
                                        <span
                                            className="flex items-center gap-2 font-medium tabular-nums sm:w-56 sm:shrink-0">
                                            <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden/>
                                            <When item={item}/>
                                        </span>
                                        <span className="min-w-0 flex-1"><What item={item}
                                                                               revivalId={revivalId}/></span>
                                        {item.kind !== "premiere" && (
                                            <span
                                                className="text-xs text-muted-foreground sm:text-sm"><PremiereDistanceLabel
                                                days={item.daysFromPremiere}/></span>
                                        )}
                                    </li>
                                );
                            })}
                        </ol>
                    </section>
                );
            })}
        </div>
    );
}
