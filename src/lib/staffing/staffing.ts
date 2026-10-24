import type {AvailabilityAnswer, ParticipantKind, Weekday} from "@/gql/graphql";
import {addDays, daysBetween} from "@/lib/event/dates";

// Pure helpers for availability and staffing (M6b), shared by the participant's page, the staffing tab and its prints.

export type EventSpan = { startDate: string; endDate: string };
export type AvailabilityDayValue = { eventId: string; date: string; answer: AvailabilityAnswer; comment?: string | null };
export type SlotTime = { date: string; startTime: string; endTime: string };

/** Every day of an event, first to last; an event lasts at most 32 days (M4). */
export function eventDays(event: EventSpan): string[] {
    const span = Math.min(Math.max(daysBetween(event.startDate, event.endDate), 0), 31);

    return Array.from({length: span + 1}, (_, index) => addDays(event.startDate, index));
}

const WEEKDAYS: Weekday[] = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

/** The weekday of an ISO date, as the calendar date it is (never shifted across time zones). */
export function weekdayOf(date: string): Weekday {
    return WEEKDAYS[new Date(`${date.slice(0, 10)}T12:00:00Z`).getUTCDay()];
}

/** Slots by day, each day's in time order, the days in date order. */
export function slotsByDay<T extends SlotTime>(slots: T[]): [string, T[]][] {
    const days = new Map<string, T[]>();

    [...slots].sort(compareSlots).forEach(slot => days.set(slot.date, [...(days.get(slot.date) ?? []), slot]));
    return [...days.entries()];
}

export function compareSlots(a: SlotTime, b: SlotTime): number {
    return a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime) || a.endTime.localeCompare(b.endTime);
}

/** Two slots on the same day whose times overlap, as the server refuses for one person (`error.shift.overlap`). */
export function overlaps(a: SlotTime, b: SlotTime): boolean {
    return a.date === b.date && a.startTime < b.endTime && b.startTime < a.endTime;
}

export type StaffingCandidate = {
    id: string;
    name: string;
    kind: ParticipantKind;
    position?: string | null;
    answer: AvailabilityAnswer | null;
    comment?: string | null;
};

const ANSWER_ORDER: Record<string, number> = {YES: 0, MAYBE: 1, unknown: 2, NO: 3};

/**
 * Whom to offer for a slot (M6b): those who said yes that day first, then maybe, then those who have not answered, and
 * those who said no last; by name within each.
 */
export function rankCandidates(candidates: StaffingCandidate[]): StaffingCandidate[] {
    return [...candidates].sort((a, b) => ANSWER_ORDER[a.answer ?? "unknown"] - ANSWER_ORDER[b.answer ?? "unknown"] || a.name.localeCompare(b.name, "sv"));
}

/** A person's answer for a day of an event, from their answers. */
export function answerFor(days: AvailabilityDayValue[], eventId: string, date: string): AvailabilityDayValue | null {
    return days.find(day => day.eventId === eventId && day.date === date) ?? null;
}
