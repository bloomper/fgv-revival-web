import {describe, expect, it} from "vitest";
import {
    MAX_MEETING_TITLE,
    meetingCreateSchema,
    meetingTransitionSchema,
    meetingUpdateSchema,
    meetingValuesSchema,
    minutesEmailSchema,
    minutesRetrySchema
} from "@/lib/meeting/schema";

const valid = {date: "2026-03-01", title: "Styrgruppsmöte", attendeeIds: ["p1"], othersPresent: "", agendaPoints: ["Budget"]};
const messages = (input: unknown) => meetingValuesSchema.safeParse(input).error?.issues.map(issue => issue.message) ?? [];

describe("meeting schemas", () => {
    it("accepts a meeting", () => {
        expect(meetingValuesSchema.safeParse(valid).success).toBe(true);
        expect(meetingCreateSchema.safeParse({revivalId: "r1", values: valid}).success).toBe(true);
        expect(meetingUpdateSchema.safeParse({id: "m1", version: 2, revivalId: "r1", values: valid}).success).toBe(true);
    });

    it("refuses a bad date, a long title and an empty agenda point", () => {
        expect(messages({...valid, date: "1 mars"})).toEqual(["dateInvalid"]);
        expect(messages({...valid, title: "x".repeat(MAX_MEETING_TITLE + 1)})).toEqual(["meetingTitleTooLong"]);
        expect(messages({...valid, agendaPoints: [" "]})).toEqual(["agendaPointInvalid"]);
    });

    it("checks the transitions and the minutes emails", () => {
        expect(meetingTransitionSchema.safeParse({id: "m1", version: 1, revivalId: "r1"}).success).toBe(true);
        expect(minutesEmailSchema.safeParse({meetingId: "m1", revivalId: "r1", language: "de"}).success).toBe(false);
        expect(minutesRetrySchema.safeParse({emailId: "e1", revivalId: "r1", meetingId: "m1"}).success).toBe(true);
    });
});
