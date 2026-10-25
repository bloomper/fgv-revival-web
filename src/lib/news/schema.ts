import {z} from "zod";

export const MAX_NEWS_SUBJECT = 255;
export const MAX_NEWS_TEXT = 10000;

const optionalDate = z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, "dateInvalid");

export const newsValuesSchema = z.object({
    subject: z.string().trim().min(1, "newsSubjectRequired").max(MAX_NEWS_SUBJECT, "newsSubjectTooLong"),
    text: z.string().trim().min(1, "newsTextRequired").max(MAX_NEWS_TEXT, "newsTextTooLong"),
    visibleFrom: optionalDate,
    visibleTo: optionalDate,
}).refine(values => !values.visibleTo || (values.visibleFrom !== "" && values.visibleTo >= values.visibleFrom), {
    message: "newsDates",
    path: ["visibleTo"],
});

export type NewsValues = z.infer<typeof newsValuesSchema>;

export const newsCreateSchema = z.object({values: newsValuesSchema});
export const newsUpdateSchema = z.object({
    id: z.string().min(1),
    version: z.number().int().nonnegative(),
    values: newsValuesSchema
});
export const newsDeleteSchema = z.object({id: z.string().min(1), version: z.number().int().nonnegative()});
