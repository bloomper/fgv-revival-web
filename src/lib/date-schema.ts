import {z} from "zod";

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Whether the value is a yyyy-mm-dd date that exists in the calendar; 2026-02-31 does not (`Date.parse` would accept
 * it as 3 March).
 */
export function isCalendarDate(value: string): boolean {
    const match = ISO_DATE.exec(value);

    if (!match) {
        return false;
    }

    const [year, month, day] = match.slice(1).map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/** A yyyy-mm-dd date that exists in the calendar; the message key is "dateInvalid". */
export const isoDate = z.string().refine(isCalendarDate, "dateInvalid");

/** As {@link isoDate}, or "" for none. */
export const optionalIsoDate = z.string().refine(value => value === "" || isCalendarDate(value), "dateInvalid");
