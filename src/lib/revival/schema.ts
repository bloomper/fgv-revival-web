import {z} from "zod";
import {catalogId} from "@/lib/catalog/schema";

export const MIN_YEAR = 1948;
export const MAX_YEAR = 2100;
export const MAX_SHOWS = 50;
export const MAX_VENUE = 255;

export const REVIVAL_STATUSES = ["PROPOSED", "APPROVED", "ORGANISING", "OPEN", "CLOSING", "SETTLING", "ARCHIVED", "REJECTED"] as const;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "dateInvalid").refine(value => !Number.isNaN(Date.parse(value)), "dateInvalid");

export const revivalCreateSchema = z.object({
    spexId: z.string().min(1, "spexRequired"),
    year: z.coerce.number<number>().int("yearRange").min(MIN_YEAR, "yearRange").max(MAX_YEAR, "yearRange"),
    past: z.boolean(),
});

export type RevivalCreateValues = z.infer<typeof revivalCreateSchema>;

export const revivalCoreSchema = revivalCreateSchema.extend({
    id: z.string().min(1),
    version: z.number().int(),
});

/**
 * The years a revival of the spex may have, newest first as in Spexregister: never before the original, and from this
 * year on unless it has already been played ({@code past}), when only the years before this one. {@code include} keeps
 * the year a revival already has. The server checks the same.
 */
export function revivalYears(originalYear: number | null | undefined, options: {
    past: boolean;
    include?: number
}): number[] {
    const thisYear = new Date().getFullYear();
    const first = Math.max(originalYear ?? MIN_YEAR, options.past ? MIN_YEAR : thisYear);
    const last = options.past ? thisYear - 1 : thisYear + 5;
    const years = Array.from({length: Math.max(0, last - first + 1)}, (_, index) => last - index);

    if (options.include !== undefined && !years.includes(options.include)) {
        years.push(options.include);
        years.sort((a, b) => b - a);
    }
    return years;
}

/**
 * The directeur's details, checked against the revival's year: the premiere, and each show as a date, a start
 * time and a venue, the last two left blank until they are decided. A matinée and an evening show on the same day are
 * two shows. The server checks the same rules.
 */
export const revivalDetailsSchema = (year: number) => z.object({
    premiereDate: z.union([z.literal(""), isoDate]),
    shows: z.array(z.object({
        date: isoDate,
        time: z.union([z.literal(""), z.string().trim().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "timeInvalid")]),
        venue: z.string().trim().max(MAX_VENUE, "venueTooLong"),
    })).max(MAX_SHOWS, "showsTooMany"),
}).superRefine((values, ctx) => {
    if (values.premiereDate && Number(values.premiereDate.slice(0, 4)) !== year) {
        ctx.addIssue({code: "custom", path: ["premiereDate"], message: "premiereYear"});
    }

    const seen = new Set<string>();

    values.shows.forEach((show, index) => {
        const key = `${show.date}\n${show.time}\n${show.venue.toLowerCase()}`;

        if (!values.premiereDate) {
            ctx.addIssue({code: "custom", path: ["shows", index, "date"], message: "showDateWithoutPremiere"});
        } else if (show.date < values.premiereDate) {
            ctx.addIssue({code: "custom", path: ["shows", index, "date"], message: "showDateBeforePremiere"});
        } else if (seen.has(key)) {
            ctx.addIssue({code: "custom", path: ["shows", index, "date"], message: "showDuplicate"});
        }
        seen.add(key);
    });
});

export type RevivalDetailsValues = z.infer<ReturnType<typeof revivalDetailsSchema>>;

export const revivalStatusChangeSchema = z.object({
    id: z.string().min(1),
    from: z.enum(REVIVAL_STATUSES),
    to: z.enum(REVIVAL_STATUSES),
});

export const MAX_MEMBER_NAME = 100;
export const MIN_MEMBER_QUERY = 3;

const memberName = z.string().trim().max(MAX_MEMBER_NAME, "memberNameTooLong").optional();

/**
 * Adding a member by the email of a user in the FGV realm. The names are used only when there is no such user and the
 * server creates one to invite.
 */
export const memberAddSchema = z.object({
    revivalId: z.string().min(1),
    email: z.email("emailInvalid"),
    role: z.enum(["DIRECTEUR", "STEERING_GROUP"]),
    capabilities: z.array(catalogId).default([]),
    firstName: memberName,
    lastName: memberName,
});

export const memberCapabilitiesSchema = z.object({
    id: z.string().min(1),
    version: z.number().int(),
    capabilities: z.array(catalogId),
});
