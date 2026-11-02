import {beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
    EMPTY_TRANSACTION_FILTER,
    filterTransactions,
    TransactionTable,
    type TransactionRow
} from "@/components/budget/transaction-table.client";
import * as actions from "@/app/(app)/revivals/[id]/budget/actions.server";
import {removeReceipt} from "@/components/budget/receipt";
import {toast} from "sonner";
import {router} from "@/test/next-navigation";

vi.mock("next/navigation", async () => (await import("@/test/next-navigation")).navigation);
vi.mock("@/app/(app)/revivals/[id]/budget/actions.server", () => ({
    cancelTransactionAction: vi.fn(),
    setReimbursedAction: vi.fn(),
    createTransactionAction: vi.fn(),
    updateTransactionAction: vi.fn(),
}));
vi.mock("@/components/budget/receipt", () => ({
    receiptUrl: (id: string) => `/api/receipts/${id}`,
    removeReceipt: vi.fn(),
    uploadReceipt: vi.fn(),
}));
vi.mock("@/components/history/history-dialog.client", () => ({HistoryDialog: () => null}));
vi.mock("sonner", () => ({toast: {success: vi.fn(), error: vi.fn()}}));

const food = {id: "FOOD", kind: "COST", name: {sv: "Mat", en: "Food"}, retired: false} as const;
const tickets = {id: "TICKETS", kind: "INCOME", name: {sv: "Biljetter", en: "Tickets"}, retired: false} as const;

const transactions = [
    {
        id: "t1", version: 1, date: "2026-03-01", amount: "-450.00", category: food, description: "Fika till repet",
        budgetLine: {id: "l1", description: "Repfika"}, paidBy: {person: {id: "p1", displayName: "Sam"}, name: null},
        reimbursed: false, receipt: null, cancelled: false,
    },
    {
        id: "t2", version: 1, date: "2026-04-01", amount: "12000.00", category: tickets, description: "Biljettintäkter",
        budgetLine: null, paidBy: null, reimbursed: false,
        receipt: {filename: "kvitto.pdf", contentType: "application/pdf", size: 10, uploadedAt: "2026-04-01T10:00:00Z"},
        cancelled: false,
    },
    {
        id: "t3", version: 1, date: "2026-05-01", amount: "-100.00", category: food, description: "Makulerad", budgetLine: null,
        paidBy: {person: null, name: "Extern"}, reimbursed: true, receipt: null, cancelled: true,
    },
] as unknown as TransactionRow[];

function show(canWrite = true) {
    return render(<TransactionTable revivalId="r1" transactions={transactions} categories={[food, tickets] as never}
                                    lines={[]} members={[]} canWrite={canWrite} showCancelled/>);
}

beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(actions.setReimbursedAction).mockResolvedValue({ok: true, data: null} as never);
    vi.mocked(actions.cancelTransactionAction).mockResolvedValue({ok: true, data: null} as never);
});

describe("filterTransactions", () => {
    const ids = (filter: Partial<typeof EMPTY_TRANSACTION_FILTER>) =>
        filterTransactions(transactions, {...EMPTY_TRANSACTION_FILTER, ...filter}, "sv").map(row => row.id);

    it("matches every word against the description, category, line, payer and date", () => {
        expect(ids({query: "repfika sam"})).toEqual(["t1"]);
        expect(ids({query: "biljetter"})).toEqual(["t2"]);
        expect(ids({query: "2026-05"})).toEqual(["t3"]);
        expect(ids({query: "extern mat"})).toEqual(["t3"]);
    });

    it("filters by category, kind, reimbursement and receipt", () => {
        expect(ids({categories: new Set(["TICKETS"])})).toEqual(["t2"]);
        expect(ids({kinds: new Set(["COST"])})).toEqual(["t1", "t3"]);
        expect(ids({notReimbursed: true})).toEqual(["t1"]);
        expect(ids({missingReceipt: true})).toEqual(["t1", "t3"]);
    });
});

describe("TransactionTable", () => {
    it("lists the transactions with their state", () => {
        show();

        expect(screen.getByText("Fika till repet")).toBeInTheDocument();
        expect(screen.getByText("Biljettintäkter")).toBeInTheDocument();
        expect(screen.getByText("cancelled")).toBeInTheDocument();
        expect(screen.getByRole("link", {name: /downloadReceipt/})).toHaveAttribute("href", "/api/receipts/t2");
    });

    it("searches and filters, and resets", async () => {
        show();

        await userEvent.type(screen.getByRole("textbox", {name: "Common.search"}), "biljett");
        expect(screen.queryByText("Fika till repet")).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", {name: "Common.clearSearch"}));
        await userEvent.click(screen.getByRole("button", {name: "Budget.missingReceipt"}));
        expect(screen.queryByText("Biljettintäkter")).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", {name: /Common.reset/}));
        expect(screen.getByText("Biljettintäkter")).toBeInTheDocument();
    });

    it("marks a cost reimbursed", async () => {
        show();

        await userEvent.click(screen.getByRole("switch", {name: /reimbursedFor/}));

        await waitFor(() => expect(actions.setReimbursedAction).toHaveBeenCalledWith({revivalId: "r1", id: "t1", version: 1, reimbursed: true}));
        expect(toast.success).toHaveBeenCalledWith("markedReimbursed");
        expect(router.refresh).toHaveBeenCalled();
    });

    it("cancels a transaction from its menu", async () => {
        show();

        await userEvent.click(screen.getByRole("button", {name: `rowMenu:${JSON.stringify({name: "Fika till repet"})}`}));
        await userEvent.click(await screen.findByRole("menuitem", {name: /cancelTransaction/}));
        const dialog = await screen.findByRole("alertdialog");

        await userEvent.click(within(dialog).getByRole("button", {name: "Budget.cancelTransaction"}));

        await waitFor(() => expect(actions.cancelTransactionAction).toHaveBeenCalledWith(expect.objectContaining({id: "t1", version: 1})));
    });

    it("removes a receipt", async () => {
        vi.mocked(removeReceipt).mockResolvedValue({ok: true} as never);
        show();

        await userEvent.click(screen.getByRole("button", {name: `rowMenu:${JSON.stringify({name: "Biljettintäkter"})}`}));
        await userEvent.click(await screen.findByRole("menuitem", {name: /removeReceipt/}));

        await waitFor(() => expect(removeReceipt).toHaveBeenCalledWith("t2"));
    });

    it("shows a read-only table without write controls", () => {
        show(false);

        expect(screen.queryByRole("button", {name: /Budget.newTransaction/})).not.toBeInTheDocument();
        expect(screen.queryByRole("switch", {name: /reimbursedFor/})).not.toBeInTheDocument();
        expect(screen.getAllByText("reimbursedNo").length).toBeGreaterThan(0);
    });
});
