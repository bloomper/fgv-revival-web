import {describe, expect, it} from "vitest";
import {
    MAX_SPEX_DATE_LABEL,
    spexCalendarDateCreateSchema,
    spexCalendarDateDeleteSchema,
    spexCalendarDateUpdateSchema,
    spexCalendarDateValuesSchema
} from "@/lib/spex-calendar/schema";

const messages = (input: unknown) => spexCalendarDateValuesSchema.safeParse(input).error?.issues.map(issue => issue.message) ?? [];

describe("spex calendar schemas", () => {
    it("accepts a dated label", () => {
        expect(spexCalendarDateCreateSchema.safeParse({values: {date: "2026-05-01", label: "Premiär"}}).success).toBe(true);
        expect(spexCalendarDateUpdateSchema.safeParse({id: "d1", version: 0, values: {date: "2026-05-01", label: "Premiär"}}).success).toBe(true);
    });

    it("needs a valid date and a label within the limit", () => {
        expect(messages({date: "maj", label: ""})).toEqual(["dateInvalid", "spexDateLabelRequired"]);
        expect(messages({date: "2026-05-01", label: "x".repeat(MAX_SPEX_DATE_LABEL + 1)})).toEqual(["spexDateLabelTooLong"]);
        expect(spexCalendarDateDeleteSchema.safeParse({id: "d1", version: -1}).success).toBe(false);
    });
});
