import {beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {filterInventory, InventoryTable, type InventoryRow, NO_LOCATION} from "@/components/material/inventory-table.client";
import * as actions from "@/app/(app)/revivals/[id]/materials/actions.server";

vi.mock("next/navigation", async () => (await import("@/test/next-navigation")).navigation);
vi.mock("@/app/(app)/revivals/[id]/materials/actions.server", () => ({
    createInventoryItemAction: vi.fn(),
    updateInventoryItemAction: vi.fn(),
    removeInventoryItemAction: vi.fn(),
    restoreInventoryItemAction: vi.fn(),
}));
vi.mock("@/components/history/history-dialog.client", () => ({HistoryDialog: () => <div data-testid="history"/>}));
vi.mock("sonner", () => ({toast: {success: vi.fn(), error: vi.fn()}}));

const items: InventoryRow[] = [
    {
        id: "1",
        version: 0,
        name: "Lampa",
        kind: "PROPS",
        quantity: 2,
        status: "BUY",
        location: "RUNAN",
        owner: {name: "Sam"},
        removed: false
    },
    {
        id: "2",
        version: 0,
        name: "Peruk",
        kind: "WIG",
        quantity: 1,
        status: "HAVE",
        location: null,
        locationNote: "Hos Dana",
        removed: false,
        material: {id: "m", title: "Kostymlista", url: "https://drive.google.com/x", removed: false}
    },
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
        expect(filterInventory(items, "", {
            ...none,
            locations: new Set([NO_LOCATION])
        }).map(item => item.id)).toEqual(["2"]);
        expect(filterInventory(items, "", {...none, kinds: new Set(["WIG"]), statuses: new Set(["BUY"])})).toEqual([]);
    });
});

describe("InventoryTable", () => {
    const rows = [...items, {...items[0], id: "3", version: 4, name: "Trasig stol", removed: true}] as InventoryRow[];

    function show(canWrite = true) {
        return render(<InventoryTable revivalId="r1" items={rows} members={[]} materials={[]} canWrite={canWrite} showRemoved/>);
    }

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(actions.removeInventoryItemAction).mockResolvedValue({ok: true, data: null} as never);
        vi.mocked(actions.restoreInventoryItemAction).mockResolvedValue({ok: true, data: null} as never);
    });

    it("lists the items, the owner and the material", () => {
        show();

        expect(screen.getByText("Lampa")).toBeInTheDocument();
        expect(screen.getByText("Hos Dana")).toBeInTheDocument();
        expect(screen.getByText("Kostymlista")).toBeInTheDocument();
    });

    it("searches and clears the search", async () => {
        show();

        await userEvent.type(screen.getByRole("textbox", {name: "Common.search"}), "peruk");
        expect(screen.queryByText("Lampa")).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", {name: "Common.clearSearch"}));
        expect(screen.getByText("Lampa")).toBeInTheDocument();
    });

    it("removes and restores items", async () => {
        show();

        await userEvent.click(screen.getByRole("button", {name: `rowMenu:${JSON.stringify({name: "Lampa"})}`}));
        await userEvent.click(await screen.findByRole("menuitem", {name: /^remove$/}));
        await waitFor(() => expect(actions.removeInventoryItemAction).toHaveBeenCalledWith(expect.objectContaining({id: "1", version: 0})));

        await userEvent.click(screen.getByRole("button", {name: `rowMenu:${JSON.stringify({name: "Trasig stol"})}`}));
        await userEvent.click(await screen.findByRole("menuitem", {name: /^restore$/}));
        await waitFor(() => expect(actions.restoreInventoryItemAction).toHaveBeenCalledWith(expect.objectContaining({id: "3", version: 4})));
    });

    it("edits an item from its row", async () => {
        show();

        await userEvent.click(screen.getByText("Lampa"));

        expect(await screen.findByRole("dialog")).toBeInTheDocument();
    });
});
