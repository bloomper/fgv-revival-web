import {describe, expect, it} from "vitest";
import {normalizeSwishNumber, participantName, SWISH_NUMBER, whatsAppUrl} from "@/lib/participant/contact";

describe("whatsAppUrl", () => {
    it.each([
        ["070-123 45 67", "https://wa.me/46701234567"],
        ["0701234567", "https://wa.me/46701234567"],
        ["+46 70 123 45 67", "https://wa.me/46701234567"],
        ["0046701234567", "https://wa.me/46701234567"],
        ["+47 912 34 567", "https://wa.me/4791234567"],
        ["(070) 123-45-67", "https://wa.me/46701234567"],
    ])("turns %s into %s", (phone, url) => {
        expect(whatsAppUrl(phone)).toBe(url);
    });

    it.each([null, undefined, "", "112", "abc"])("gives no link for %s", phone => {
        expect(whatsAppUrl(phone)).toBeNull();
    });
});

describe("participantName", () => {
    it("puts the nickname in quotes between first and last name", () => {
        expect(participantName({firstName: "Anna", lastName: "Andersson", nickName: "Spexis"})).toBe("Anna \"Spexis\" Andersson");
    });

    it("leaves out a missing nickname, and is empty for a removed pending person", () => {
        expect(participantName({firstName: "Bo", lastName: "Berg", nickName: null})).toBe("Bo Berg");
        expect(participantName({firstName: "", lastName: ""})).toBe("");
    });
});

describe("normalizeSwishNumber", () => {
    it("removes spaces and dashes so a typed number checks out", () => {
        expect(normalizeSwishNumber("123 456-78 90")).toBe("1234567890");
        expect(SWISH_NUMBER.test(normalizeSwishNumber("123 456-78 90"))).toBe(true);
        expect(SWISH_NUMBER.test(normalizeSwishNumber("123 45"))).toBe(false);
    });
});
