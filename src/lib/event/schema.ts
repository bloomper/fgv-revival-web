import {z} from "zod";
import {daysBetween} from "@/lib/event/dates";

// Validation messages are keys under "Validation" in messages/{sv,en}.json. The server checks the same rules (M4).

export const MAX_EVENT_TITLE = 255;
export const MAX_EVENT_LOCATION = 255;
export const MAX_EVENT_DESCRIPTION = 4000;
/** An event may last at most this many days after its first. */
export const MAX_EVENT_SPAN = 31;
export const MAX_EVENT_TYPE_NAME = 100;
export const MAX_EVENT_TYPE_TEXT = 4000;
export const MAX_OFFSET_DAYS = 730;
export const MAX_EVENT_TYPE_DAYS = 14;

const id = z.string().min(1);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "dateInvalid");
const time = z.union([z.literal(""), z.string().trim().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "timeInvalid")]);

/**
 * The event dialog. Without a type the title is required; with one it defaults to the type's name. A blank end date
 * means the server's default (the type's length, or one day).
 */
export const eventValuesSchema = z.object({
    typeId: z.string(),
    title: z.string().trim().max(MAX_EVENT_TITLE, "eventTitleTooLong"),
    startDate: date,
    endDate: z.union([z.literal(""), date]),
    startTime: time,
    endTime: time,
    location: z.string().trim().max(MAX_EVENT_LOCATION, "eventLocationTooLong"),
    description: z.string().trim().max(MAX_EVENT_DESCRIPTION, "eventDescriptionTooLong"),
    revivalPays: z.boolean(),
}).superRefine((values, ctx) => {
    if (!values.typeId && !values.title) {
        ctx.addIssue({code: "custom", message: "eventTitleRequired", path: ["title"]});
    }
    if (values.endDate) {
        const span = daysBetween(values.startDate, values.endDate);

        if (span < 0) {
            ctx.addIssue({code: "custom", message: "eventEndBeforeStart", path: ["endDate"]});
        } else if (span > MAX_EVENT_SPAN) {
            ctx.addIssue({code: "custom", message: "eventTooLong", path: ["endDate"]});
        }
    }
    if (values.endTime && !values.startTime) {
        ctx.addIssue({code: "custom", message: "eventEndTimeWithoutStart", path: ["endTime"]});
    } else if (values.endTime && (!values.endDate || values.endDate === values.startDate) && values.endTime < values.startTime) {
        ctx.addIssue({code: "custom", message: "eventEndTimeBeforeStart", path: ["endTime"]});
    }
});

export type EventValues = z.infer<typeof eventValuesSchema>;

export const eventCreateSchema = z.object({revivalId: id, values: eventValuesSchema});
export const eventUpdateSchema = z.object({id, version: z.number().int(), revivalId: id, values: eventValuesSchema});
export const eventTransitionSchema = z.object({id, version: z.number().int(), revivalId: id});
export const calendarFeedSchema = z.object({revivalId: id});

const offset = z.string().trim().regex(/^(-?\d{1,3})?$/, "offsetInvalid");
const localized = z.object({
    sv: z.string().trim().max(MAX_EVENT_TYPE_TEXT, "eventTypeTextTooLong"),
    en: z.string().trim().max(MAX_EVENT_TYPE_TEXT, "eventTypeTextTooLong"),
});

/**
 * The event type dialog. Numbers are kept as the typed text and converted by {@link toEventTypeInput}.
 */
export const eventTypeValuesSchema = z.object({
    name: z.object({
        sv: z.string().trim().min(1, "catalogNameRequired").max(MAX_EVENT_TYPE_NAME, "catalogNameTooLong"),
        en: z.string().trim().max(MAX_EVENT_TYPE_NAME, "catalogNameTooLong"),
    }),
    description: localized,
    rooms: localized,
    catering: localized,
    offsetMinDays: offset,
    offsetMaxDays: offset,
    days: z.string().trim().regex(/^\d{1,2}$/, "eventDaysInvalid"),
    revivalPays: z.boolean(),
    checklistTemplateId: z.string(),
}).superRefine((values, ctx) => {
    const min = values.offsetMinDays;
    const max = values.offsetMaxDays;
    const days = Number(values.days);

    if (/^\d{1,2}$/.test(values.days) && (days < 1 || days > MAX_EVENT_TYPE_DAYS)) {
        ctx.addIssue({code: "custom", message: "eventDaysInvalid", path: ["days"]});
    }
    if (!min !== !max) {
        ctx.addIssue({code: "custom", message: "offsetBothOrNeither", path: [min ? "offsetMaxDays" : "offsetMinDays"]});
    }
    for (const key of ["offsetMinDays", "offsetMaxDays"] as const) {
        if (values[key] && Math.abs(Number(values[key])) > MAX_OFFSET_DAYS) {
            ctx.addIssue({code: "custom", message: "offsetInvalid", path: [key]});
        }
    }
    if (min && max && Number(min) > Number(max)) {
        ctx.addIssue({code: "custom", message: "offsetOrder", path: ["offsetMaxDays"]});
    }
    for (const key of ["description", "rooms", "catering"] as const) {
        if (values[key].en && !values[key].sv) {
            ctx.addIssue({code: "custom", message: "swedishRequired", path: [key, "sv"]});
        }
    }
});

export type EventTypeValues = z.infer<typeof eventTypeValuesSchema>;

export const eventTypeCreateSchema = z.object({values: eventTypeValuesSchema});
export const eventTypeUpdateSchema = z.object({
    id,
    version: z.number().int().nonnegative(),
    values: eventTypeValuesSchema
});
export const eventTypeTransitionSchema = z.object({id, version: z.number().int().nonnegative()});
export const eventTypeMoveSchema = eventTypeTransitionSchema.extend({position: z.number().int().nonnegative()});

const text = (value: { sv: string; en: string }) => value.sv ? {sv: value.sv, en: value.en || null} : null;

/**
 * The GraphQL input for validated dialog values: blank texts clear, blank offsets mean the type is never proposed.
 */
export function toEventTypeInput(values: EventTypeValues) {
    return {
        name: {sv: values.name.sv, en: values.name.en || null},
        description: text(values.description),
        rooms: text(values.rooms),
        catering: text(values.catering),
        offsetMinDays: values.offsetMinDays ? Number(values.offsetMinDays) : null,
        offsetMaxDays: values.offsetMaxDays ? Number(values.offsetMaxDays) : null,
        days: Number(values.days),
        revivalPays: values.revivalPays,
        checklistTemplateId: values.checklistTemplateId || null,
    };
}
