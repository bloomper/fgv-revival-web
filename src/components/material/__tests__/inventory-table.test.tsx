import {describe, expect, it} from "vitest";
import {filterInventory, type InventoryRow, NO_LOCATION} from "@/components/material/inventory-table.client";
import {vi} from "vitest";

vi.mock("@/app/(app)/revivals/[id]/materials/actions.server", () => ({}));

const items: InventoryRow[] = [
    {id: "1", version: 0, name: "Lampa", kind: "PROPS", quantity: 2, status: "BUY", location: "RUNAN", owner: {name: "Sam"}, removed: false},
    {id: "2", version: 0, name: "Peruk", kind: "WIG", quantity: 1, status: "HAVE", location: null, locationNote: "Hos Dana", removed: false,
        material: {id: "m", title: "Kostymlista", url: "https://drive.google.com/x", removed: false}},
];
const none = {kinds: new Set<string>(), statuses: new Set<string>(), locations: new Set<string>()};

describe("filterInventory", () => {
    it("searches the name, place, owner and material", () => {
        expect(filterInventory(items, "sam", none).map(item => item.id)).toEqual(["1"]);
        expect(filterInventory(items, "dana", none).map(item => item.id)).toEqual(["2"]);
        expect(filterInventory(items, "kostymlista", none).map(item => item.id)).toEqual(["2"]);
    });

    it("filters by kind, status and location, items without one under 'no location'", () => {
        expect(filterInventory(items, "", {...none, statuses: new Set(["BUY"])}).map(item => item.id)).toEqual(["1"]);
        expect(filterInventory(items, "", {...none, locations: new Set([NO_LOCATION])}).map(item => item.id)).toEqual(["2"]);
        expect(filterInventory(items, "", {...none, kinds: new Set(["WIG"]), statuses: new Set(["BUY"])})).toEqual([]);
    });
});
