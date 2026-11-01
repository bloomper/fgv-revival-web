import {describe, expect, it, vi} from "vitest";
import {render, screen, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {DataTable, type DataTableColumnDef, selectColumn, SortableHeader} from "@/components/data-table.client";

type Spex = { id: string; title: string; year: number };

const SPEX: Spex[] = Array.from({length: 12}, (_, index) => ({
    id: `${index + 1}`,
    title: `Spex ${String(index + 1).padStart(2, "0")}`,
    year: 1990 + index,
}));

const columns: DataTableColumnDef<Spex>[] = [
    selectColumn<Spex>({all: "Välj alla", row: spex => `Välj ${spex.title}`}),
    {
        accessorKey: "title",
        header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title="Titel"/>,
        cell: ({row}) => row.original.title,
    },
    {accessorKey: "year", header: "År", cell: ({row}) => row.original.year},
];

const bodyTitles = () => screen.getAllByRole("row").slice(1).map(row => within(row).getAllByRole("cell")[1]?.textContent);

describe("DataTable", () => {
    it("pages the rows and moves between pages", async () => {
        render(<DataTable columns={columns} data={SPEX} initialPageSize={5}/>);

        expect(bodyTitles()).toEqual(["Spex 01", "Spex 02", "Spex 03", "Spex 04", "Spex 05"]);
        expect(screen.getByText('pageOf:{"page":1,"pages":3}')).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "previousPage"})).toBeDisabled();

        await userEvent.click(screen.getByRole("button", {name: "nextPage"}));
        expect(bodyTitles()[0]).toBe("Spex 06");

        await userEvent.click(screen.getByRole("button", {name: "lastPage"}));
        expect(bodyTitles()).toEqual(["Spex 11", "Spex 12"]);
        expect(screen.getByRole("button", {name: "nextPage"})).toBeDisabled();

        await userEvent.click(screen.getByRole("button", {name: "firstPage"}));
        expect(bodyTitles()[0]).toBe("Spex 01");
    });

    it("sorts by a sortable header, descending on the second click", async () => {
        render(<DataTable columns={columns} data={SPEX.slice(0, 3)}/>);

        await userEvent.click(screen.getByRole("button", {name: "Titel"}));
        expect(bodyTitles()).toEqual(["Spex 01", "Spex 02", "Spex 03"]);

        await userEvent.click(screen.getByRole("button", {name: "Titel"}));
        expect(bodyTitles()).toEqual(["Spex 03", "Spex 02", "Spex 01"]);
    });

    it("selects rows without opening them and reports the selection", async () => {
        const onRowClick = vi.fn();
        const onSelectionChange = vi.fn();

        render(<DataTable columns={columns} data={SPEX.slice(0, 3)} onRowClick={onRowClick}
                          onSelectionChange={onSelectionChange}/>);

        await userEvent.click(screen.getByRole("checkbox", {name: "Välj Spex 02"}));
        expect(onSelectionChange).toHaveBeenLastCalledWith([SPEX[1]]);
        expect(onRowClick).not.toHaveBeenCalled();

        await userEvent.click(screen.getByRole("checkbox", {name: "Välj alla"}));
        expect(onSelectionChange).toHaveBeenLastCalledWith(SPEX.slice(0, 3));

        await userEvent.click(screen.getByText("Spex 03"));
        expect(onRowClick).toHaveBeenCalledWith(SPEX[2]);
    });

    it("applies a row's class", () => {
        render(<DataTable columns={columns} data={SPEX.slice(0, 2)} rowClassName={spex => spex.id === "2" && "opacity-50"}/>);

        expect(screen.getByText("Spex 02").closest("tr")).toHaveClass("opacity-50");
        expect(screen.getByText("Spex 01").closest("tr")).not.toHaveClass("opacity-50");
    });

    it("says why there are no rows", () => {
        const {rerender} = render(<DataTable columns={columns} data={[]} empty={<p>Inga spex än</p>}/>);

        expect(screen.getByText("Inga spex än")).toBeInTheDocument();

        rerender(<DataTable columns={columns} data={[]} filtered empty={<p>Inga spex än</p>}/>);
        expect(screen.getByText("noFilterMatchHeading")).toBeInTheDocument();
        expect(screen.queryByText("Inga spex än")).not.toBeInTheDocument();
    });
});
