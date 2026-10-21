import {z} from "zod";

// Validation messages are keys under "Validation" in messages/{sv,en}.json. The server checks the same rules
// (FR-009a, FR-014, data-model.md).

export const MAX_IMPORT_BYTES = 10 * 1024 * 1024;
export const MAX_LABEL = 32;
export const MAX_NOTE = 2000;
export const MAX_ITEM_TEXT = 5000;
export const MAX_TITLE = 255;
export const MAX_INTRODUCTION = 20000;
export const MAX_REASON = 2000;

export const PHASES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"] as const;
export const GUIDE_ITEM_TYPES = ["TIP", "REQUIREMENT", "QUESTION", "TEXT"] as const;

export const guidePublishSchema = z.object({
    id: z.string().min(1),
    version: z.number().int(),
    label: z.string().trim().min(1, "labelRequired").max(MAX_LABEL, "labelTooLong"),
    note: z.string().trim().max(MAX_NOTE, "noteTooLong").optional(),
});

export type GuidePublishValues = z.infer<typeof guidePublishSchema>;

export const guideDiscardSchema = z.object({
    id: z.string().min(1),
    version: z.number().int(),
});

const localized = (max: number, blankMessage: string, tooLongMessage: string) => z.object({
    sv: z.string().trim().min(1, blankMessage).max(max, tooLongMessage),
    en: z.string().trim().max(max, tooLongMessage).optional().nullable(),
});

export const guideItemTextSchema = localized(MAX_ITEM_TEXT, "guideTextRequired", "guideTextTooLong");
export const guideTitleSchema = localized(MAX_TITLE, "guideTitleRequired", "guideTitleTooLong");
export const guideIntroductionSchema = z.object({
    sv: z.string().trim().max(MAX_INTRODUCTION, "guideIntroductionTooLong"),
    en: z.string().trim().max(MAX_INTRODUCTION, "guideIntroductionTooLong").optional().nullable(),
});

export const guideItemSchema = z.object({
    type: z.enum(GUIDE_ITEM_TYPES),
    text: guideItemTextSchema,
});

export type GuideItemValues = z.infer<typeof guideItemSchema>;
export type GuideTitleValues = z.infer<typeof guideTitleSchema>;

const id = z.string().min(1);
const version = z.number().int();

export const guideIntroductionUpdateSchema = z.object({versionId: id, version, introduction: guideIntroductionSchema});
export const guideChapterUpdateSchema = z.object({id, version, title: guideTitleSchema});
export const guideSectionCreateSchema = z.object({chapterId: id, position: z.number().int().nullable().optional(), title: guideTitleSchema});
export const guideSectionUpdateSchema = z.object({id, version, title: guideTitleSchema});
export const guideSectionMoveSchema = z.object({id, version, chapterId: id, position: z.number().int().min(0)});
export const guideRemoveSchema = z.object({id, version});
export const guideItemCreateSchema = z.object({
    chapterId: id, sectionId: id.nullable().optional(), position: z.number().int().nullable().optional(), ...guideItemSchema.shape,
});
export const guideItemUpdateSchema = z.object({id, version, ...guideItemSchema.shape});
export const guideItemMoveSchema = z.object({id, version, chapterId: id, sectionId: id.nullable().optional(), position: z.number().int().min(0)});
export const revivalGuideVersionChangeSchema = z.object({revivalId: id, fromVersionId: id.nullable(), toVersionId: id});

export const SUGGESTION_KINDS = ["CHANGE", "REMOVE", "ADD"] as const;
export const SUGGESTION_STATUSES = ["OPEN", "ACCEPTED", "REJECTED", "WITHDRAWN"] as const;

const optionalText = z.string().trim().max(MAX_ITEM_TEXT, "guideTextTooLong").optional().nullable();

export const guideSuggestionSchema = z.object({
    kind: z.enum(SUGGESTION_KINDS),
    proposedType: z.enum(GUIDE_ITEM_TYPES).optional().nullable(),
    proposedTextSv: optionalText,
    proposedTextEn: optionalText,
    reason: z.string().trim().max(MAX_REASON, "reasonTooLong").optional().nullable(),
}).superRefine((values, ctx) => {
    if (values.kind !== "ADD" && !values.reason) {
        ctx.addIssue({code: "custom", path: ["reason"], message: "reasonRequired"});
    }
    if (values.kind === "CHANGE" && !values.proposedType && !values.proposedTextSv && !values.proposedTextEn) {
        ctx.addIssue({code: "custom", path: ["proposedTextSv"], message: "suggestionContentRequired"});
    }
    if (values.kind === "ADD" && !values.proposedTextSv && !values.proposedTextEn) {
        ctx.addIssue({code: "custom", path: ["proposedTextSv"], message: "guideTextRequired"});
    }
});

export type GuideSuggestionValues = z.infer<typeof guideSuggestionSchema>;

export const guideSuggestionCreateSchema = z.object({
    revivalId: id,
    versionId: id,
    itemKey: id.nullable().optional(),
    phase: z.enum(PHASES).nullable().optional(),
    sectionKey: id.nullable().optional(),
    values: guideSuggestionSchema,
});

export const guideSuggestionAcceptSchema = z.object({
    id, version,
    note: z.string().trim().max(MAX_REASON, "reasonTooLong").optional().nullable(),
    resolution: z.object({keep: z.boolean().optional(), type: z.enum(GUIDE_ITEM_TYPES).optional().nullable(), text: guideItemTextSchema.optional().nullable()}).optional().nullable(),
});

export const guideSuggestionRejectSchema = z.object({id, version, reason: z.string().trim().max(MAX_REASON, "reasonTooLong").optional().nullable()});
