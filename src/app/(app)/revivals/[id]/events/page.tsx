import {notFound} from "next/navigation";
import {getLocale, getTranslations} from "next-intl/server";
import {GanttChart, List} from "lucide-react";
import {catalogName} from "@/components/catalog/catalog";
import {CalendarLinkDialog} from "@/components/event/calendar-link-dialog.client";
import {EventTable} from "@/components/event/event-table.client";
import {EventTimeline} from "@/components/event/event-timeline";
import {buildTimeline} from "@/components/event/timeline";
import {ReadOnlyNotice} from "@/components/revival/read-only-notice";
import {ViewLink} from "@/components/view-link";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getRevivalEvents} from "@/lib/event/event.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

async function load(id: string, includeCancelled: boolean, withMeetings: boolean) {
    try {
        return await getRevivalEvents(id, {includeCancelled, withMeetings});
    } catch (error) {
        if (error instanceof GraphQLRequestError && (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")) {
            return null;
        }
        throw error;
    }
}

/**
 * A revival's events: the list with the proposals from the premiere, or the timeline of events, shows and
 * meetings with {@code ?view=timeline}. Cancelled events only with {@code ?cancelled=1}.
 */
export default async function EventsPage({params, searchParams}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const {id} = await params;
    const query = await searchParams;
    const timeline = query.view === "timeline";
    const showCancelled = query.cancelled === "1";

    return withPolicyPage(Policies.app.requireAccess, async ({roles}) => {
        const loaded = await load(id, showCancelled, timeline);

        if (!loaded) {
            notFound();
        }

        const t = await getTranslations("Event");
        const locale = await getLocale();
        const {revival, events, types, meetings} = loaded;
        const canWrite = revival.permissions.canWriteLog;
        const base = `/revivals/${revival.id}/events`;
        const cancelledQuery = showCancelled ? "cancelled=1" : "";

        return (
            <div className="flex flex-1 flex-col gap-4">
                <h3 className="sr-only">{t("title")}</h3>
                <ReadOnlyNotice revivalId={revival.id} status={revival.status} canWrite={canWrite} roles={roles}/>
                <nav aria-label={t("views")} className="flex w-fit gap-1 rounded-lg bg-muted p-1">
                    <ViewLink href={cancelledQuery ? `${base}?${cancelledQuery}` : base} active={!timeline}
                              icon={List}>{t("list")}</ViewLink>
                    <ViewLink href={`${base}?view=timeline${cancelledQuery ? `&${cancelledQuery}` : ""}`}
                              active={timeline} icon={GanttChart}>
                        {t("timeline")}
                    </ViewLink>
                </nav>
                {timeline ? (
                    <EventTimeline revivalId={revival.id} months={buildTimeline({
                        events: events.map(event => ({
                            ...event,
                            typeName: event.type ? catalogName(event.type, locale) : null
                        })),
                        shows: revival.shows,
                        meetings,
                        premiereDate: revival.premiereDate,
                    })}/>
                ) : (
                    <EventTable revivalId={revival.id} events={events} types={types} proposals={revival.eventProposals}
                                canWrite={canWrite}
                                showCancelled={showCancelled}
                                actions={revival.permissions.canSubscribeCalendar &&
                                    <CalendarLinkDialog revivalId={revival.id} feed={revival.calendarFeed ?? null}/>}/>
                )}
            </div>
        );
    });
}
