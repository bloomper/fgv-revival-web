import {z} from "zod";
import {catalogId} from "@/lib/catalog/schema";

export const MAX_NOTE = 2000;
export const MAX_ITEM_TEXT = 5000;
export const MAX_TITLE = 255;
export const MAX_INTRODUCTION = 20000;
export const MAX_REASON = 2000;

// The server labels a published version itself (v1, v2, …); the note says what changed.
export const guidePublishSchema = z.object({
    id: z.string().min(1),
    version: z.number().int(),
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
    type: catalogId,
    text: guideItemTextSchema,
    /** The reference library entries it links to; left out, an update keeps them. */
    libraryEntryIds: z.array(z.string().min(1)).optional(),
});

export type GuideItemValues = z.infer<typeof guideItemSchema>;
export type GuideTitleValues = z.infer<typeof guideTitleSchema>;

const id = z.string().min(1);
const version = z.number().int();

export const guideIntroductionUpdateSchema = z.object({versionId: id, version, introduction: guideIntroductionSchema});
export const guideChapterCreateSchema = z.object({
    versionId: id,
    position: z.number().int().min(0).nullable().optional(),
    title: guideTitleSchema
});
export const guideChapterUpdateSchema = z.object({id, version, title: guideTitleSchema});
export const guideChapterMoveSchema = z.object({id, version, position: z.number().int().min(0)});
export const guideSectionCreateSchema = z.object({
    chapterId: id,
    position: z.number().int().nullable().optional(),
    title: guideTitleSchema
});
export const guideSectionUpdateSchema = z.object({id, version, title: guideTitleSchema});
export const guideSectionMoveSchema = z.object({id, version, chapterId: id, position: z.number().int().min(0)});
export const guideRemoveSchema = z.object({id, version});
export const guideItemCreateSchema = z.object({
    chapterId: id,
    sectionId: id.nullable().optional(),
    position: z.number().int().nullable().optional(), ...guideItemSchema.shape,
});
export const guideItemUpdateSchema = z.object({id, version, ...guideItemSchema.shape});
export const guideItemMoveSchema = z.object({
    id,
    version,
    chapterId: id,
    sectionId: id.nullable().optional(),
    position: z.number().int().min(0)
});
export const revivalGuideVersionChangeSchema = z.object({revivalId: id, fromVersionId: id.nullable(), toVersionId: id});

export const SUGGESTION_KINDS = ["CHANGE", "REMOVE", "ADD"] as const;
export const SUGGESTION_STATUSES = ["OPEN", "ACCEPTED", "REJECTED", "WITHDRAWN"] as const;

const optionalText = z.string().trim().max(MAX_ITEM_TEXT, "guideTextTooLong").optional().nullable();

export const guideSuggestionSchema = z.object({
    kind: z.enum(SUGGESTION_KINDS),
    proposedType: catalogId.optional().nullable(),
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
    chapterKey: id.nullable().optional(),
    sectionKey: id.nullable().optional(),
    values: guideSuggestionSchema,
});

export const guideSuggestionAcceptSchema = z.object({
    id, version,
    note: z.string().trim().max(MAX_REASON, "reasonTooLong").optional().nullable(),
    resolution: z.object({
        keep: z.boolean().optional(),
        type: catalogId.optional().nullable(),
        text: guideItemTextSchema.optional().nullable()
    }).optional().nullable(),
});

export const guideSuggestionRejectSchema = z.object({
    id,
    version,
    reason: z.string().trim().max(MAX_REASON, "reasonTooLong").optional().nullable()
});
