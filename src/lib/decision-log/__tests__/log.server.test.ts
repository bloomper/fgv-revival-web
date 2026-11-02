import {beforeEach, describe, expect, it, vi} from "vitest";
import {answerLogEntry, createLogEntry, getRevivalLog, updateLogEntry} from "@/lib/decision-log/log.server";

const {runQuery, runMutation} = vi.hoisted(() => ({runQuery: vi.fn(), runMutation: vi.fn()}));

vi.mock("@/lib/graphql.server", () => ({runQuery, runMutation}));

const RESULT = {result: true};

beforeEach(() => {
    runQuery.mockReset();
    runMutation.mockReset();
});

describe("log.server", () => {
    it("getRevivalLog sends its variables", async () => {
        runQuery.mockResolvedValue(undefined);
        await getRevivalLog("revivalId-1", ({marker: "filter"} as never));
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({id: "revivalId-1", filter: ({marker: "filter"} as never)});
    });

    it("createLogEntry sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await createLogEntry(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
        runMutation.mockResolvedValue({logEntryCreate: RESULT});
        expect(await createLogEntry(({marker: "input"} as never))).toBe(RESULT);
    });

    it("updateLogEntry sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await updateLogEntry(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
        runMutation.mockResolvedValue({logEntryUpdate: RESULT});
        expect(await updateLogEntry(({marker: "input"} as never))).toBe(RESULT);
    });

    it("answerLogEntry sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await answerLogEntry(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
        runMutation.mockResolvedValue({logEntryAnswer: RESULT});
        expect(await answerLogEntry(({marker: "input"} as never))).toBe(RESULT);
    });

});
