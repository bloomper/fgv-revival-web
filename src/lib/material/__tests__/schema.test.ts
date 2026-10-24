import {describe, expect, it} from "vitest";
import {
    inventoryValuesSchema,
    linkServiceDetailsSchema,
    materialValuesSchema,
    toInventoryItemInput,
    toMaterialInput,
} from "@/lib/material/schema";

const material = {
    title: "Manus 2028", url: "https://drive.google.com/file/d/1", serviceId: "", category: "SCRIPT" as const,
    visibility: "PARTICIPANTS" as const, positionIds: [], comment: "",
};

const messages = (result: {
    success: boolean;
    error?: { issues: { message: string }[] }
}) => result.error?.issues.map(issue => issue.message) ?? [];

describe("materialValuesSchema", () => {
    it("accepts an https link and sends a blank service as recognised by the server", () => {
        const values = materialValuesSchema.parse(material);

        expect(toMaterialInput(values)).toEqual({
            title: "Manus 2028",
            url: "https://drive.google.com/file/d/1",
            serviceId: null,
            category: "SCRIPT",
            visibility: "PARTICIPANTS",
            positionIds: [],
            comment: null,
        });
    });

    it.each(["http://example.org", "javascript:alert(1)", "https://a:b@example.org"])("refuses %s", url => {
        expect(messages(materialValuesSchema.safeParse({...material, url}))).toContain("urlHttpsRequired");
    });

    it("needs a position for POSITIONS, and sends positions only then", () => {
        expect(messages(materialValuesSchema.safeParse({
            ...material,
            visibility: "POSITIONS"
        }))).toEqual(["materialPositionsRequired"]);
        expect(toMaterialInput(materialValuesSchema.parse({
            ...material,
            visibility: "POSITIONS",
            positionIds: ["T-ENS"]
        })).positionIds).toEqual(["T-ENS"]);
        expect(toMaterialInput(materialValuesSchema.parse({
            ...material,
            positionIds: ["T-ENS"]
        })).positionIds).toEqual([]);
    });
});

describe("inventoryValuesSchema", () => {
    const item = {
        name: "Lampa",
        kind: "PROPS" as const,
        quantity: "2",
        status: "BUY" as const,
        location: "" as const,
        locationNote: "",
        owner: {name: "Sam"},
        comment: "",
        materialId: "",
    };

    it("turns the dialog into the input, clearing blank fields", () => {
        expect(toInventoryItemInput(inventoryValuesSchema.parse(item))).toEqual({
            name: "Lampa",
            kind: "PROPS",
            quantity: 2,
            status: "BUY",
            location: null,
            locationNote: null,
            owner: {name: "Sam"},
            comment: null,
            materialId: null,
        });
    });

    it.each(["0", "-1", "1.5", "", "x"])("refuses the quantity %s", quantity => {
        expect(messages(inventoryValuesSchema.safeParse({...item, quantity}))).toContain("inventoryQuantityInvalid");
    });
});

describe("linkServiceDetailsSchema", () => {
    it("accepts up to ten distinct hosts and an https start page or none", () => {
        expect(linkServiceDetailsSchema.safeParse({hosts: ["drive.google.com"], homeUrl: ""}).success).toBe(true);
        expect(linkServiceDetailsSchema.safeParse({hosts: [], homeUrl: "https://spexflix.example"}).success).toBe(true);
    });

    it("refuses bad, repeated or too many hosts and an http start page", () => {
        expect(messages(linkServiceDetailsSchema.safeParse({
            hosts: ["Bad Host"],
            homeUrl: ""
        }))).toContain("hostInvalid");
        expect(messages(linkServiceDetailsSchema.safeParse({
            hosts: ["a.se", "a.se"],
            homeUrl: ""
        }))).toContain("hostDuplicate");
        expect(messages(linkServiceDetailsSchema.safeParse({
            hosts: Array.from({length: 11}, (_, index) => `h${index}.se`),
            homeUrl: ""
        })))
            .toContain("hostsTooMany");
        expect(messages(linkServiceDetailsSchema.safeParse({
            hosts: [],
            homeUrl: "http://example.org"
        }))).toContain("urlHttpsRequired");
    });
});
