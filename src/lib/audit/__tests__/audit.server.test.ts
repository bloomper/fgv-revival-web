import {beforeEach, describe, expect, it, vi} from "vitest";
import {getRevisions} from "@/lib/audit/audit.server";

const {runQuery, runMutation} = vi.hoisted(() => ({runQuery: vi.fn(), runMutation: vi.fn()}));

vi.mock("@/lib/graphql.server", () => ({runQuery, runMutation}));

const RESULT = {result: true};

beforeEach(() => {
    runQuery.mockReset();
    runMutation.mockReset();
});

describe("audit.server", () => {
    it("getRevisions sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getRevisions(({marker: "type"} as never), "id-1");
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({type: ({marker: "type"} as never), id: "id-1"});
        runQuery.mockResolvedValue({revisions: RESULT});
        expect(await getRevisions(({marker: "type"} as never), "id-1")).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getRevisions(({marker: "type"} as never), "id-1")).toEqual([]);
    });

});
