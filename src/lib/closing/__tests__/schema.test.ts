import {describe, expect, it} from "vitest";
import {confirmsRevival, membershipYearSchema, syncIncomplete} from "@/lib/closing/schema";

describe("confirmsRevival", () => {
    const revival = {id: "42", title: "Ali Baba 2028"};

    it("takes the title ignoring case and surrounding spaces", () => {
        expect(confirmsRevival("  ali baba 2028 ", revival)).toBe(true);
        expect(confirmsRevival("ALI BABA 2028", revival)).toBe(true);
    });

    it("takes the id, which the server accepts while Spexregister is down", () => {
        expect(confirmsRevival("42", revival)).toBe(true);
    });

    it("refuses anything else, and nothing", () => {
        expect(confirmsRevival("Ali Baba", revival)).toBe(false);
        expect(confirmsRevival("", revival)).toBe(false);
        expect(confirmsRevival("   ", {id: "1", title: ""})).toBe(false);
    });
});

describe("syncIncomplete", () => {
    it("is true without a run, while one runs, after a failed one or with failures", () => {
        expect(syncIncomplete(null)).toBe(true);
        expect(syncIncomplete({status: "RUNNING", failed: 0})).toBe(true);
        expect(syncIncomplete({status: "FAILED", failed: 2})).toBe(true);
        expect(syncIncomplete({status: "DONE", failed: 1})).toBe(true);
    });

    it("is false once a run completed without failures", () => {
        expect(syncIncomplete({status: "DONE", failed: 0})).toBe(false);
    });
});

describe("membershipYearSchema", () => {
    it("reads four digits as a number", () => {
        expect(membershipYearSchema.parse(" 2028 ")).toBe(2028);
    });

    it("refuses anything but four digits", () => {
        expect(membershipYearSchema.safeParse("28").success).toBe(false);
        expect(membershipYearSchema.safeParse("20x8").success).toBe(false);
    });
});
