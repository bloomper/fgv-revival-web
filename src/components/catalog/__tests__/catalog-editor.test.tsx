import {describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {type CatalogActions, CatalogEditor, type CatalogRow} from "@/components/catalog/catalog-editor.client";

vi.mock("next/navigation", () => ({useRouter: () => ({refresh: vi.fn()})}));

const ok = () => vi.fn().mockResolvedValue({ok: true, data: null});

function actions(): CatalogActions & Record<string, ReturnType<typeof vi.fn>> {
    return {create: ok(), update: ok(), move: ok(), retire: ok(), restore: ok(), remove: ok()};
}

// Positions skip 1: a retired entry the list does not show sits between them
const entries: CatalogRow[] = [
    {id: "FINANCE", name: {sv: "Ekonomi", en: "Finance"}, retired: false, position: 0, inUse: true, version: 3},
    {id: "NEW", name: {sv: "Scenografi", en: null}, retired: false, position: 2, inUse: false, version: 0},
];

describe("CatalogEditor", () => {
    it("deletes only what nothing uses, and retires the rest", () => {
        render(<CatalogEditor entries={entries} actions={actions()} label="List" createLabel="New"/>);

        expect(screen.queryByRole("button", {name: 'Catalog.delete:{"name":"Ekonomi"}'})).not.toBeInTheDocument();
        expect(screen.getByRole("button", {name: 'Catalog.delete:{"name":"Scenografi"}'})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: 'Catalog.retire:{"name":"Ekonomi"}'})).toBeInTheDocument();
        expect(screen.getByText("Catalog.inUse")).toBeInTheDocument();
    });

    it("moves an entry to its neighbour's place in the whole list", async () => {
        const calls = actions();

        render(<CatalogEditor entries={entries} actions={calls} label="List" createLabel="New"/>);
        fireEvent.click(screen.getByRole("button", {name: 'Catalog.moveUp:{"name":"Scenografi"}'}));

        await waitFor(() => expect(calls.move).toHaveBeenCalledWith({id: "NEW", version: 0, position: 0}));
        expect(screen.getByRole("button", {name: 'Catalog.moveUp:{"name":"Ekonomi"}'})).toBeDisabled();
    });

    it("restores a retired entry", async () => {
        const calls = actions();

        render(<CatalogEditor entries={[{...entries[0], retired: true}]} actions={calls} label="List" createLabel="New"/>);
        fireEvent.click(screen.getByRole("button", {name: 'Catalog.restore:{"name":"Ekonomi"}'}));

        await waitFor(() => expect(calls.restore).toHaveBeenCalledWith({id: "FINANCE", version: 3}));
    });

    it("creates a guide item type with the kind chosen", async () => {
        const calls = actions();

        render(<CatalogEditor entries={entries} actions={calls} label="List" createLabel="New" withKind/>);
        fireEvent.click(screen.getByRole("button", {name: "New"}));
        fireEvent.change(screen.getByLabelText("Catalog.nameSv"), {target: {value: "Myndighetskrav"}});
        fireEvent.click(screen.getByRole("radio", {name: /Catalog.kinds.REQUIREMENT.name/}));
        fireEvent.click(screen.getByRole("button", {name: "Common.save"}));

        await waitFor(() => expect(calls.create).toHaveBeenCalledWith({name: {sv: "Myndighetskrav", en: ""}, kind: "REQUIREMENT"}));
    });

    it("refuses an empty Swedish name", async () => {
        const calls = actions();

        render(<CatalogEditor entries={entries} actions={calls} label="List" createLabel="New"/>);
        fireEvent.click(screen.getByRole("button", {name: "New"}));
        fireEvent.click(screen.getByRole("button", {name: "Common.save"}));

        expect(await screen.findByText("Validation.catalogNameRequired")).toBeInTheDocument();
        expect(calls.create).not.toHaveBeenCalled();
    });
});
