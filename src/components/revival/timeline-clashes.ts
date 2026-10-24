// The cross-revival timeline (product spec 5.1): every revival's shows and the Chalmersspex's dates by month, with the
// show weekends that clash flagged. A show weekend is an ISO week.

const DAY = 24 * 60 * 60 * 1000;

/**
 * The ISO week of a date as "2028-W09": weeks start on Monday, and week 1 holds the year's first Thursday.
 */
export function isoWeek(date: string): string {
    const day = new Date(`${date.slice(0, 10)}T00:00:00Z`);
    const weekday = (day.getUTCDay() + 6) % 7;
    const thursday = new Date(day.getTime() + (3 - weekday) * DAY);
    const year = thursday.getUTCFullYear();
    const week = Math.floor((thursday.getTime() - Date.UTC(year, 0, 1)) / DAY / 7) + 1;

    return `${year}-W${String(week).padStart(2, "0")}`;
}

export type TimelineRevival = {
    id: string;
    title: string;
    status: string;
    shows: { date: string; time?: string | null; venue?: string | null }[];
};

export type TimelineSpexDate = { id: string; date: string; label: string };

export type CrossTimelineItem =
    | {
    kind: "show";
    key: string;
    date: string;
    week: string;
    revivalId: string;
    revivalTitle: string;
    time?: string | null;
    venue?: string | null;
    clash: boolean
}
    | { kind: "spex"; key: string; date: string; week: string; label: string; clash: boolean };

export type CrossTimelineMonth = { month: string; items: CrossTimelineItem[] };

/** A week where two revivals play, or a revival plays when the Chalmersspex does. */
export type Clash = { week: string; revivals: string[]; spex: string[] };

/** Rejected revivals never play, so their shows are left out. */
const PLAYING = (revival: TimelineRevival) => revival.status !== "REJECTED";

/**
 * The timeline by month in date order, and the weeks that clash: those where shows of two revivals fall, or a
 * revival's show and a Chalmersspex date.
 */
export function buildCrossTimeline(revivals: TimelineRevival[], spexDates: TimelineSpexDate[]): {
    months: CrossTimelineMonth[];
    clashes: Clash[]
} {
    const items: CrossTimelineItem[] = [
        ...revivals.filter(PLAYING).flatMap(revival => revival.shows.map((show, index) => ({
            kind: "show" as const,
            key: `show-${revival.id}-${index}`,
            date: show.date,
            week: isoWeek(show.date),
            revivalId: revival.id,
            revivalTitle: revival.title,
            time: show.time,
            venue: show.venue,
            clash: false,
        }))),
        ...spexDates.map(spex => ({
            kind: "spex" as const,
            key: `spex-${spex.id}`,
            date: spex.date,
            week: isoWeek(spex.date),
            label: spex.label,
            clash: false
        })),
    ];
    const weeks = new Map<string, { revivals: Map<string, string>; spex: string[] }>();

    for (const item of items) {
        const week = weeks.get(item.week) ?? {revivals: new Map<string, string>(), spex: [] as string[]};

        if (item.kind === "show") {
            week.revivals.set(item.revivalId, item.revivalTitle);
        } else {
            week.spex.push(item.label);
        }
        weeks.set(item.week, week);
    }

    const clashes = [...weeks.entries()]
        .filter(([, week]) => week.revivals.size >= 2 || (week.revivals.size >= 1 && week.spex.length >= 1))
        .map(([week, found]) => ({week, revivals: [...found.revivals.values()], spex: found.spex}))
        .sort((a, b) => a.week.localeCompare(b.week));
    const clashing = new Set(clashes.map(clash => clash.week));
    const months = new Map<string, CrossTimelineItem[]>();

    items.map(item => ({...item, clash: clashing.has(item.week)}))
        .sort((a, b) => a.date.localeCompare(b.date) || (a.kind === b.kind ? 0 : a.kind === "spex" ? -1 : 1) || a.key.localeCompare(b.key))
        .forEach(item => {
            const month = item.date.slice(0, 7);

            months.set(month, [...(months.get(month) ?? []), item]);
        });

    return {months: [...months.entries()].map(([month, monthItems]) => ({month, items: monthItems})), clashes};
}
