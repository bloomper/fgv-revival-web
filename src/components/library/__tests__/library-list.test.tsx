import {beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {LibraryList} from "@/components/library/library-list.client";
import type {LibraryEntryRow} from "@/components/library/library";
import * as actions from "@/app/(app)/library/actions.server";

vi.mock("next/navigation", async () => (await import("@/test/next-navigation")).navigation);
vi.mock("@/app/(app)/library/actions.server", () => ({
    createLibraryEntryAction: vi.fn(),
    updateLibraryEntryAction: vi.fn(),
    restoreLibraryEntryAction: vi.fn(),
    retireLibraryEntryAction: vi.fn(),
}));
vi.mock("sonner", () => ({toast: {success: vi.fn(), error: vi.fn()}}));

const entries = [
    {
        id: "l1", kind: "VENUE", name: {sv: "RunAn", en: null}, description: {sv: "Stor scen", en: null}, pros: {sv: "Bra ljud", en: null},
        url: "https://runan.se", retired: false, version: 1,
    },
    {id: "l2", kind: "TICKET_SERVICE", name: {sv: "Tickster", en: null}, retired: true, version: 2},
] as unknown as LibraryEntryRow[];

beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(actions.retireLibraryEntryAction).mockResolvedValue({ok: true, data: null} as never);
    vi.mocked(actions.restoreLibraryEntryAction).mockResolvedValue({ok: true, data: null} as never);
});

describe("LibraryList", () => {
    it("groups the entries by kind", () => {
        render(<LibraryList entries={entries} canEdit={false}/>);

        expect(screen.getByRole("heading", {name: "Library.kindsPlural.VENUE"})).toBeInTheDocument();
        expect(screen.getByText("RunAn")).toBeInTheDocument();
        expect(screen.getByText("Bra ljud")).toBeInTheDocument();
        expect(screen.getByText("Catalog.retired")).toBeInTheDocument();
        expect(screen.queryByRole("button", {name: /Library.create/})).not.toBeInTheDocument();
    });

    it("searches, filters by kind and says when nothing matches", async () => {
        render(<LibraryList entries={entries} canEdit={false}/>);

        await userEvent.type(screen.getByRole("textbox", {name: "Common.search"}), "scen");
        expect(screen.queryByText("Tickster")).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", {name: "Common.clearSearch"}));

        await userEvent.selectOptions(screen.getByRole("combobox"), "TICKET_SERVICE");
        expect(screen.queryByText("RunAn")).not.toBeInTheDocument();

        await userEvent.type(screen.getByRole("textbox", {name: "Common.search"}), "ingenting");
        expect(screen.getByText("Library.empty")).toBeInTheDocument();
    });

    it("retires and restores entries, and opens the editor", async () => {
        render(<LibraryList entries={entries} canEdit/>);

        await userEvent.click(screen.getByRole("button", {name: `Catalog.retire:${JSON.stringify({name: "RunAn"})}`}));
        await waitFor(() => expect(actions.retireLibraryEntryAction).toHaveBeenCalledWith({id: "l1", version: 1}));

        await userEvent.click(screen.getByRole("button", {name: `Catalog.restore:${JSON.stringify({name: "Tickster"})}`}));
        await waitFor(() => expect(actions.restoreLibraryEntryAction).toHaveBeenCalledWith({id: "l2", version: 2}));

        await userEvent.click(screen.getByRole("button", {name: `Library.edit:${JSON.stringify({name: "RunAn"})}`}));
        expect(await screen.findByRole("dialog")).toBeInTheDocument();
    });
});
