import {formatInstant} from "@/utils/format";

export type NewsItem = {
    id: string;
    subject: string;
    text: string;
    visibleFrom?: string | null;
    visibleTo?: string | null;
    published: boolean;
    version: number;
};

export type NewsState = "PUBLISHED" | "DRAFT" | "SCHEDULED" | "WITHDRAWN";

/**
 * Where a piece stands today, in Swedish time: published as the server says, otherwise a draft (no first day), coming
 * (first day ahead) or withdrawn (last day passed).
 */
export function newsState(news: Pick<NewsItem, "published" | "visibleFrom">, now: Date = new Date()): NewsState {
    if (news.published) {
        return "PUBLISHED";
    }
    if (!news.visibleFrom) {
        return "DRAFT";
    }

    const today = formatInstant(now)?.slice(0, 10) ?? "";

    return news.visibleFrom > today ? "SCHEDULED" : "WITHDRAWN";
}
