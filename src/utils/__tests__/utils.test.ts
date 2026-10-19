import {describe, expect, it} from "vitest";
import {cn, formatDate} from "@/utils/utils";

describe("cn", () => {
    it("merges class names and lets later tailwind classes win", () => {
        expect(cn("p-2", false && "hidden", "p-4")).toBe("p-4");
    });
});

describe("formatDate", () => {
    it("formats an ISO date", () => {
        expect(formatDate("2028-02-10")).toBe("2028-02-10");
        expect(formatDate("2028-02-10T18:30:00Z")).toMatch(/^2028-02-1[01]$/);
    });

    it("returns an empty string for missing or invalid input", () => {
        expect(formatDate(null)).toBe("");
        expect(formatDate(undefined)).toBe("");
        expect(formatDate("not a date")).toBe("");
    });
});
