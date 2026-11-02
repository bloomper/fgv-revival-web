import {beforeEach, describe, expect, it, vi} from "vitest";
import {assignShift, createShiftSlot, getStaffing, getStaffingCandidates, removeShiftSlot, setAvailability, signUpForShift, unassignShift, updateShiftSlot, withdrawFromShift} from "@/lib/staffing/staffing.server";

const {runQuery, runMutation} = vi.hoisted(() => ({runQuery: vi.fn(), runMutation: vi.fn()}));

vi.mock("@/lib/graphql.server", () => ({runQuery, runMutation}));

const RESULT = {result: true};

beforeEach(() => {
    runQuery.mockReset();
    runMutation.mockReset();
});

describe("staffing.server", () => {
    it("getStaffing sends its variables", async () => {
        runQuery.mockResolvedValue(undefined);
        await getStaffing("revivalId-1");
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({id: "revivalId-1"});
    });

    it("getStaffingCandidates sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getStaffingCandidates("revivalId-1");
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({revivalId: "revivalId-1"});
        runQuery.mockResolvedValue({participants: RESULT});
        expect(await getStaffingCandidates("revivalId-1")).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getStaffingCandidates("revivalId-1")).toEqual([]);
    });

    it("createShiftSlot sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await createShiftSlot(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
    });

    it("updateShiftSlot sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await updateShiftSlot("id-1", 3, ({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3, input: ({marker: "input"} as never)});
    });

    it("removeShiftSlot sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await removeShiftSlot("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

    it("assignShift sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await assignShift("slotId-1", "participantId-1");
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({slotId: "slotId-1", participantId: "participantId-1"});
    });

    it("unassignShift sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await unassignShift("slotId-1", "participantId-1");
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({slotId: "slotId-1", participantId: "participantId-1"});
    });

    it("signUpForShift sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await signUpForShift("slotId-1");
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({slotId: "slotId-1"});
    });

    it("withdrawFromShift sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await withdrawFromShift("slotId-1");
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({slotId: "slotId-1"});
    });

    it("setAvailability sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await setAvailability(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
    });

});
