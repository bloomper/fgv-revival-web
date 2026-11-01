import {describe, expect, it, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {DataFilter} from "@/components/data-filter";

const OPTIONS = [
    {label: "Nobel", value: "1", groupLabel: "Chalmersspexet", sortKey: "b"},
    {label: "Bojan", value: "2", groupLabel: "Chalmersspexet", sortKey: "a"},
    {label: "Fritiof", value: "3", groupLabel: "Bobspexet"},
    {label: "Ali Baba", value: "4"},
    {label: "Cleopatra", value: "5"},
    {label: "Snorre", value: "6"},
];

const open = async () => userEvent.click(screen.getByRole("button", {name: /Spex/}));

describe("DataFilter", () => {
    it("lists the options by group in their sort order and toggles a selection", async () => {
        const onSelect = vi.fn();

        render(<DataFilter title="Spex" options={OPTIONS} selectedValues={new Set(["2"])} onSelect={onSelect}/>);
        await open();

        const labels = screen.getAllByRole("button").map(button => button.textContent).filter(text => ["Nobel", "Bojan"].includes(text ?? ""));

        expect(labels).toEqual(["Bojan", "Nobel"]);
        expect(screen.getByText("Bobspexet")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", {name: "Nobel"}));
        expect(onSelect).toHaveBeenLastCalledWith(new Set(["2", "1"]));

        await userEvent.click(screen.getByRole("button", {name: "Bojan"}));
        expect(onSelect).toHaveBeenLastCalledWith(new Set());
    });

    it("searches by label or group when there are many options", async () => {
        render(<DataFilter title="Spex" options={OPTIONS} selectedValues={new Set()} onSelect={vi.fn()}/>);
        await open();

        await userEvent.type(screen.getByPlaceholderText("Common.search"), "bob");

        expect(screen.getByRole("button", {name: "Fritiof"})).toBeInTheDocument();
        expect(screen.queryByRole("button", {name: "Nobel"})).toBeNull();
    });

    it("shows how many are selected and resets the filter", async () => {
        const onClear = vi.fn();

        render(<DataFilter title="Spex" options={OPTIONS} selectedValues={new Set(["1", "3"])} onSelect={vi.fn()} onClear={onClear}/>);

        expect(screen.getByRole("button", {name: /Common.selected/})).toBeInTheDocument();
        await open();
        await userEvent.click(screen.getByRole("button", {name: "Common.resetFilters"}));

        expect(onClear).toHaveBeenCalled();
    });

    it("without onClear selects everything again when reset", async () => {
        const onSelect = vi.fn();

        render(<DataFilter title="Spex" options={OPTIONS.slice(0, 2)} selectedValues={new Set(["1"])} onSelect={onSelect}/>);
        await open();
        expect(screen.queryByPlaceholderText("Common.search")).toBeNull();
        await userEvent.click(screen.getByRole("button", {name: "Common.resetFilters"}));

        expect(onSelect).toHaveBeenCalledWith(new Set(["1", "2"]));
    });
});
