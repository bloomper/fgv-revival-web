import {describe, expect, it} from "vitest";
import {answerFor, compareSlots, eventDays, overlaps, rankCandidates, slotsByDay, weekdayOf} from "@/lib/staffing/staffing";
import {shiftSlotValuesSchema, toShiftSlotInput} from "@/lib/staffing/schema";

describe("eventDays", () => {
    it("lists every day of the event, first to last", () => {
        expect(eventDays({startDate: "2028-01-15", endDate: "2028-01-16"})).toEqual(["2028-01-15", "2028-01-16"]);
        expect(eventDays({startDate: "2028-02-28", endDate: "2028-03-01"})).toEqual(["2028-02-28", "2028-02-29", "2028-03-01"]);
        expect(eventDays({startDate: "2028-01-15", endDate: "2028-01-15"})).toEqual(["2028-01-15"]);
    });

    it("never runs backwards or past 32 days", () => {
        expect(eventDays({startDate: "2028-01-15", endDate: "2028-01-10"})).toEqual(["2028-01-15"]);
        expect(eventDays({startDate: "2028-01-01", endDate: "2028-12-31"})).toHaveLength(32);
    });
});

describe("weekdayOf", () => {
    it("names the calendar date's weekday", () => {
        expect(weekdayOf("2028-03-04")).toBe("SATURDAY");
        expect(weekdayOf("2028-03-06")).toBe("MONDAY");
    });
});

describe("slots", () => {
    const slot = (date: string, startTime: string, endTime: string, task = "Biljetter") => ({date, startTime, endTime, task});

    it("groups slots by day, in time order", () => {
        const grouped = slotsByDay([slot("2028-01-16", "10:00", "12:00"), slot("2028-01-15", "18:00", "20:00"), slot("2028-01-15", "09:00", "11:00")]);

        expect(grouped.map(([date, slots]) => [date, slots.map(found => found.startTime)])).toEqual([
            ["2028-01-15", ["09:00", "18:00"]],
            ["2028-01-16", ["10:00"]],
        ]);
        expect(compareSlots(slot("2028-01-15", "09:00", "10:00"), slot("2028-01-15", "09:00", "11:00"))).toBeLessThan(0);
    });

    it("finds overlapping slots on the same day only; touching ends do not overlap", () => {
        expect(overlaps(slot("2028-01-15", "18:00", "20:00"), slot("2028-01-15", "19:00", "21:00"))).toBe(true);
        expect(overlaps(slot("2028-01-15", "18:00", "20:00"), slot("2028-01-15", "20:00", "21:00"))).toBe(false);
        expect(overlaps(slot("2028-01-15", "18:00", "20:00"), slot("2028-01-16", "18:00", "20:00"))).toBe(false);
    });
});

describe("rankCandidates", () => {
    it("offers yes first, then maybe, then no answer, and no last, by name within each", () => {
        const person = (name: string, answer: "YES" | "MAYBE" | "NO" | null) => ({id: name, name, kind: "PARTICIPANT" as const, answer});
        const ranked = rankCandidates([person("Örjan", null), person("Bo", "NO"), person("Cia", "MAYBE"), person("Ada", "YES"), person("Ali", null), person("Abe", "YES")]);

        expect(ranked.map(candidate => candidate.name)).toEqual(["Abe", "Ada", "Cia", "Ali", "Örjan", "Bo"]);
    });

    it("finds a person's answer for a day of an event", () => {
        const days = [{eventId: "1", date: "2028-01-15", answer: "YES" as const}, {eventId: "2", date: "2028-01-15", answer: "NO" as const}];

        expect(answerFor(days, "2", "2028-01-15")?.answer).toBe("NO");
        expect(answerFor(days, "1", "2028-01-16")).toBeNull();
    });
});

describe("shiftSlotValuesSchema", () => {
    const values = {date: "2028-01-15", startTime: "18:00", endTime: "20:00", task: "Biljettkontroll", needed: "2", comment: ""};

    it("takes a slot and turns it into the GraphQL input", () => {
        expect(shiftSlotValuesSchema.safeParse(values).success).toBe(true);
        expect(toShiftSlotInput(shiftSlotValuesSchema.parse(values), "7")).toEqual({
            eventId: "7", date: "2028-01-15", startTime: "18:00", endTime: "20:00", task: "Biljettkontroll", needed: 2, comment: null,
        });
        expect(toShiftSlotInput(shiftSlotValuesSchema.parse(values))).not.toHaveProperty("eventId");
    });

    it("refuses an end before the start, a missing task and a need outside 1–100", () => {
        const issues = (changes: Partial<typeof values>) => shiftSlotValuesSchema.safeParse({...values, ...changes}).error?.issues.map(issue => issue.message);

        expect(issues({endTime: "17:00"})).toEqual(["slotEndBeforeStart"]);
        expect(issues({endTime: "18:00"})).toEqual(["slotEndBeforeStart"]);
        expect(issues({task: " "})).toEqual(["taskRequired"]);
        expect(issues({needed: "0"})).toEqual(["neededInvalid"]);
        expect(issues({needed: "101"})).toEqual(["neededInvalid"]);
        expect(issues({startTime: "25:00"})).toContain("timeInvalid");
    });
});
