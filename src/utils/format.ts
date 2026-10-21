/**
 * Formats an ISO date (yyyy-mm-dd) in the user's language, without shifting it across time zones.
 */
export function formatDate(value: string | null | undefined, locale: string): string | null {
    if (!value) {
        return null;
    }

    const date = new Date(`${value}T00:00:00Z`);

    return Number.isNaN(date.getTime())
        ? value
        : new Intl.DateTimeFormat(locale, {dateStyle: "medium", timeZone: "UTC"}).format(date);
}

export function formatInstant(value: string | null | undefined, locale: string): string | null {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? value
        : new Intl.DateTimeFormat(locale, {dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Stockholm"}).format(date);
}
