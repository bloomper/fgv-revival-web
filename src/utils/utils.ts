import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";
import {format, parseISO} from "date-fns";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string | null | undefined) {
    if (!date) {
        return "";
    }
    try {
        return format(parseISO(date), "yyyy-MM-dd");
    } catch {
        return "";
    }
}
