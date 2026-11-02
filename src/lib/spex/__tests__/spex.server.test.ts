import {beforeEach, describe, expect, it, vi} from "vitest";
import {searchSpex} from "@/lib/spex/spex.server";

const {runQuery, runMutation} = vi.hoisted(() => ({runQuery: vi.fn(), runMutation: vi.fn()}));

vi.mock("@/lib/graphql.server", () => ({runQuery, runMutation}));

const RESULT = {result: true};

beforeEach(() => {
    runQuery.mockReset();
    runMutation.mockReset();
});

describe("spex.server", () => {
    it("searchSpex sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await searchSpex("query-1");
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({query: "query-1", first: 20});
        runQuery.mockResolvedValue({spexSearch: RESULT});
        expect(await searchSpex("query-1")).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await searchSpex("query-1")).toEqual([]);
    });

});
