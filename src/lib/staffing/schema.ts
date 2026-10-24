import {z} from "zod";

// Validation messages are keys under "Validation" in messages/{sv,en}.json. The server checks the same rules
// (staffing.graphqls, M6B-FR-1/2); these only give quicker feedback.

export const MAX_TASK = 100;
export const MAX_NEEDED = 100;
export const MAX_SLOT_COMMENT = 1000;
export const MAX_AVAILABILITY_COMMENT = 255;

export const AVAILABILITY_ANSWERS = ["YES", "MAYBE", "NO"] as const;

const id = z.string().min(1);
const version = z.number().int().nonnegative();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "dateInvalid");
const time = z.string().trim().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "timeInvalid");

/**
 * A shift slot: a day of the event, a time span on it, the task and how many it needs. Numbers are kept as typed text.
 */
export const shiftSlotValuesSchema = z.object({
    date,
    startTime: time,
    endTime: time,
    task: z.string().trim().min(1, "taskRequired").max(MAX_TASK, "taskTooLong"),
    needed: z.string().trim().regex(/^\d{1,3}$/, "neededInvalid")
        .refine(value => Number(value) >= 1 && Number(value) <= MAX_NEEDED, "neededInvalid"),
    comment: z.string().trim().max(MAX_SLOT_COMMENT, "slotCommentTooLong"),
}).superRefine((values, ctx) => {
    if (values.startTime && values.endTime && values.endTime <= values.startTime) {
        ctx.addIssue({code: "custom", message: "slotEndBeforeStart", path: ["endTime"]});
    }
});

export type ShiftSlotValues = z.infer<typeof shiftSlotValuesSchema>;

export const shiftSlotCreateSchema = z.object({revivalId: id, eventId: id, values: shiftSlotValuesSchema});
export const shiftSlotUpdateSchema = z.object({revivalId: id, id, version, values: shiftSlotValuesSchema});
export const shiftSlotRemoveSchema = z.object({revivalId: id, id, version});
export const shiftAssignmentSchema = z.object({revivalId: id, slotId: id, participantId: id});
export const shiftOwnSchema = z.object({revivalId: id, slotId: id});

/** The GraphQL input for validated slot values. */
export function toShiftSlotInput(values: ShiftSlotValues, eventId?: string) {
    return {
        ...(eventId ? {eventId} : {}),
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
        task: values.task,
        needed: Number(values.needed),
        comment: values.comment || null,
    };
}

/** One day of an event on the participant's page: an answer ("" for none yet) and a comment. */
export const availabilityDayValuesSchema = z.object({
    date,
    answer: z.union([z.literal(""), z.enum(AVAILABILITY_ANSWERS)]),
    comment: z.string().trim().max(MAX_AVAILABILITY_COMMENT, "availabilityCommentTooLong"),
});

export type AvailabilityDayValues = z.infer<typeof availabilityDayValuesSchema>;

export const availabilityValuesSchema = z.object({days: z.array(availabilityDayValuesSchema).max(31)});

export type AvailabilityValues = z.infer<typeof availabilityValuesSchema>;

export const availabilitySchema = z.object({revivalId: id, eventId: id, values: availabilityValuesSchema});
