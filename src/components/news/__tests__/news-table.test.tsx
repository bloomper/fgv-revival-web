import {beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {filterNews, NewsTable} from "@/components/news/news-table.client";
import type {NewsItem} from "@/components/news/news";
import * as actions from "@/app/(app)/admin/news/actions.server";
import {toast} from "sonner";

vi.mock("next/navigation", async () => (await import("../../../../test/next-navigation")).navigation);
vi.mock("@/app/(app)/admin/news/actions.server", () => ({
    createNewsAction: vi.fn(),
    updateNewsAction: vi.fn(),
    deleteNewsAction: vi.fn(),
}));
vi.mock("@/components/history/history-dialog.client", () => ({HistoryDialog: () => <div data-testid="history"/>}));
vi.mock("sonner", () => ({toast: {success: vi.fn(), error: vi.fn()}}));

const news: NewsItem[] = [
    {id: "n1", subject: "Årsmöte", text: "Välkomna till årsmötet", visibleFrom: "2026-01-01", visibleTo: null, published: true, version: 1},
    {id: "n2", subject: "Utkast", text: "Inte klart", visibleFrom: null, visibleTo: null, published: false, version: 0},
    {id: "n3", subject: "Kommande", text: "Snart", visibleFrom: "2999-01-01", visibleTo: null, published: false, version: 0},
];

beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(actions.createNewsAction).mockResolvedValue({ok: true, data: null} as never);
    vi.mocked(actions.updateNewsAction).mockResolvedValue({ok: true, data: null} as never);
    vi.mocked(actions.deleteNewsAction).mockResolvedValue({ok: true, data: null} as never);
});

describe("filterNews", () => {
    const rows = [{...news[0], state: "PUBLISHED" as const}, {...news[1], state: "DRAFT" as const}];

    it("matches every word in the subject or text, within the chosen states", () => {
        expect(filterNews(rows, "välkomna årsmöte", new Set()).map(row => row.id)).toEqual(["n1"]);
        expect(filterNews(rows, "", new Set(["DRAFT"])).map(row => row.id)).toEqual(["n2"]);
        expect(filterNews(rows, "klart", new Set(["PUBLISHED"]))).toEqual([]);
    });
});

describe("NewsTable", () => {
    it("lists the news with their states", () => {
        render(<NewsTable news={news}/>);

        expect(screen.getByText("states.PUBLISHED")).toBeInTheDocument();
        expect(screen.getByText("states.DRAFT")).toBeInTheDocument();
        expect(screen.getByText("states.SCHEDULED")).toBeInTheDocument();
    });

    it("searches and clears the search", async () => {
        render(<NewsTable news={news}/>);

        await userEvent.type(screen.getByRole("textbox", {name: "Common.search"}), "utkast");
        expect(screen.queryByText("Årsmöte")).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", {name: "Common.clearSearch"}));
        expect(screen.getByText("Årsmöte")).toBeInTheDocument();
    });

    it("edits a piece from its row", async () => {
        render(<NewsTable news={news}/>);

        await userEvent.click(screen.getByText("Årsmöte"));
        const dialog = await screen.findByRole("dialog");

        expect(within(dialog).getByLabelText("News.subject")).toHaveValue("Årsmöte");
        await userEvent.type(within(dialog).getByLabelText("News.subject"), "!");
        await userEvent.click(within(dialog).getByRole("button", {name: "Common.save"}));

        await waitFor(() => expect(actions.updateNewsAction).toHaveBeenCalledWith({
            id: "n1", version: 1, values: expect.objectContaining({subject: "Årsmöte!"}),
        }));
        expect(toast.success).toHaveBeenCalledWith("Common.saved");
    });

    it("creates a piece", async () => {
        render(<NewsTable news={news}/>);

        await userEvent.click(screen.getByRole("button", {name: /News.create/}));
        const dialog = await screen.findByRole("dialog");

        await userEvent.type(within(dialog).getByLabelText("News.subject"), "Kalas");
        await userEvent.type(within(dialog).getByLabelText("News.text"), "Välkomna");
        await userEvent.click(within(dialog).getByRole("button", {name: "Common.save"}));

        await waitFor(() => expect(actions.createNewsAction).toHaveBeenCalledWith({values: expect.objectContaining({subject: "Kalas", text: "Välkomna"})}));
    });

    it("deletes a piece and shows its history", async () => {
        render(<NewsTable news={news}/>);

        await userEvent.click(screen.getByRole("button", {name: `News.rowMenu:${JSON.stringify({subject: "Utkast"})}`}));
        await userEvent.click(await screen.findByRole("menuitem", {name: /History.menu/}));
        expect(await screen.findByTestId("history")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", {name: `News.rowMenu:${JSON.stringify({subject: "Utkast"})}`}));
        await userEvent.click(await screen.findByRole("menuitem", {name: /Common.delete/}));
        await userEvent.click(within(await screen.findByRole("alertdialog")).getByRole("button", {name: "Common.delete"}));

        await waitFor(() => expect(actions.deleteNewsAction).toHaveBeenCalledWith({id: "n2", version: 0}));
    });

    it("says when there is no news", () => {
        render(<NewsTable news={[]}/>);

        expect(screen.getByText("News.empty")).toBeInTheDocument();
    });
});
