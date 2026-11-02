import {beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {LogTable} from "@/components/decision-log/log-table.client";
import * as actions from "@/app/(app)/revivals/[id]/log/actions.server";
import type {LogEntryFieldsFragment} from "@/gql/graphql";

vi.mock("next/navigation", async () => (await import("@/test/next-navigation")).navigation);
vi.mock("@/app/(app)/revivals/[id]/log/actions.server", () => ({
    createLogEntryAction: vi.fn(),
    updateLogEntryAction: vi.fn(),
    answerLogEntryAction: vi.fn(),
}));
vi.mock("@/components/history/history-dialog.client", () => ({HistoryDialog: () => <div data-testid="history"/>}));
vi.mock("@/components/decision-log/log-entry-dialog.client", () => ({LogEntryDialog: () => <div data-testid="entry-dialog"/>}));
vi.mock("@/components/decision-log/log-answer-dialog.client", () => ({LogAnswerDialog: () => <div data-testid="answer-dialog"/>}));
vi.mock("sonner", () => ({toast: {success: vi.fn(), error: vi.fn()}}));

const base = {
    owner: null, deadline: null, overdue: false, comment: null, tags: [], meeting: null, guideItemKey: null, guideItem: null,
    checklistItem: null, event: null, budgetLines: [], answers: null, answeredBy: null, origin: "MANUAL",
    createdBy: "sam@example.com", createdAt: "2026-02-01T10:00:00Z",
};

const entries = [
    {...base, id: "e1", number: 1, date: "2026-02-01", type: "DECISION", text: "Vi spelar Nobel", status: "DONE", version: 1, tags: ["Repertoar"]},
    {
        ...base, id: "e2", number: 2, date: "2026-02-02", type: "QUESTION", text: "Vem bokar lokal?", status: "OPEN", version: 3,
        deadline: "2026-03-01", overdue: true, comment: "Brådskande",
        event: {id: "ev1", title: "Premiär", startDate: "2026-05-01", cancelled: false},
    },
    {
        ...base, id: "e3", number: 3, date: "2026-02-03", type: "DECISION", text: "Kulturhuset", status: "OPEN", version: 1,
        answers: {id: "e2", number: 2, type: "QUESTION", status: "OPEN"},
    },
] as unknown as LogEntryFieldsFragment[];

function show(canWrite = true) {
    return render(<LogTable revivalId="r1" entries={entries} members={[]} tags={["Repertoar"]} canWrite={canWrite}/>);
}

beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(actions.updateLogEntryAction).mockResolvedValue({ok: true, data: null} as never);
});

describe("LogTable", () => {
    it("lists the entries with their links", () => {
        show();

        expect(screen.getByText("Vi spelar Nobel")).toBeInTheDocument();
        expect(screen.getByText("Brådskande")).toBeInTheDocument();
        expect(screen.getByText("Repertoar")).toBeInTheDocument();
        expect(screen.getByText(`answersRow:${JSON.stringify({number: 2})}`)).toBeInTheDocument();
        expect(screen.getByRole("link", {name: /Premiär/})).toHaveAttribute("href", "/revivals/r1/events");
    });

    it("sets another status from the row menu", async () => {
        show();

        await userEvent.click(screen.getByRole("button", {name: `rowMenu:${JSON.stringify({number: 2})}`}));
        await userEvent.click(await screen.findByRole("menuitem", {name: "status.DONE"}));

        await waitFor(() => expect(actions.updateLogEntryAction).toHaveBeenCalledWith({
            id: "e2", version: 3, revivalId: "r1", meetingId: undefined, values: {status: "DONE"},
        }));
    });

    it("answers an open question, and opens the history and the editor", async () => {
        show();

        await userEvent.click(screen.getByRole("button", {name: `rowMenu:${JSON.stringify({number: 2})}`}));
        await userEvent.click(await screen.findByRole("menuitem", {name: /answerRow/}));
        expect(await screen.findByTestId("answer-dialog")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", {name: `rowMenu:${JSON.stringify({number: 1})}`}));
        await userEvent.click(await screen.findByRole("menuitem", {name: /History.menu|menu/}));
        expect(await screen.findByTestId("history")).toBeInTheDocument();

        await userEvent.click(screen.getByText("Kulturhuset"));
        expect(await screen.findByTestId("entry-dialog")).toBeInTheDocument();
    });

    it("adds an entry", async () => {
        show();

        await userEvent.click(screen.getByRole("button", {name: /^add$/}));

        expect(await screen.findByTestId("entry-dialog")).toBeInTheDocument();
    });

    it("offers readers only the history", async () => {
        show(false);

        expect(screen.queryByRole("button", {name: /^add$/})).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", {name: `rowMenu:${JSON.stringify({number: 2})}`}));
        expect(screen.queryByRole("menuitem", {name: /editRow/})).not.toBeInTheDocument();
        expect(await screen.findByRole("menuitem", {name: /menu/})).toBeInTheDocument();
    });

    it("shows its own empty message", () => {
        render(<LogTable revivalId="r1" entries={[]} members={[]} tags={[]} canWrite={false} emptyMessage="Inget beslutat"/>);

        expect(screen.getByText("Inget beslutat")).toBeInTheDocument();
        expect(screen.getByText("emptyReadOnly")).toBeInTheDocument();
    });
});
