import Link from "next/link";
import {useTranslations} from "next-intl";
import {ChevronRight} from "lucide-react";
import {buttonVariants} from "@/components/ui/button";
import {Card, CardAction, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {type EventDates, formatEventDates} from "@/components/event/timeline";

/**
 * The revival's next three events that have not ended, on its overview (M4-FR-8), with a link to all of them.
 */
export function UpcomingEvents({revivalId, events}: {
    revivalId: string;
    events: (EventDates & { id: string; title: string })[]
}) {
    const t = useTranslations("Event");

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("upcoming")}</CardTitle>
                <CardAction>
                    <Link href={`/revivals/${revivalId}/events`}
                          className={buttonVariants({variant: "outline", size: "sm"})}>
                        {t("showAll")}
                        <ChevronRight/>
                    </Link>
                </CardAction>
            </CardHeader>
            <CardContent>
                {events.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("noUpcoming")}</p>
                ) : (
                    <ul className="space-y-2 text-sm">
                        {events.map(event => (
                            <li key={event.id} className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                                <span
                                    className="tabular-nums text-muted-foreground sm:w-56 sm:shrink-0">{formatEventDates(event)}</span>
                                <span>{event.title}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
