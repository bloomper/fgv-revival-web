import {describe, expect, it} from "vitest";
import {formatDate, formatInstant} from "@/utils/format";

describe("format", () => {
    it("formats dates without shifting them", () => {
        expect(formatDate("2028-02-10", "en")).toBe("Feb 10, 2028");
        expect(formatDate("2028-02-10", "sv")).toContain("2028");
        expect(formatDate(null, "sv")).toBeNull();
        expect(formatDate("not a date", "sv")).toBe("not a date");
    });

    it("formats instants in Swedish time", () => {
        expect(formatInstant("2028-02-10T12:00:00Z", "en")).toContain("2028");
        expect(formatInstant(undefined, "en")).toBeNull();
        expect(formatInstant("garbage", "en")).toBe("garbage");
    });
});
