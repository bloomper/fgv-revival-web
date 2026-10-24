import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {act, render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {plannedOperations, SYNC_POLL_MS, SyncPanel} from "@/components/closing/sync-panel.client";

const actions = vi.hoisted(() => ({startSyncAction: vi.fn(), syncRunAction: vi.fn(), syncFinishedAction: vi.fn()}));
const track = vi.hoisted(() => vi.fn());
const refresh = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({useRouter: () => ({refresh})}));
vi.mock("@/app/(app)/revivals/[id]/closing/actions.server", () => actions);
vi.mock("@/hooks/use-action-feedback", () => ({useActionFeedback: () => (result: { ok: boolean }) => result.ok}));
vi.mock("@/utils/umami", () => ({track}));

const run = (status: "RUNNING" | "DONE" | "FAILED", done: number, failed = 0) => ({
    id: "run-1", status, startedBy: {id: "p1", displayName: "Dana Directeur"}, startedAt: "2026-10-23T10:00:00Z",
    finishedAt: status === "RUNNING" ? null : "2026-10-23T10:01:00Z", total: 3, done, failed,
    failures: failed ? [{
        participant: {id: "1", displayName: "Anna Andersson"},
        operation: "TASK" as const,
        reason: "REFUSED"
    }] : [],
});

const preview = (lastRun: ReturnType<typeof run> | null = null) => ({
    revivalId: "1",
    hash: "abc",
    spexregisterRevivalExists: false,
    participants: [
        {
            participant: {id: "1", displayName: "Anna Andersson", position: {id: "T-ENS", name: "Ensemble"}},
            operations: [
                {operation: "PARTICIPATION" as const, detail: null, exists: true},
                {operation: "TASK" as const, detail: "Ensemble", exists: false},
            ],
        },
    ],
    excluded: [{id: "2", displayName: "Disa Deltagare"}],
    membershipYear: null,
    lastRun,
});

beforeEach(() => {
    vi.clearAllMocks();
});

afterEach(() => {
    vi.useRealTimers();
});

describe("plannedOperations", () => {
    it("counts what does not exist, and creating the revival when Spexregister lacks it", () => {
        expect(plannedOperations(preview())).toBe(2);
        expect(plannedOperations({...preview(), spexregisterRevivalExists: true})).toBe(1);
    });
});

describe("SyncPanel", () => {
    it("shows what is already there, who is left out, and starts with the preview's hash", async () => {
        actions.startSyncAction.mockResolvedValue({ok: true, data: run("RUNNING", 0)});
        render(<SyncPanel revivalId="1" preview={preview()} canSync/>);

        expect(screen.getByText(/operation\.PARTICIPATION.*exists/)).toBeInTheDocument();
        expect(screen.getByText("operation.TASK: Ensemble")).toBeInTheDocument();
        expect(screen.getByText("Disa Deltagare")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", {name: "start"}));
        await userEvent.click(within(await screen.findByRole("alertdialog")).getByRole("button", {name: "start"}));

        await waitFor(() => expect(actions.startSyncAction).toHaveBeenCalledWith({revivalId: "1", previewHash: "abc"}));
        expect(track).toHaveBeenCalledWith("sync-start", {participants: 1});
        expect(await screen.findByTestId("sync-run")).toHaveTextContent("runStatus.RUNNING");
    });

    it("polls a running run until it ends, then refreshes", async () => {
        vi.useFakeTimers({shouldAdvanceTime: true});
        actions.syncRunAction.mockResolvedValueOnce({
            ok: true,
            data: run("RUNNING", 1)
        }).mockResolvedValueOnce({ok: true, data: run("FAILED", 2, 1)});
        render(<SyncPanel revivalId="1" preview={preview(run("RUNNING", 0))} canSync/>);

        expect(screen.getByRole("button", {name: "start"})).toBeDisabled();
        await act(async () => vi.advanceTimersByTimeAsync(SYNC_POLL_MS));
        await act(async () => vi.advanceTimersByTimeAsync(SYNC_POLL_MS));

        expect(actions.syncRunAction).toHaveBeenCalledWith({id: "run-1"});
        await waitFor(() => expect(refresh).toHaveBeenCalled());
        expect(actions.syncFinishedAction).toHaveBeenCalledWith("1");
        expect(screen.getByTestId("sync-run")).toHaveTextContent("Anna Andersson: operation.TASK – REFUSED");
        expect(screen.getByRole("button", {name: "resume"})).toBeEnabled();
    });

    it("offers no start without canSync", () => {
        render(<SyncPanel revivalId="1" preview={preview()} canSync={false}/>);

        expect(screen.queryByRole("button", {name: "start"})).not.toBeInTheDocument();
    });
});
