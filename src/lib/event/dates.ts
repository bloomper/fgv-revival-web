const DAY = 24 * 60 * 60 * 1000;

function utc(date: string): number {
    return Date.parse(`${date.slice(0, 10)}T00:00:00Z`);
}

/**
 * The calendar date {@code days} after an ISO date (before it when negative), as yyyy-mm-dd.
 */
export function addDays(date: string, days: number): string {
    return new Date(utc(date) + days * DAY).toISOString().slice(0, 10);
}

/**
 * Whole days from {@code from} to {@code to}, negative when {@code to} is earlier.
 */
export function daysBetween(from: string, to: string): number {
    return Math.round((utc(to) - utc(from)) / DAY);
}

/**
 * Weeks from the premiere, rounded to the nearest week, without a negative zero.
 */
export function weeksFromDays(days: number): number {
    const weeks = Math.round(days / 7);

    return weeks === 0 ? 0 : weeks;
}
