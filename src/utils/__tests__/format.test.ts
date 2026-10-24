import {describe, expect, it} from "vitest";
import {formatAmount, formatDate, formatInstant} from "@/utils/format";

describe("format", () => {
    it("formats dates as yyyy-mm-dd without shifting them", () => {
        expect(formatDate("2028-02-10")).toBe("2028-02-10");
        expect(formatDate(null)).toBeNull();
        expect(formatDate("not a date")).toBe("not a date");
    });

    it("formats instants as yyyy-mm-dd hh:mm in Swedish time", () => {
        expect(formatInstant("2028-02-10T12:00:00Z")).toBe("2028-02-10 13:00");
        expect(formatInstant("2028-07-01T22:30:00Z")).toBe("2028-07-02 00:30");
        expect(formatInstant(undefined)).toBeNull();
        expect(formatInstant("garbage")).toBe("garbage");
    });

    it("formats amounts the Swedish way, without decimals for whole kronor", () => {
        const plain = (value: string | null) => value?.replace(/\u00a0/g, " ");

        expect(plain(formatAmount("12345.5"))).toBe("12 345,50 kr");
        expect(plain(formatAmount("1200"))).toBe("1 200 kr");
        expect(plain(formatAmount("1200.00"))).toBe("1 200 kr");
        expect(plain(formatAmount("0.05"))).toBe("0,05 kr");
        expect(plain(formatAmount("-35.50"))).toBe("\u221235,50 kr");
        expect(plain(formatAmount("-0"))).toBe("0 kr");
        expect(plain(formatAmount("1234567"))).toBe("1 234 567 kr");
        expect(plain(formatAmount(800))).toBe("800 kr");
        expect(formatAmount(null)).toBeNull();
        expect(formatAmount("")).toBeNull();
        expect(formatAmount("n/a")).toBe("n/a");
    });

    it("keeps an amount together on one line", () => {
        expect(formatAmount("12345")).toBe("12\u00a0345\u00a0kr");
    });
});
