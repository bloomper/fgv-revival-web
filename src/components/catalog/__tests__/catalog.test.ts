import {describe, expect, it} from "vitest";
import {catalogChoices, catalogName, defaultItemType} from "@/components/catalog/catalog";
import {CAPABILITIES, ITEM_TYPES} from "@/components/catalog/__tests__/fixtures";

const retired = {id: "OLD", name: {sv: "Gammalt", en: null}, retired: true};

describe("catalogChoices", () => {
    it("offers the active entries and only the retired ones a row holds, once", () => {
        const entries = [CAPABILITIES.FINANCE, retired, CAPABILITIES.COMMS];

        expect(catalogChoices(entries).map(entry => entry.id)).toEqual(["FINANCE", "COMMS"]);
        expect(catalogChoices(entries, [retired, retired, CAPABILITIES.FINANCE, null]).map(entry => entry.id)).toEqual(["FINANCE", "COMMS", "OLD"]);
    });
});

describe("defaultItemType", () => {
    it("starts with the first active type of the kind, otherwise the first active one", () => {
        const types = [ITEM_TYPES.REQUIREMENT, {...ITEM_TYPES.TIP, retired: true}, {...ITEM_TYPES.TIP, id: "TIP2"}];

        expect(defaultItemType(types)).toBe("TIP2");
        expect(defaultItemType([ITEM_TYPES.REQUIREMENT, ITEM_TYPES.TEXT])).toBe("REQUIREMENT");
        expect(defaultItemType([])).toBe("");
    });
});

describe("catalogName", () => {
    it("uses English in English when there is one", () => {
        expect(catalogName(CAPABILITIES.FINANCE, "en")).toBe("Finance");
        expect(catalogName(retired, "en")).toBe("Gammalt");
        expect(catalogName(CAPABILITIES.FINANCE, "sv")).toBe("Ekonomi");
    });
});
