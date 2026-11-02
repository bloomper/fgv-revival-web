import {beforeEach, describe, expect, it, vi} from "vitest";
import {changeStatus, createRevival, deleteRevival, getMe, getRevival, getRevivalShell, getRevivalWorkSummary, getRevivals, getUpcomingRevivals, updateRevival} from "@/lib/revival/revival.server";

const {runQuery, runMutation} = vi.hoisted(() => ({runQuery: vi.fn(), runMutation: vi.fn()}));

vi.mock("@/lib/graphql.server", () => ({runQuery, runMutation}));

const RESULT = {result: true};

beforeEach(() => {
    runQuery.mockReset();
    runMutation.mockReset();
});

describe("revival.server", () => {
    it("getUpcomingRevivals sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getUpcomingRevivals();
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({});
        runQuery.mockResolvedValue({upcomingRevivals: RESULT});
        expect(await getUpcomingRevivals()).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getUpcomingRevivals()).toEqual([]);
    });

    it("getMe sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getMe();
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({});
        runQuery.mockResolvedValue({me: RESULT});
        expect(await getMe()).toBe(RESULT);
    });

    it("getRevivalShell sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getRevivalShell("id-1");
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({id: "id-1"});
        runQuery.mockResolvedValue({revival: RESULT});
        expect(await getRevivalShell("id-1")).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getRevivalShell("id-1")).toEqual(null);
    });

    it("getRevivalWorkSummary sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getRevivalWorkSummary("id-1");
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({id: "id-1"});
        runQuery.mockResolvedValue({revival: {workSummary: RESULT}});
        expect(await getRevivalWorkSummary("id-1")).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getRevivalWorkSummary("id-1")).toEqual(null);
    });

    it("getRevivals sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getRevivals((["status-1"] as never));
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toMatchObject({});
        runQuery.mockResolvedValue({revivals: RESULT});
        expect(await getRevivals((["status-1"] as never))).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getRevivals((["status-1"] as never))).toEqual([]);
    });

    it("getRevival sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getRevival("id-1");
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({id: "id-1"});
        runQuery.mockResolvedValue({revival: RESULT});
        expect(await getRevival("id-1")).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getRevival("id-1")).toEqual(null);
    });

    it("createRevival sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await createRevival(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
        runMutation.mockResolvedValue({revivalCreate: RESULT});
        expect(await createRevival(({marker: "input"} as never))).toBe(RESULT);
    });

    it("updateRevival sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await updateRevival(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
        runMutation.mockResolvedValue({revivalUpdate: RESULT});
        expect(await updateRevival(({marker: "input"} as never))).toBe(RESULT);
    });

    it("changeStatus sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await changeStatus(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
        runMutation.mockResolvedValue({revivalStatusChange: RESULT});
        expect(await changeStatus(({marker: "input"} as never))).toBe(RESULT);
    });

    it("deleteRevival sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await deleteRevival("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

});
