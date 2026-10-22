import {z} from "zod";

// Validation messages are keys under "Validation" in messages/{sv,en}.json. The server checks the same rules
// (M3 FR-016, data-model.md).

export const MAX_MEETING_TITLE = 255;
export const MAX_OTHERS_PRESENT = 1000;
export const MAX_AGENDA_POINT = 1000;

const id = z.string().min(1);

export const meetingValuesSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "dateInvalid"),
    title: z.string().trim().max(MAX_MEETING_TITLE, "meetingTitleTooLong").optional(),
    attendeeIds: z.array(id),
    othersPresent: z.string().trim().max(MAX_OTHERS_PRESENT, "othersPresentTooLong").optional(),
    agendaPoints: z.array(z.string().trim().min(1, "agendaPointInvalid").max(MAX_AGENDA_POINT, "agendaPointInvalid")),
});

export type MeetingValues = z.infer<typeof meetingValuesSchema>;

export const meetingCreateSchema = z.object({revivalId: id, values: meetingValuesSchema});
export const meetingUpdateSchema = z.object({id, version: z.number().int(), revivalId: id, values: meetingValuesSchema});
export const meetingTransitionSchema = z.object({id, version: z.number().int(), revivalId: id});
export const minutesEmailSchema = z.object({meetingId: id, revivalId: id, language: z.enum(["sv", "en"])});
export const minutesRetrySchema = z.object({emailId: id, revivalId: id, meetingId: id});
