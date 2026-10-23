import {describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen, within} from "@testing-library/react";
import {RevivalAdminTable} from "@/components/revival/revival-admin-table.client";
import {revivalDetail} from "@/components/revival/__tests__/fixtures";

const push = vi.fn();

vi.mock("next/navigation", () => ({useRouter: () => ({push, refresh: vi.fn()})}));
vi.mock("@/app/(app)/revivals/manage/actions.server", () => ({
    searchSpexAction: vi.fn(),
    createRevivalAction: vi.fn(),
    updateRevivalAction: vi.fn(),
    deleteRevivalsAction: vi.fn(),
}));

const permissions = revivalDetail().permissions;
const revivals = [
    revivalDetail({id: "1", title: "Ali Baba 2028", year: 2028}),
    revivalDetail({id: "2", title: "Nobel 2030", year: 2030, status: "PROPOSED", spex: {id: "2", title: "Nobel", year: 1988, available: true}}),
    revivalDetail({id: "3", title: "Snorre 2027", year: 2027, status: "OPEN", spex: {id: "3", title: "Snorre", year: 1974, available: true}}),
];

function spex() {
    return screen.getAllByRole("row").slice(1).map(row => within(row).getAllByRole("cell")[2].textContent);
}

describe("RevivalAdminTable", () => {
    it("lists spex with their original year, newest revival first", () => {
        render(<RevivalAdminTable revivals={revivals}/>);

        expect(spex()).toEqual(["Nobel (1988)", "Ali Baba (1987)", "Snorre (1974)"]);
        expect(screen.queryByText("Revival.directeurs")).not.toBeInTheDocument();
        expect(screen.queryByText("Revival.premiereDate")).not.toBeInTheDocument();
    });

    it("filters on title and year", () => {
        render(<RevivalAdminTable revivals={revivals}/>);

        fireEvent.change(screen.getByRole("textbox", {name: "Common.search"}), {target: {value: "1974"}});

        expect(spex()).toEqual(["Snorre (1974)"]);
    });

    it("opens the revival from its row, but not from its checkbox", () => {
        render(<RevivalAdminTable revivals={revivals}/>);

        fireEvent.click(screen.getByRole("checkbox", {name: /Admin.selectRow.*Snorre 2027/}));
        expect(push).not.toHaveBeenCalled();

        fireEvent.click(screen.getByText("2027"));
        expect(push).toHaveBeenCalledWith("/revivals/3");
        expect(screen.queryByRole("combobox", {name: /Revival.changeStatus/})).not.toBeInTheDocument();
    });

    it("offers the row actions and deleting the selected revivals only when the server allows them", () => {
        const allowed = {...permissions, canEditCore: true, canDelete: true};
        const {rerender} = render(<RevivalAdminTable revivals={revivals}/>);

        expect(screen.queryByRole("button", {name: /Admin.openMenu/})).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("checkbox", {name: /Admin.selectRow.*Nobel 2030/}));
        expect(screen.queryByRole("button", {name: /Admin.deleteSelected/})).not.toBeInTheDocument();

        rerender(<RevivalAdminTable revivals={revivals.map(revival => ({...revival, permissions: allowed}))}/>);
        expect(screen.getAllByRole("button", {name: /Admin.openMenu/})).toHaveLength(3);
        fireEvent.click(screen.getByRole("checkbox", {name: /Admin.selectAll/}));
        expect(screen.getByRole("button", {name: /Admin.deleteSelected/})).toBeInTheDocument();
    });

    it("places the given actions in the toolbar", () => {
        render(<RevivalAdminTable revivals={revivals} actions={<button>Ny</button>}/>);

        expect(screen.getByRole("button", {name: "Ny"})).toBeInTheDocument();
    });
});
