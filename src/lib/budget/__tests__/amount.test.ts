import {describe, expect, it} from "vitest";
import {
    amountInputValue,
    fromOre,
    lineAmount,
    parseAmount,
    parseQuantity,
    subtractAmounts,
    toOre
} from "@/lib/budget/amount";

describe("parseAmount", () => {
    it.each([
        ["1200", "1200"],
        ["1 200", "1200"],
        ["1 200,50", "1200.50"],
        ["1200.5", "1200.50"],
        ["1200,00", "1200"],
        ["1 200 kr", "1200"],
        ["  35,5 ", "35.50"],
        ["007", "7"],
        ["0", "0"],
    ])("reads %j as %j", (input, expected) => {
        expect(parseAmount(input)).toBe(expected);
    });

    it.each(["", "abc", "1.234", "12,345,6", "1e3", "-5"])("refuses %j", input => {
        expect(parseAmount(input)).toBeNull();
    });

    it("reads negative amounts only when allowed", () => {
        expect(parseAmount("-35,50", {allowNegative: true})).toBe("-35.50");
        expect(parseAmount("−35", {allowNegative: true})).toBe("-35");
        expect(parseAmount("-0", {allowNegative: true})).toBe("0");
    });
});

describe("öre", () => {
    it("converts both ways without floating point loss", () => {
        expect(toOre("1200.50")).toBe(120050);
        expect(toOre("-35.5")).toBe(-3550);
        expect(toOre("0.07")).toBe(7);
        expect(toOre("x")).toBeNull();
        expect(fromOre(120050)).toBe("1200.50");
        expect(fromOre(120000)).toBe("1200");
        expect(fromOre(-3550)).toBe("-35.50");
        expect(fromOre(7)).toBe("0.07");
    });

    it("subtracts amounts", () => {
        expect(subtractAmounts("1000", "1200.50")).toBe("-200.50");
        expect(subtractAmounts("0.3", "0.1")).toBe("0.20");
        expect(subtractAmounts(null, "1")).toBeNull();
    });
});

describe("lineAmount", () => {
    it("multiplies quantity by unit amount and rounds half up to öre", () => {
        expect(lineAmount("40", "85")).toBe("3400");
        expect(lineAmount("1,5", "99,99")).toBe("149.99");
        expect(lineAmount(0.33, "0.05")).toBe("0.02");
        expect(lineAmount("3", "33.33")).toBe("99.99");
        expect(lineAmount("100000", "10000000")).toBe("1000000000000");
    });

    it("is null when either is not a number", () => {
        expect(lineAmount("", "85")).toBeNull();
        expect(lineAmount("2", null)).toBeNull();
        expect(lineAmount("två", "85")).toBeNull();
    });
});

describe("inputs", () => {
    it("reads quantities with a decimal comma and shows amounts with one", () => {
        expect(parseQuantity("1,5")).toBe(1.5);
        expect(parseQuantity("2")).toBe(2);
        expect(parseQuantity("1.234")).toBeNull();
        expect(amountInputValue("1200.50")).toBe("1200,50");
        expect(amountInputValue(null)).toBe("");
    });
});
