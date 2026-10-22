import {describe, expect, it} from "vitest";
import {logFilterQuery, logEntryValuesSchema, parseLogFilter} from "@/lib/decision-log/schema";

describe("log filters in the URL", () => {
    it("reads every filter", () => {
        expect(parseLogFilter({mine: "1", overdue: "1", type: "TODO,QUESTION,BOGUS", tag: "lokal, budget", q: " kår ", meeting: "5"}))
            .toEqual({mine: true, open: undefined, overdue: true, types: ["TODO", "QUESTION"], tags: ["lokal", "budget"], text: "kår", meetingId: "5"});
    });

    it("reads nothing as no filter", () => {
        expect(parseLogFilter({})).toEqual({
            mine: undefined, open: undefined, overdue: undefined, types: undefined, tags: undefined, text: undefined, meetingId: undefined,
        });
    });

    it("round-trips", () => {
        const filter = {open: true, types: ["DECISION" as const], tags: ["lokal"], text: "RunAn"};

        expect(parseLogFilter(Object.fromEntries(new URLSearchParams(logFilterQuery(filter))))).toMatchObject(filter);
    });
});

describe("log entry values", () => {
    const valid = {type: "TODO", text: "Boka RunAn", status: "OPEN", owner: null, tags: []};

    it("accepts a row", () => {
        expect(logEntryValuesSchema.safeParse(valid).success).toBe(true);
    });

    it("refuses blank or too long text, and too long tags", () => {
        expect(logEntryValuesSchema.safeParse({...valid, text: "  "}).success).toBe(false);
        expect(logEntryValuesSchema.safeParse({...valid, text: "x".repeat(5001)}).success).toBe(false);
        expect(logEntryValuesSchema.safeParse({...valid, tags: ["t".repeat(51)]}).success).toBe(false);
    });

    it("limits free-text owner names to 100 characters", () => {
        expect(logEntryValuesSchema.safeParse({...valid, owner: {name: "x".repeat(100)}}).success).toBe(true);
        expect(logEntryValuesSchema.safeParse({...valid, owner: {name: "x".repeat(101)}}).success).toBe(false);
    });
});
