import {z} from "zod";
import {catalogId} from "@/lib/catalog/schema";

// Validation messages are keys under "Validation" in messages/{sv,en}.json. The server checks the same rules
// (M3 FR-024–FR-026, data-model.md).

export const MAX_ITEM_TEXT = 1000;
export const MAX_ITEM_COMMENT = 2000;
export const MAX_REASON = 1000;

const id = z.string().min(1);
const owner = z.object({
    personId: id.nullable().optional(),
    name: z.string().trim().min(1, "ownerNameRequired").max(100, "ownerNameTooLong").nullable().optional()
}).nullable();

export const checklistItemValuesSchema = z.object({
    text: z.string().trim().max(MAX_ITEM_TEXT, "itemTextTooLong").optional(),
    owner,
    deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "dateInvalid").nullable().optional(),
    comment: z.string().trim().max(MAX_ITEM_COMMENT, "itemCommentTooLong").optional(),
});

export type ChecklistItemValues = z.infer<typeof checklistItemValuesSchema>;

export const checklistItemCreateSchema = z.object({
    checklistId: id,
    revivalId: id,
    values: checklistItemValuesSchema.extend({text: z.string().trim().min(1, "itemTextRequired").max(MAX_ITEM_TEXT, "itemTextTooLong")}),
});
export const checklistItemUpdateSchema = z.object({
    id,
    version: z.number().int(),
    revivalId: id,
    values: checklistItemValuesSchema
});
export const checklistItemStateSchema = z.object({
    id,
    version: z.number().int(),
    revivalId: id,
    state: z.enum(["OPEN", "DONE", "NOT_APPLICABLE"]),
    reason: z.string().trim().max(MAX_REASON, "reasonTooLong").optional(),
});

export type ChecklistFilterValues = { mine?: true; open?: true; overdue?: true; requiredOnly?: true };

export const CHECKLIST_FILTERS = ["mine", "open", "overdue", "requiredOnly"] as const;

export function parseChecklistFilter(query: Record<string, string | string[] | undefined>): ChecklistFilterValues | null {
    const filter: ChecklistFilterValues = {};

    for (const key of CHECKLIST_FILTERS) {
        if (query[key] === "1") {
            filter[key] = true;
        }
    }
    return Object.keys(filter).length > 0 ? filter : null;
}

export function checklistFilterQuery(filter: ChecklistFilterValues | null, toggle: keyof ChecklistFilterValues): string {
    const params = new URLSearchParams();

    for (const key of CHECKLIST_FILTERS) {
        if (key === toggle ? !filter?.[key] : filter?.[key]) {
            params.set(key, "1");
        }
    }
    const query = params.toString();

    return query ? `?${query}` : "";
}

export const MAX_TEMPLATE_NAME = 255;

const localized = (max: number, required: string, tooLong: string) => z.object({
    sv: z.string().trim().min(1, required).max(max, tooLong),
    en: z.string().trim().max(max, tooLong).optional(),
});

export const templateCreateSchema = z.discriminatedUnion("kind", [
    z.object({kind: z.literal("CHAPTER"), chapterKey: z.string().min(1)}),
    z.object({
        kind: z.literal("EVENT"),
        name: localized(MAX_TEMPLATE_NAME, "templateNameRequired", "templateNameTooLong")
    }),
]);

const relativeDeadline = z.object({
    kind: z.enum(["DAYS", "WORKING_DAYS", "WEEKDAY_WEEK_BEFORE"]),
    amount: z.number().int().min(-365, "deadlineAmount").max(365, "deadlineAmount").nullable().optional(),
    weekday: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]).nullable().optional(),
}).nullable();

export const templateItemValuesSchema = z.object({
    text: localized(MAX_ITEM_TEXT, "itemTextRequired", "itemTextTooLong"),
    guideItemKey: z.string().nullable(),
    defaultCapability: catalogId.nullable(),
    deadline: relativeDeadline,
});

export type TemplateItemValues = z.infer<typeof templateItemValuesSchema>;

export const templateItemSaveSchema = z.object({
    templateId: id,
    item: z.object({id, version: z.number().int()}).nullable(),
    values: templateItemValuesSchema,
});

export const templateItemTransitionSchema = z.object({
    templateId: id,
    id,
    version: z.number().int(),
    position: z.number().int().min(0).optional()
});

export const eventChecklistValuesSchema = z.object({
    name: z.string().trim().min(1, "checklistNameRequired").max(MAX_TEMPLATE_NAME, "checklistNameTooLong"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "dateInvalid").nullable(),
    templateId: z.string().nullable().optional(),
});

export type EventChecklistValues = z.infer<typeof eventChecklistValuesSchema>;

export const eventChecklistSaveSchema = z.object({
    revivalId: id,
    checklist: z.object({id, version: z.number().int()}).nullable(),
    values: eventChecklistValuesSchema,
});

export const checklistTransitionSchema = z.object({
    revivalId: id,
    id,
    version: z.number().int(),
    templateId: z.string().nullable().optional()
});
