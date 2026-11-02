import {beforeEach, describe, expect, it, vi} from "vitest";
import {addMember, removeMember, searchMemberCandidates, setCapabilities} from "@/lib/member/member.server";

const {runQuery, runMutation} = vi.hoisted(() => ({runQuery: vi.fn(), runMutation: vi.fn()}));

vi.mock("@/lib/graphql.server", () => ({runQuery, runMutation}));

const RESULT = {result: true};

beforeEach(() => {
    runQuery.mockReset();
    runMutation.mockReset();
});

describe("member.server", () => {
    it("searchMemberCandidates sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await searchMemberCandidates("revivalId-1", "query-1");
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({revivalId: "revivalId-1", query: "query-1"});
        runQuery.mockResolvedValue({revivalMemberCandidates: RESULT});
        expect(await searchMemberCandidates("revivalId-1", "query-1")).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await searchMemberCandidates("revivalId-1", "query-1")).toEqual([]);
    });

    it("addMember sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await addMember(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
        runMutation.mockResolvedValue({revivalMemberAdd: RESULT});
        expect(await addMember(({marker: "input"} as never))).toBe(RESULT);
    });

    it("setCapabilities sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await setCapabilities(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
        runMutation.mockResolvedValue({revivalMemberCapabilitiesSet: RESULT});
        expect(await setCapabilities(({marker: "input"} as never))).toBe(RESULT);
    });

    it("removeMember sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await removeMember("id-1");
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1"});
    });

});
