import type {RelativeDeadlineKind, Weekday} from "@/gql/graphql";

export type RelativeDeadlineValue = { kind: RelativeDeadlineKind; amount?: number | null; weekday?: Weekday | null };

export const WEEKDAYS: Weekday[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
export const AMOUNT_LIMIT = 365;

const DAY = 24 * 60 * 60 * 1000;

function parse(date: string) {
    const [year, month, day] = date.split("-").map(Number);

    return new Date(Date.UTC(year, month - 1, day));
}

function format(date: Date) {
    return date.toISOString().slice(0, 10);
}

/** Monday is 0, as in ISO weeks. */
function isoWeekday(date: Date) {
    return (date.getUTCDay() + 6) % 7;
}

/**
 * The same computation as the server's RelativeDeadline.apply (research R11), for the live example while editing.
 */
export function applyRelativeDeadline(deadline: RelativeDeadlineValue, date: string): string {
    const start = parse(date);

    if (deadline.kind === "DAYS") {
        return format(new Date(start.getTime() + (deadline.amount ?? 0) * DAY));
    }
    if (deadline.kind === "WORKING_DAYS") {
        const amount = deadline.amount ?? 0;
        const step = amount < 0 ? -1 : 1;
        let result = start;

        for (let remaining = Math.abs(amount); remaining > 0;) {
            result = new Date(result.getTime() + step * DAY);
            if (isoWeekday(result) < 5) {
                remaining--;
            }
        }
        return format(result);
    }

    const mondayBefore = new Date(start.getTime() - (isoWeekday(start) + 7) * DAY);

    return format(new Date(mondayBefore.getTime() + WEEKDAYS.indexOf(deadline.weekday ?? "MONDAY") * DAY));
}

export function validRelativeDeadline(deadline: RelativeDeadlineValue): boolean {
    return deadline.kind === "WEEKDAY_WEEK_BEFORE"
        ? !!deadline.weekday && deadline.amount == null
        : deadline.amount != null && Number.isInteger(deadline.amount) && Math.abs(deadline.amount) <= AMOUNT_LIMIT && !deadline.weekday;
}
