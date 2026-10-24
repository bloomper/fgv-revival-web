import {useTranslations} from "next-intl";
import {CalendarDays, Clock, Theater} from "lucide-react";
import type {ShiftSlotFieldsFragment} from "@/gql/graphql";
import {compareSlots} from "@/lib/staffing/staffing";
import {formatDate} from "@/utils/format";

type ScheduleEvent = { id: string; title: string; startDate: string; endDate: string; startTime?: string | null; endTime?: string | null; location?: string | null };
type Show = { date: string; time?: string | null; venue?: string | null };

type Entry =
    | { kind: "event"; date: string; key: string; event: ScheduleEvent; shifts: ShiftSlotFieldsFragment[] }
    | { kind: "show"; date: string; key: string; show: Show };

/** Events and shows in date order, each event with the caller's shifts in it. */
export function scheduleEntries(events: ScheduleEvent[], shows: Show[], shifts: ShiftSlotFieldsFragment[]): Entry[] {
    const entries: Entry[] = [
        ...events.map(event => ({
            kind: "event" as const, date: event.startDate, key: `event-${event.id}`, event,
            shifts: shifts.filter(shift => shift.event.id === event.id).sort(compareSlots),
        })),
        ...shows.map((show, index) => ({kind: "show" as const, date: show.date, key: `show-${index}`, show})),
    ];

    return entries.sort((a, b) => a.date.localeCompare(b.date) || a.key.localeCompare(b.key));
}

/**
 * The participant's schedule (M6B-FR-7): the revival's events and shows by date, with their own shifts under the event.
 * A helper's events are only those they hold shifts in, as the server returns them.
 */
export function Schedule({events, shows, shifts}: { events: ScheduleEvent[]; shows: Show[]; shifts: ShiftSlotFieldsFragment[] }) {
    const t = useTranslations("Schedule");
    const entries = scheduleEntries(events, shows, shifts);

    if (entries.length === 0) {
        return <p className="text-sm text-muted-foreground">{t("empty")}</p>;
    }
    return (
        <ol className="flex flex-col gap-3">
            {entries.map(entry => entry.kind === "show" ? (
                <li key={entry.key} className="flex gap-3">
                    <Theater className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden/>
                    <div>
                        <p className="font-medium">{t("show")}</p>
                        <p className="text-sm tabular-nums text-muted-foreground">{[formatDate(entry.show.date), entry.show.time, entry.show.venue].filter(Boolean).join(" · ")}</p>
                    </div>
                </li>
            ) : (
                <li key={entry.key} className="flex gap-3">
                    <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden/>
                    <div className="min-w-0">
                        <p className="font-medium">{entry.event.title}</p>
                        <p className="text-sm tabular-nums text-muted-foreground">
                            {[
                                entry.event.startDate === entry.event.endDate ? formatDate(entry.event.startDate) : `${formatDate(entry.event.startDate)} – ${formatDate(entry.event.endDate)}`,
                                entry.event.startTime && (entry.event.endTime ? `${entry.event.startTime}–${entry.event.endTime}` : entry.event.startTime),
                                entry.event.location,
                            ].filter(Boolean).join(" · ")}
                        </p>
                        {entry.shifts.length > 0 && (
                            <ul className="mt-1 flex flex-col gap-0.5" aria-label={t("yourShifts")}>
                                {entry.shifts.map(shift => (
                                    <li key={shift.id} className="flex items-center gap-1.5 text-sm tabular-nums">
                                        <Clock className="size-3.5 text-muted-foreground" aria-hidden/>
                                        {t("shift", {task: shift.task, date: formatDate(shift.date) ?? "", start: shift.startTime, end: shift.endTime})}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </li>
            ))}
        </ol>
    );
}
