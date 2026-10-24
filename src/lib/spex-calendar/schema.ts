import {z} from "zod";

// Validation messages are keys under "Validation" in messages/{sv,en}.json; the server checks the same rules.

export const MAX_SPEX_DATE_LABEL = 100;

export const spexCalendarDateValuesSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "dateInvalid"),
    label: z.string().trim().min(1, "spexDateLabelRequired").max(MAX_SPEX_DATE_LABEL, "spexDateLabelTooLong"),
});

export type SpexCalendarDateValues = z.infer<typeof spexCalendarDateValuesSchema>;

export const spexCalendarDateCreateSchema = z.object({values: spexCalendarDateValuesSchema});
export const spexCalendarDateUpdateSchema = z.object({
    id: z.string().min(1),
    version: z.number().int().nonnegative(),
    values: spexCalendarDateValuesSchema
});
export const spexCalendarDateDeleteSchema = z.object({id: z.string().min(1), version: z.number().int().nonnegative()});
