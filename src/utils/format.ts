const DATE_TIME = new Intl.DateTimeFormat("sv-SE", {
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    timeZone: "Europe/Stockholm",
});

/**
 * Formats an ISO date as yyyy-mm-dd in every language, as Spexregister does. The calendar date is kept as it is, never
 * shifted across time zones.
 */
export function formatDate(value: string | null | undefined): string | null {
    if (!value) {
        return null;
    }

    const date = /^\d{4}-\d{2}-\d{2}/.exec(value)?.[0];

    return date && !Number.isNaN(new Date(`${date}T00:00:00Z`).getTime()) ? date : value;
}

/**
 * Formats an instant as yyyy-mm-dd hh:mm in Swedish time, in every language.
 */
export function formatInstant(value: string | Date | null | undefined): string | null {
    if (!value) {
        return null;
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return typeof value === "string" ? value : null;
    }

    const parts = Object.fromEntries(DATE_TIME.formatToParts(date).map(part => [part.type, part.value]));

    return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
}
