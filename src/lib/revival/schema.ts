import {z} from "zod";
import {catalogId} from "@/lib/catalog/schema";

// Validation messages are keys under "Validation" in messages/{sv,en}.json, translated where they are shown.

export const MIN_YEAR = 1948;
export const MAX_YEAR = 2100;
export const MAX_VENUES = 20;

export const REVIVAL_STATUSES = ["PROPOSED", "APPROVED", "ORGANISING", "OPEN", "CLOSING", "SETTLING", "ARCHIVED", "REJECTED"] as const;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "dateInvalid").refine(value => !Number.isNaN(Date.parse(value)), "dateInvalid");

export const revivalCreateSchema = z.object({
    spexId: z.string().min(1, "spexRequired"),
    year: z.coerce.number<number>().int("yearRange").min(MIN_YEAR, "yearRange").max(MAX_YEAR, "yearRange"),
});

export type RevivalCreateValues = z.infer<typeof revivalCreateSchema>;

export const revivalCoreSchema = revivalCreateSchema.extend({
    id: z.string().min(1),
    version: z.number().int(),
});

/**
 * The years a revival of the spex may have, newest first as in Spexregister: not before the original, and for a new
 * revival not before this year either. The server checks the same.
 */
export function revivalYears(originalYear: number | null | undefined, options: { fromThisYear: boolean; include?: number }): number[] {
    const thisYear = new Date().getFullYear();
    const first = Math.max(originalYear ?? MIN_YEAR, options.fromThisYear ? thisYear : MIN_YEAR);
    const last = Math.max(thisYear + 5, options.include ?? 0);

    return Array.from({length: Math.max(0, last - first + 1)}, (_, index) => last - index);
}

/**
 * The directeur's details, checked against the revival's year (FR-011). The server checks the same rules.
 */
export const revivalDetailsSchema = (year: number) => z.object({
    premiereDate: z.union([z.literal(""), isoDate]),
    showDates: z.array(isoDate),
    venues: z.array(z.string().trim().min(1, "venueBlank").max(255, "venueBlank")).max(MAX_VENUES, "venuesTooMany"),
}).superRefine((values, ctx) => {
    if (values.premiereDate && Number(values.premiereDate.slice(0, 4)) !== year) {
        ctx.addIssue({code: "custom", path: ["premiereDate"], message: "premiereYear"});
    }
    values.showDates.forEach((date, index) => {
        if (!values.premiereDate) {
            ctx.addIssue({code: "custom", path: ["showDates", index], message: "showDateWithoutPremiere"});
        } else if (date < values.premiereDate) {
            ctx.addIssue({code: "custom", path: ["showDates", index], message: "showDateBeforePremiere"});
        }
    });
});

export type RevivalDetailsValues = z.infer<ReturnType<typeof revivalDetailsSchema>>;

export const revivalStatusChangeSchema = z.object({
    id: z.string().min(1),
    from: z.enum(REVIVAL_STATUSES),
    to: z.enum(REVIVAL_STATUSES),
});

export const memberAddSchema = z.object({
    revivalId: z.string().min(1),
    email: z.email("emailInvalid"),
    role: z.enum(["DIRECTEUR", "STEERING_GROUP"]),
    capabilities: z.array(catalogId).default([]),
});

export const memberCapabilitiesSchema = z.object({
    id: z.string().min(1),
    version: z.number().int(),
    capabilities: z.array(catalogId),
});
