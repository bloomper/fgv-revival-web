import {beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {filterMaterials, MaterialTable, type MaterialRow, NO_SERVICE} from "@/components/material/material-table.client";
import * as actions from "@/app/(app)/revivals/[id]/materials/actions.server";

vi.mock("next/navigation", async () => (await import("@/test/next-navigation")).navigation);
vi.mock("@/app/(app)/revivals/[id]/materials/actions.server", () => ({
    createMaterialAction: vi.fn(),
    updateMaterialAction: vi.fn(),
    removeMaterialAction: vi.fn(),
    restoreMaterialAction: vi.fn(),
}));
vi.mock("@/components/history/history-dialog.client", () => ({HistoryDialog: () => <div data-testid="history"/>}));
vi.mock("sonner", () => ({toast: {success: vi.fn(), error: vi.fn()}}));

const drive = {id: "DRIVE", name: {sv: "Google Drive", en: "Google Drive"}, hosts: ["drive.google.com"], retired: false};

const materials = [
    {
        id: "m1", version: 1, title: "Manus", url: "https://drive.google.com/manus", service: drive, serviceChosen: false,
        category: "SCRIPT", visibility: "PARTICIPANTS", positions: [{id: "p1", name: "Regissör"}], comment: "Senaste versionen",
        removed: false,
    },
    {
        id: "m2", version: 2, title: "Gammal affisch", url: "https://example.com/affisch", service: null, serviceChosen: false,
        category: "OTHER", visibility: "STEERING_GROUP", positions: [], comment: null, removed: true,
    },
] as unknown as MaterialRow[];

const none = {categories: new Set<string>(), services: new Set<string>(), visibilities: new Set<string>()};

function show(canWrite = true) {
    return render(<MaterialTable revivalId="r1" materials={materials} services={[drive] as never} positions={[]}
                                 positionsUnavailable={false} canWrite={canWrite} showRemoved/>);
}

beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(actions.removeMaterialAction).mockResolvedValue({ok: true, data: null} as never);
    vi.mocked(actions.restoreMaterialAction).mockResolvedValue({ok: true, data: null} as never);
});

describe("filterMaterials", () => {
    it("matches the title, link, service, comment and positions", () => {
        expect(filterMaterials(materials, "drive regissör", none, "sv").map(m => m.id)).toEqual(["m1"]);
        expect(filterMaterials(materials, "affisch", none, "sv").map(m => m.id)).toEqual(["m2"]);
    });

    it("filters by category, service and visibility, links without a service under their own value", () => {
        expect(filterMaterials(materials, "", {...none, services: new Set([NO_SERVICE])}, "sv").map(m => m.id)).toEqual(["m2"]);
        expect(filterMaterials(materials, "", {...none, categories: new Set(["SCRIPT"])}, "sv").map(m => m.id)).toEqual(["m1"]);
        expect(filterMaterials(materials, "", {...none, visibilities: new Set(["PARTICIPANTS"]), categories: new Set(["OTHER"])}, "sv")).toEqual([]);
    });
});

describe("MaterialTable", () => {
    it("lists the material, marking what is removed", () => {
        show();

        expect(screen.getByText("Manus")).toBeInTheDocument();
        expect(screen.getByText("Senaste versionen")).toBeInTheDocument();
        expect(screen.getByText("removed")).toBeInTheDocument();
    });

    it("searches and clears the search", async () => {
        show();

        await userEvent.type(screen.getByRole("textbox", {name: "Common.search"}), "manus");
        expect(screen.queryByText("Gammal affisch")).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", {name: "Common.clearSearch"}));
        expect(screen.getByText("Gammal affisch")).toBeInTheDocument();
    });

    it("removes and restores material from the row menu", async () => {
        show();

        await userEvent.click(screen.getByRole("button", {name: `rowMenu:${JSON.stringify({title: "Manus"})}`}));
        await userEvent.click(await screen.findByRole("menuitem", {name: /^remove$/}));
        await waitFor(() => expect(actions.removeMaterialAction).toHaveBeenCalledWith({id: "m1", version: 1, revivalId: "r1"}));

        await userEvent.click(screen.getByRole("button", {name: `rowMenu:${JSON.stringify({title: "Gammal affisch"})}`}));
        await userEvent.click(await screen.findByRole("menuitem", {name: /^restore$/}));
        await waitFor(() => expect(actions.restoreMaterialAction).toHaveBeenCalledWith({id: "m2", version: 2, revivalId: "r1"}));
    });

    it("opens the history and the editor", async () => {
        show();

        await userEvent.click(screen.getByRole("button", {name: `rowMenu:${JSON.stringify({title: "Manus"})}`}));
        await userEvent.click(await screen.findByRole("menuitem", {name: /History.menu|menu/}));
        expect(await screen.findByTestId("history")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", {name: /Material.new/}));
        expect(await screen.findByRole("dialog")).toBeInTheDocument();
    });

    it("offers no changes to those who only read", () => {
        show(false);

        expect(screen.queryByRole("button", {name: /Material.new/})).not.toBeInTheDocument();
    });
});
