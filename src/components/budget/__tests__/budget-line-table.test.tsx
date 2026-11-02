import {beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {BudgetLineTable, type BudgetLineRow, filterBudgetLines} from "@/components/budget/budget-line-table.client";
import * as actions from "@/app/(app)/revivals/[id]/budget/actions.server";

vi.mock("next/navigation", async () => (await import("@/test/next-navigation")).navigation);
vi.mock("@/app/(app)/revivals/[id]/budget/actions.server", () => ({
    removeBudgetLineAction: vi.fn(),
    restoreBudgetLineAction: vi.fn(),
    createBudgetLineAction: vi.fn(),
    updateBudgetLineAction: vi.fn(),
}));
vi.mock("@/components/history/history-dialog.client", () => ({HistoryDialog: () => <div data-testid="history"/>}));
vi.mock("sonner", () => ({toast: {success: vi.fn(), error: vi.fn()}}));

const venue = {id: "VENUE", kind: "COST", name: {sv: "Lokal", en: "Venue"}, retired: false};
const tickets = {id: "TICKETS", kind: "INCOME", name: {sv: "Biljetter", en: "Tickets"}, retired: false};

const lines = [
    {
        id: "l1", version: 1, category: venue, description: "Hyra av scen", quantity: 3, unitAmount: "-5000.00", amount: "-15000.00",
        event: {id: "ev1", title: "Premiär", startDate: "2026-05-01"}, logEntry: {id: "e1", number: 4}, comment: "Med teknik",
        removed: false,
    },
    {
        id: "l2", version: 2, category: tickets, description: "Biljettintäkter", quantity: 200, unitAmount: "150.00", amount: "30000.00",
        event: null, logEntry: null, comment: null, removed: true,
    },
] as unknown as BudgetLineRow[];

function show(canWrite = true) {
    return render(<BudgetLineTable revivalId="r1" lines={lines} proposals={[]} categories={[venue, tickets] as never}
                                   events={[]} decisions={[]} canWrite={canWrite} showRemoved/>);
}

beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(actions.removeBudgetLineAction).mockResolvedValue({ok: true, data: null} as never);
    vi.mocked(actions.restoreBudgetLineAction).mockResolvedValue({ok: true, data: null} as never);
});

describe("filterBudgetLines", () => {
    it("matches the description, category, event and comment within the chosen categories", () => {
        expect(filterBudgetLines(lines, "premiär teknik", new Set(), "sv").map(line => line.id)).toEqual(["l1"]);
        expect(filterBudgetLines(lines, "biljetter", new Set(), "sv").map(line => line.id)).toEqual(["l2"]);
        expect(filterBudgetLines(lines, "", new Set(["VENUE"]), "sv").map(line => line.id)).toEqual(["l1"]);
        expect(filterBudgetLines(lines, "hyra", new Set(["TICKETS"]), "sv")).toEqual([]);
    });
});

describe("BudgetLineTable", () => {
    it("lists the lines, marking what is removed", () => {
        show();

        expect(screen.getByText("Hyra av scen")).toBeInTheDocument();
        expect(screen.getByText("Biljettintäkter")).toBeInTheDocument();
        expect(screen.getByText("removed")).toBeInTheDocument();
    });

    it("searches and clears the search", async () => {
        show();

        await userEvent.type(screen.getByRole("textbox", {name: "Common.search"}), "hyra");
        expect(screen.queryByText("Biljettintäkter")).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", {name: "Common.clearSearch"}));
        expect(screen.getByText("Biljettintäkter")).toBeInTheDocument();
    });

    it("removes and restores lines", async () => {
        show();

        await userEvent.click(screen.getByRole("button", {name: `rowMenu:${JSON.stringify({name: "Hyra av scen"})}`}));
        await userEvent.click(await screen.findByRole("menuitem", {name: /^remove$/}));
        await waitFor(() => expect(actions.removeBudgetLineAction).toHaveBeenCalledWith({revivalId: "r1", id: "l1", version: 1}));

        await userEvent.click(screen.getByRole("button", {name: `rowMenu:${JSON.stringify({name: "Biljettintäkter"})}`}));
        await userEvent.click(await screen.findByRole("menuitem", {name: /^restore$/}));
        await waitFor(() => expect(actions.restoreBudgetLineAction).toHaveBeenCalledWith({revivalId: "r1", id: "l2", version: 2}));
    });

    it("opens the history and the editor", async () => {
        show();

        await userEvent.click(screen.getByRole("button", {name: `rowMenu:${JSON.stringify({name: "Hyra av scen"})}`}));
        await userEvent.click(await screen.findByRole("menuitem", {name: /menu/}));
        expect(await screen.findByTestId("history")).toBeInTheDocument();

        await userEvent.click(screen.getByText("Hyra av scen"));
        expect(await screen.findByRole("dialog")).toBeInTheDocument();
    });

    it("offers no changes to those who only read", () => {
        show(false);

        expect(screen.queryByRole("button", {name: /Budget.newLine|newLine/})).not.toBeInTheDocument();
    });
});
