import {useTranslations} from "next-intl";
import {weekdayOf} from "@/lib/staffing/staffing";

/**
 * The weekday's name for an ISO date, from the messages rather than Intl, so it reads the same
 * on the server and in the browser.
 */
export function useWeekday() {
    const t = useTranslations("ChecklistTemplate.deadline.weekdays");

    return (date: string) => t(weekdayOf(date));
}
