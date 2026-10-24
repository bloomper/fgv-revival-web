import {formatDate} from "@/utils/format";
import {addDays, daysBetween, weeksFromDays} from "@/lib/event/dates";

export type EventDates = {
    startDate: string;
    endDate: string;
    startTime?: string | null;
    endTime?: string | null;
};

/**
 * An event's dates as yyyy-mm-dd, a range when it lasts several days, with its times when set:
 * "2028-01-01", "2028-01-01 18:00–21:00", "2028-01-01 – 2028-01-02", "2028-01-01 10:00 – 2028-01-02 16:00".
 */
export function formatEventDates({startDate, endDate, startTime, endTime}: EventDates): string {
    const start = formatDate(startDate) ?? startDate;
    const end = formatDate(endDate) ?? endDate;

    if (start === end) {
        return startTime ? `${start} ${startTime}${endTime ? `–${endTime}` : ""}` : start;
    }
    return `${start}${startTime ? ` ${startTime}` : ""} – ${end}${endTime ? ` ${endTime}` : ""}`;
}

export type PremiereDistance =
    | { key: "premiereDay" }
    | { key: "premiereWeek" }
    | { key: "weeksBefore" | "weeksAfter"; weeks: number };

/**
 * How far a day is from the premiere, in whole weeks, for "−8 v." / "8 wk before". Null without a premiere.
 */
export function premiereDistance(days: number | null | undefined): PremiereDistance | null {
    if (days === null || days === undefined) {
        return null;
    }
    if (days === 0) {
        return {key: "premiereDay"};
    }

    const weeks = weeksFromDays(days);

    if (weeks === 0) {
        return {key: "premiereWeek"};
    }
    return weeks < 0 ? {key: "weeksBefore", weeks: -weeks} : {key: "weeksAfter", weeks};
}

export type OffsetRange =
    | { key: "offsetNone" }
    | { key: "offsetPremiere" }
    | { key: "offsetBefore" | "offsetAfter"; from: number; to: number }
    | { key: "offsetAround"; before: number; after: number };

/**
 * An event type's offsets from the premiere in weeks, for the hint beside them: "17–9 weeks before the premiere".
 */
export function offsetRange(min: number | null | undefined, max: number | null | undefined): OffsetRange {
    if (min === null || min === undefined || max === null || max === undefined || Number.isNaN(min) || Number.isNaN(max)) {
        return {key: "offsetNone"};
    }
    if (min === 0 && max === 0) {
        return {key: "offsetPremiere"};
    }
    if (max <= 0) {
        return {key: "offsetBefore", from: Math.abs(weeksFromDays(min)), to: Math.abs(weeksFromDays(max))};
    }
    if (min >= 0) {
        return {key: "offsetAfter", from: weeksFromDays(min), to: weeksFromDays(max)};
    }
    return {key: "offsetAround", before: Math.abs(weeksFromDays(min)), after: weeksFromDays(max)};
}

/**
 * The default last day of an event of a type that lasts {@code days} days.
 */
export function defaultEndDate(startDate: string, days: number): string {
    return addDays(startDate, Math.max(days, 1) - 1);
}

export type TimelineEvent = EventDates & {
    id: string;
    title: string;
    location?: string | null;
    cancelled: boolean;
    daysFromPremiere?: number | null;
    typeName?: string | null;
    checklist?: { id: string; openCount: number; totalCount: number } | null;
};

export type TimelineItem =
    | { kind: "premiere"; key: string; date: string; daysFromPremiere: 0 }
    | {
    kind: "show";
    key: string;
    date: string;
    time?: string | null;
    venue?: string | null;
    daysFromPremiere: number | null
}
    | { kind: "meeting"; key: string; id: string; date: string; title?: string | null; daysFromPremiere: number | null }
    | {
    kind: "event";
    key: string;
    date: string;
    time?: string | null;
    event: TimelineEvent;
    daysFromPremiere: number | null
};

export type TimelineMonth = { month: string; items: TimelineItem[] };

const KIND_ORDER: Record<TimelineItem["kind"], number> = {premiere: 0, show: 1, event: 2, meeting: 3};

function timeOf(item: TimelineItem): string {
    return item.kind === "show" || item.kind === "event" ? item.time ?? "" : "";
}

/**
 * Everything on a revival's timeline, grouped by month in date order: its events, shows, meetings that were not
 * cancelled and the premiere, each with its distance from the premiere.
 */
export function buildTimeline({events, shows, meetings, premiereDate}: {
    events: TimelineEvent[];
    shows: { date: string; time?: string | null; venue?: string | null }[];
    meetings: { id: string; date: string; title?: string | null; status: string }[];
    premiereDate?: string | null;
}): TimelineMonth[] {
    const from = (date: string) => premiereDate ? daysBetween(premiereDate, date) : null;
    const items: TimelineItem[] = [
        ...(premiereDate ? [{
            kind: "premiere" as const,
            key: "premiere",
            date: premiereDate,
            daysFromPremiere: 0 as const
        }] : []),
        ...shows.map((show, index) => ({
            kind: "show" as const,
            key: `show-${index}`,
            date: show.date,
            time: show.time,
            venue: show.venue,
            daysFromPremiere: from(show.date)
        })),
        ...meetings.filter(meeting => meeting.status !== "CANCELLED")
            .map(meeting => ({
                kind: "meeting" as const,
                key: `meeting-${meeting.id}`,
                id: meeting.id,
                date: meeting.date,
                title: meeting.title,
                daysFromPremiere: from(meeting.date)
            })),
        ...events.map(event => ({
            kind: "event" as const, key: `event-${event.id}`, date: event.startDate, time: event.startTime, event,
            daysFromPremiere: event.daysFromPremiere ?? from(event.startDate),
        })),
    ];

    items.sort((a, b) => a.date.localeCompare(b.date) || KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || timeOf(a).localeCompare(timeOf(b)));

    const months: TimelineMonth[] = [];

    for (const item of items) {
        const month = item.date.slice(0, 7);
        const last = months.at(-1);

        if (last?.month === month) {
            last.items.push(item);
        } else {
            months.push({month, items: [item]});
        }
    }
    return months;
}
