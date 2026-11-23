import {describe, expect, it} from "vitest";
import {isCalendarDate, isoDate, optionalIsoDate} from "@/lib/date-schema";

describe("date schema", () => {
    it("accepts only dates that exist in the calendar", () => {
        expect(isCalendarDate("2024-02-29")).toBe(true);
        expect(isCalendarDate("2026-02-31")).toBe(false);
        expect(isCalendarDate("2025-02-29")).toBe(false);
        expect(isCalendarDate("2026-13-01")).toBe(false);
        expect(isCalendarDate("2026-1-01")).toBe(false);
        expect(isCalendarDate("")).toBe(false);
    });

    it("reports the dateInvalid key, and allows an empty optional date", () => {
        expect(isoDate.safeParse("2026-02-31").error?.issues[0].message).toBe("dateInvalid");
        expect(isoDate.safeParse("2026-02-28").success).toBe(true);
        expect(optionalIsoDate.safeParse("").success).toBe(true);
        expect(optionalIsoDate.safeParse("2026-04-31").success).toBe(false);
    });
});
