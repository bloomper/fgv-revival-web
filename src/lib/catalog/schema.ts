import {z} from "zod";

// Validation messages are keys under "Validation" in messages/{sv,en}.json. The server checks the same rules.

export const MAX_CATALOG_NAME = 100;

export const GUIDE_ITEM_KINDS = ["TIP", "REQUIREMENT", "QUESTION", "TEXT"] as const;

/**
 * An entry's id: one of the original constant names (FINANCE, TIP, …) or a UUID.
 */
export const catalogId = z.string().trim().min(1).max(36);

export const catalogNameSchema = z.object({
    sv: z.string().trim().min(1, "catalogNameRequired").max(MAX_CATALOG_NAME, "catalogNameTooLong"),
    en: z.string().trim().max(MAX_CATALOG_NAME, "catalogNameTooLong").optional().nullable(),
});

export type CatalogNameValues = z.infer<typeof catalogNameSchema>;

export const catalogCreateSchema = z.object({
    name: catalogNameSchema,
    kind: z.enum(GUIDE_ITEM_KINDS).optional(),
});

export const catalogUpdateSchema = z.object({
    id: catalogId,
    version: z.number().int().nonnegative(),
    name: catalogNameSchema,
});

export const catalogTransitionSchema = z.object({
    id: catalogId,
    version: z.number().int().nonnegative(),
});

export const catalogMoveSchema = catalogTransitionSchema.extend({
    position: z.number().int().nonnegative(),
});
