import {describe, expect, it} from "vitest";
import {MAX_NEWS_SUBJECT, newsDeleteSchema, newsUpdateSchema, newsValuesSchema} from "@/lib/news/schema";

const valid = {subject: "Årsmöte", text: "Välkomna", visibleFrom: "2026-01-01", visibleTo: "2026-02-01"};
const messages = (input: unknown) => newsValuesSchema.safeParse(input).error?.issues.map(issue => issue.message) ?? [];

describe("newsValuesSchema", () => {
    it("accepts news with or without dates", () => {
        expect(newsValuesSchema.safeParse(valid).success).toBe(true);
        expect(newsValuesSchema.safeParse({...valid, visibleFrom: "", visibleTo: ""}).success).toBe(true);
    });

    it("needs a subject and a text within their limits", () => {
        expect(messages({...valid, subject: " ", text: ""})).toEqual(["newsSubjectRequired", "newsTextRequired"]);
        expect(messages({...valid, subject: "x".repeat(MAX_NEWS_SUBJECT + 1)})).toEqual(["newsSubjectTooLong"]);
    });

    it("refuses an end before the start, or without one", () => {
        expect(messages({...valid, visibleTo: "2025-12-31"})).toEqual(["newsDates"]);
        expect(messages({...valid, visibleFrom: ""})).toEqual(["newsDates"]);
        expect(messages({...valid, visibleFrom: "1 jan"})).toContain("dateInvalid");
    });

    it("needs an id and a version to change or delete", () => {
        expect(newsUpdateSchema.safeParse({id: "n1", version: 0, values: valid}).success).toBe(true);
        expect(newsDeleteSchema.safeParse({id: "", version: -1}).success).toBe(false);
    });
});
