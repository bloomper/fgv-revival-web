import {describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen, within} from "@testing-library/react";
import {RevivalAdminTable} from "@/components/revival/revival-admin-table.client";
import {revivalDetail} from "@/components/revival/__tests__/fixtures";

const push = vi.fn();

vi.mock("next/navigation", () => ({useRouter: () => ({push, refresh: vi.fn()})}));

const revivals = [
    revivalDetail({id: "1", workingTitle: "Ali Baba 2028", year: 2028, premiereDate: "2028-02-10"}),
    revivalDetail({id: "2", workingTitle: "Nobel 2030", year: 2030, premiereDate: null, status: "PROPOSED",
        spex: {id: "2", title: "Nobel", year: 1988, available: true}}),
    revivalDetail({id: "3", workingTitle: "Snorre 2027", year: 2027, premiereDate: "2027-03-01", status: "OPEN",
        spex: {id: "3", title: "Snorre", year: 1974, available: true}}),
];

function titles() {
    return screen.getAllByRole("row").slice(1).map(row => within(row).getAllByRole("cell")[0].textContent);
}

describe("RevivalAdminTable", () => {
    it("sorts by premiere, latest first and revivals without one last", () => {
        render(<RevivalAdminTable revivals={revivals}/>);

        expect(titles()).toEqual(["Ali Baba 2028", "Snorre 2027", "Nobel 2030"]);
    });

    it("filters on title and year", () => {
        render(<RevivalAdminTable revivals={revivals}/>);

        fireEvent.change(screen.getByRole("textbox", {name: "Common.search"}), {target: {value: "1974"}});

        expect(titles()).toEqual(["Snorre 2027"]);
    });

    it("opens the revival from its row and has no status or directeur controls", () => {
        render(<RevivalAdminTable revivals={revivals}/>);

        fireEvent.click(screen.getByText("Snorre 2027"));

        expect(push).toHaveBeenCalledWith("/revivals/3");
        expect(screen.queryByRole("combobox", {name: /Revival.changeStatus/})).not.toBeInTheDocument();
        expect(screen.queryByRole("button", {name: /Directeur/i})).not.toBeInTheDocument();
    });

    it("places the given actions in the toolbar", () => {
        render(<RevivalAdminTable revivals={revivals} actions={<button>Ny</button>}/>);

        expect(screen.getByRole("button", {name: "Ny"})).toBeInTheDocument();
    });
});
