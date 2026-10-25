import {z} from "zod";

export const MAX_LOG_TEXT = 5000;
export const MAX_TAG = 50;
export const MAX_OWNER_NAME = 100;

export const LOG_ENTRY_TYPES = ["DECISION", "TODO", "QUESTION"] as const;
export const LOG_ENTRY_STATUSES = ["OPEN", "WAITING", "DONE", "CANCELLED"] as const;

const id = z.string().min(1);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "dateInvalid");

export const ownerSchema = z.object({
    personId: id.nullable().optional(),
    name: z.string().trim().min(1, "ownerNameRequired").max(MAX_OWNER_NAME, "ownerNameTooLong").nullable().optional(),
}).nullable();

export const logEntryValuesSchema = z.object({
    type: z.enum(LOG_ENTRY_TYPES),
    text: z.string().trim().min(1, "logTextRequired").max(MAX_LOG_TEXT, "logTextTooLong"),
    status: z.enum(LOG_ENTRY_STATUSES),
    owner: ownerSchema,
    deadline: date.nullable().optional(),
    date: date.optional(),
    comment: z.string().trim().max(MAX_LOG_TEXT, "logCommentTooLong").optional(),
    tags: z.array(z.string().trim().min(1, "logTagInvalid").max(MAX_TAG, "logTagInvalid")),
});

export type LogEntryValues = z.infer<typeof logEntryValuesSchema>;

export const logEntryCreateSchema = z.object({
    revivalId: id,
    meetingId: id.nullable().optional(),
    values: logEntryValuesSchema
});

export const logEntryUpdateSchema = z.object({
    id,
    version: z.number().int(),
    revivalId: id,
    meetingId: id.nullable().optional(),
    values: logEntryValuesSchema.partial(),
});

export const logEntryAnswerSchema = z.object({
    questionId: id,
    questionVersion: z.number().int(),
    revivalId: id,
    meetingId: id.nullable().optional(),
    text: z.string().trim().min(1, "logTextRequired").max(MAX_LOG_TEXT, "logTextTooLong"),
    owner: ownerSchema,
    deadline: date.nullable().optional(),
    comment: z.string().trim().max(MAX_LOG_TEXT, "logCommentTooLong").optional(),
});

export const logFilterSchema = z.object({
    mine: z.boolean().optional(),
    open: z.boolean().optional(),
    overdue: z.boolean().optional(),
    types: z.array(z.enum(LOG_ENTRY_TYPES)).optional(),
    tags: z.array(z.string()).optional(),
    text: z.string().optional(),
    meetingId: id.optional(),
});

export type LogFilterValues = z.infer<typeof logFilterSchema>;

/**
 * The log filters, kept in the URL query so a filtered view can be shared and reloaded.
 */
export function parseLogFilter(query: Record<string, string | string[] | undefined>): LogFilterValues {
    const list = (value: string | string[] | undefined) => (Array.isArray(value) ? value : value ? value.split(",") : [])
        .map(entry => entry.trim()).filter(Boolean);
    const types = list(query.type).filter((type): type is (typeof LOG_ENTRY_TYPES)[number] =>
        (LOG_ENTRY_TYPES as readonly string[]).includes(type));
    const text = typeof query.q === "string" ? query.q.trim() : "";

    return {
        mine: query.mine === "1" || undefined,
        open: query.open === "1" || undefined,
        overdue: query.overdue === "1" || undefined,
        types: types.length > 0 ? types : undefined,
        tags: list(query.tag).length > 0 ? list(query.tag) : undefined,
        text: text || undefined,
        meetingId: typeof query.meeting === "string" && query.meeting ? query.meeting : undefined,
    };
}

export function isLogFiltered(filter: LogFilterValues): boolean {
    return Object.values(filter).some(value => value !== undefined);
}

export function logFilterQuery(filter: LogFilterValues): string {
    const params = new URLSearchParams();

    if (filter.mine) {
        params.set("mine", "1");
    }
    if (filter.open) {
        params.set("open", "1");
    }
    if (filter.overdue) {
        params.set("overdue", "1");
    }
    if (filter.types?.length) {
        params.set("type", filter.types.join(","));
    }
    if (filter.tags?.length) {
        params.set("tag", filter.tags.join(","));
    }
    if (filter.text) {
        params.set("q", filter.text);
    }
    if (filter.meetingId) {
        params.set("meeting", filter.meetingId);
    }
    return params.toString();
}
