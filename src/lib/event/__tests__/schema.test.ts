import {describe, expect, it} from "vitest";
import {
    type EventTypeValues,
    eventTypeValuesSchema,
    type EventValues,
    eventValuesSchema,
    toEventTypeInput
} from "@/lib/event/schema";

const values = (overrides: Partial<EventValues> = {}): EventValues => ({
    typeId: "",
    title: "Förrådsbesök",
    startDate: "2028-01-01",
    endDate: "",
    startTime: "",
    endTime: "",
    location: "",
    description: "",
    revivalPays: false, ...overrides,
});

const messages = (result: {
    success: boolean;
    error?: { issues: { message: string }[] }
}) => result.error?.issues.map(issue => issue.message) ?? [];

describe("eventValuesSchema", () => {
    it("accepts a free event with a title, and a typed one without", () => {
        expect(eventValuesSchema.safeParse(values()).success).toBe(true);
        expect(eventValuesSchema.safeParse(values({typeId: "3", title: ""})).success).toBe(true);
    });

    it("requires a title without a type", () => {
        expect(messages(eventValuesSchema.safeParse(values({title: "  "})))).toEqual(["eventTitleRequired"]);
    });

    it("keeps the end within 31 days after the start", () => {
        expect(messages(eventValuesSchema.safeParse(values({endDate: "2027-12-31"})))).toEqual(["eventEndBeforeStart"]);
        expect(eventValuesSchema.safeParse(values({endDate: "2028-02-01"})).success).toBe(true);
        expect(messages(eventValuesSchema.safeParse(values({endDate: "2028-02-02"})))).toEqual(["eventTooLong"]);
    });

    it("checks times: HH:mm, an end only with a start, not before it on one day", () => {
        expect(messages(eventValuesSchema.safeParse(values({startTime: "25:00"})))).toEqual(["timeInvalid"]);
        expect(messages(eventValuesSchema.safeParse(values({endTime: "18:00"})))).toEqual(["eventEndTimeWithoutStart"]);
        expect(messages(eventValuesSchema.safeParse(values({
            startTime: "18:00",
            endTime: "17:00"
        })))).toEqual(["eventEndTimeBeforeStart"]);
        expect(eventValuesSchema.safeParse(values({
            startTime: "18:00",
            endTime: "17:00",
            endDate: "2028-01-02"
        })).success).toBe(true);
    });

    it("limits the location and description", () => {
        expect(messages(eventValuesSchema.safeParse(values({location: "x".repeat(256)})))).toEqual(["eventLocationTooLong"]);
        expect(messages(eventValuesSchema.safeParse(values({description: "x".repeat(4001)})))).toEqual(["eventDescriptionTooLong"]);
    });
});

const type = (overrides: Partial<EventTypeValues> = {}): EventTypeValues => ({
    name: {sv: "Rephelg 1", en: ""}, description: {sv: "", en: ""}, rooms: {sv: "", en: ""}, catering: {sv: "", en: ""},
    offsetMinDays: "-70", offsetMaxDays: "-56", days: "2", revivalPays: true, checklistTemplateId: "", ...overrides,
});

describe("eventTypeValuesSchema", () => {
    it("takes both offsets or neither, in order and in range", () => {
        expect(eventTypeValuesSchema.safeParse(type()).success).toBe(true);
        expect(eventTypeValuesSchema.safeParse(type({offsetMinDays: "", offsetMaxDays: ""})).success).toBe(true);
        expect(messages(eventTypeValuesSchema.safeParse(type({offsetMaxDays: ""})))).toEqual(["offsetBothOrNeither"]);
        expect(messages(eventTypeValuesSchema.safeParse(type({offsetMinDays: "-50"})))).toEqual(["offsetOrder"]);
        expect(messages(eventTypeValuesSchema.safeParse(type({offsetMinDays: "-800"})))).toEqual(["offsetInvalid"]);
        expect(messages(eventTypeValuesSchema.safeParse(type({offsetMinDays: "abc"})))).toContain("offsetInvalid");
    });

    it("takes 1–14 days and a Swedish text before an English one", () => {
        expect(messages(eventTypeValuesSchema.safeParse(type({days: "0"})))).toEqual(["eventDaysInvalid"]);
        expect(messages(eventTypeValuesSchema.safeParse(type({days: "15"})))).toEqual(["eventDaysInvalid"]);
        expect(messages(eventTypeValuesSchema.safeParse(type({
            rooms: {
                sv: "",
                en: "Two rooms"
            }
        })))).toEqual(["swedishRequired"]);
    });

    it("turns the values into the GraphQL input, clearing blank texts", () => {
        expect(toEventTypeInput(type({description: {sv: "Övningshelg", en: ""}}))).toEqual({
            name: {sv: "Rephelg 1", en: null},
            description: {sv: "Övningshelg", en: null},
            rooms: null,
            catering: null,
            offsetMinDays: -70,
            offsetMaxDays: -56,
            days: 2,
            revivalPays: true,
            checklistTemplateId: null,
        });
        expect(toEventTypeInput(type({offsetMinDays: "", offsetMaxDays: ""}))).toMatchObject({
            offsetMinDays: null,
            offsetMaxDays: null
        });
    });
});
