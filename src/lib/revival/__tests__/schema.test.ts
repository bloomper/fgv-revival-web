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
    const show = (date: string, venue = "", time = "") => ({date, time, venue});

    it("accepts shows on or after the premiere, with or without a venue", () => {
        expect(schema.safeParse({premiereDate: "2028-02-10", shows: [show("2028-02-10", "Kårhuset"), show("2028-02-12")]}).success).toBe(true);
        expect(schema.safeParse({premiereDate: "", shows: []}).success).toBe(true);
    });

    it("refuses a premiere in another year", () => {
        expect(messages(schema.safeParse({premiereDate: "2029-02-10", shows: []}))).toEqual(["premiereYear"]);
    });

    it("refuses shows before the premiere, without one, or twice", () => {
        expect(messages(schema.safeParse({premiereDate: "2028-02-10", shows: [show("2028-02-09")]}))).toEqual(["showDateBeforePremiere"]);
        expect(messages(schema.safeParse({premiereDate: "", shows: [show("2028-02-09")]}))).toEqual(["showDateWithoutPremiere"]);
        expect(messages(schema.safeParse({premiereDate: "2028-02-10", shows: [show("2028-02-10", "Scen"), show("2028-02-10", " scen ")]})))
            .toEqual(["showDuplicate"]);
    });

    it("takes an optional start time, so a matinée and an evening show are two shows", () => {
        expect(schema.safeParse({premiereDate: "2028-02-10", shows: [show("2028-02-11", "Scen", "14:00"), show("2028-02-11", "Scen", "19:00")]}).success)
            .toBe(true);
        expect(messages(schema.safeParse({premiereDate: "2028-02-10", shows: [show("2028-02-11", "Scen", "19.00")]}))).toEqual(["timeInvalid"]);
        expect(messages(schema.safeParse({premiereDate: "2028-02-10", shows: [show("2028-02-11", "Scen", "24:00")]}))).toEqual(["timeInvalid"]);
    });

    it("refuses invalid dates, long venues and more than 50 shows", () => {
        expect(messages(schema.safeParse({premiereDate: "2028-13-45", shows: []}))).toContain("dateInvalid");
        expect(messages(schema.safeParse({premiereDate: "2028-02-10", shows: [show("2028-02-10", "x".repeat(256))]}))).toEqual(["venueTooLong"]);
        expect(messages(schema.safeParse({premiereDate: "2028-02-10", shows: Array.from({length: 51}, (_, day) => show("2028-03-01", `Scen ${day}`))})))
            .toEqual(["showsTooMany"]);
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
