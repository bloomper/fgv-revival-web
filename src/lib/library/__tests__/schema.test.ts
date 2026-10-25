import {describe, expect, it} from "vitest";
import {type LibraryEntryValues, libraryEntryValuesSchema, toLibraryEntryInput} from "@/lib/library/schema";

const blank = {sv: "", en: ""};

function values(overrides: Partial<LibraryEntryValues> = {}): LibraryEntryValues {
    return {
        kind: "VENUE",
        name: {sv: "RunAn", en: ""},
        description: {sv: "Stor scen.", en: "Big stage."},
        pros: blank,
        cons: blank,
        booking: blank,
        prices: blank,
        contact: {sv: "Ska inte skickas", en: ""},
        url: "",
        ...overrides,
    };
}

describe("libraryEntryValuesSchema", () => {
    it("needs a Swedish name", () => {
        expect(libraryEntryValuesSchema.safeParse(values({name: {sv: " ", en: "x"}})).success).toBe(false);
    });

    it("accepts only an https link", () => {
        expect(libraryEntryValuesSchema.safeParse(values({url: "http://example.org"})).success).toBe(false);
        expect(libraryEntryValuesSchema.safeParse(values({url: "https://example.org/runan"})).success).toBe(true);
    });

    it("needs Swedish text for an English one, but only for the texts the kind has", () => {
        expect(libraryEntryValuesSchema.safeParse(values({pros: {sv: "", en: "Close"}})).success).toBe(false);
        expect(libraryEntryValuesSchema.safeParse(values({kind: "ROLE_DESCRIPTION", pros: {sv: "", en: "Close"}})).success).toBe(true);
    });
});

describe("toLibraryEntryInput", () => {
    it("sends only the texts the kind has, and none without Swedish text", () => {
        const input = toLibraryEntryInput(values());

        expect(input.description).toEqual({sv: "Stor scen.", en: "Big stage."});
        expect(input.pros).toBeNull();
        expect(input.contact).toBeNull();
        expect(input.name).toEqual({sv: "RunAn", en: null});
        expect(input.url).toBeNull();
    });
});
