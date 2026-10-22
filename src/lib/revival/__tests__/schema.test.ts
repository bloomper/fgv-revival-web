import {describe, expect, it} from "vitest";
import {memberAddSchema, revivalCreateSchema, revivalDetailsSchema, revivalStatusChangeSchema, revivalYears} from "@/lib/revival/schema";

const messages = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
    result.success ? [] : result.error!.issues.map(issue => issue.message);

describe("revivalCreateSchema", () => {
    it("accepts a spex and a year", () => {
        expect(revivalCreateSchema.parse({spexId: "1", year: "2028"})).toEqual({spexId: "1", year: 2028});
    });

    it("refuses a missing spex and a year out of range", () => {
        expect(messages(revivalCreateSchema.safeParse({spexId: "", year: 1947}))).toEqual(["spexRequired", "yearRange"]);
        expect(messages(revivalCreateSchema.safeParse({spexId: "1", year: 2101}))).toEqual(["yearRange"]);
    });
});

describe("revivalYears", () => {
    const thisYear = new Date().getFullYear();

    it("offers this year and five more, newest first, for a new revival", () => {
        expect(revivalYears(1956, {fromThisYear: true})).toEqual([5, 4, 3, 2, 1, 0].map(offset => thisYear + offset));
    });

    it("never offers a year before the original", () => {
        expect(revivalYears(thisYear + 3, {fromThisYear: true})).toEqual([thisYear + 5, thisYear + 4, thisYear + 3]);
        expect(revivalYears(thisYear - 2, {fromThisYear: false}).at(-1)).toBe(thisYear - 2);
    });

    it("keeps a later year a revival already has", () => {
        expect(revivalYears(1956, {fromThisYear: false, include: thisYear + 9})[0]).toBe(thisYear + 9);
    });
});

describe("revivalDetailsSchema", () => {
    const schema = revivalDetailsSchema(2028);

    it("accepts show dates on or after the premiere", () => {
        expect(schema.safeParse({premiereDate: "2028-02-10", showDates: ["2028-02-10", "2028-02-12"], venues: ["Kårhuset"]}).success).toBe(true);
        expect(schema.safeParse({premiereDate: "", showDates: [], venues: []}).success).toBe(true);
    });

    it("refuses a premiere in another year", () => {
        expect(messages(schema.safeParse({premiereDate: "2029-02-10", showDates: [], venues: []}))).toEqual(["premiereYear"]);
    });

    it("refuses show dates before the premiere or without one", () => {
        expect(messages(schema.safeParse({premiereDate: "2028-02-10", showDates: ["2028-02-09"], venues: []}))).toEqual(["showDateBeforePremiere"]);
        expect(messages(schema.safeParse({premiereDate: "", showDates: ["2028-02-09"], venues: []}))).toEqual(["showDateWithoutPremiere"]);
    });

    it("refuses invalid dates, blank venues and more than 20 venues", () => {
        expect(messages(schema.safeParse({premiereDate: "2028-13-45", showDates: [], venues: []}))).toContain("dateInvalid");
        expect(messages(schema.safeParse({premiereDate: "", showDates: [], venues: [" "]}))).toEqual(["venueBlank"]);
        expect(messages(schema.safeParse({premiereDate: "", showDates: [], venues: Array(21).fill("Scen")}))).toEqual(["venuesTooMany"]);
    });
});

describe("other schemas", () => {
    it("validates status changes and members", () => {
        expect(revivalStatusChangeSchema.safeParse({id: "1", from: "APPROVED", to: "ORGANISING"}).success).toBe(true);
        expect(revivalStatusChangeSchema.safeParse({id: "1", from: "APPROVED", to: "DONE"}).success).toBe(false);
        expect(memberAddSchema.parse({revivalId: "1", email: "kim@example.org", role: "STEERING_GROUP"}).capabilities).toEqual([]);
        expect(messages(memberAddSchema.safeParse({revivalId: "1", email: "kim", role: "DIRECTEUR"}))).toEqual(["emailInvalid"]);
        expect(memberAddSchema.safeParse({revivalId: "1", email: "kim@example.org", role: "PARTICIPANT"}).success).toBe(false);
    });
});
