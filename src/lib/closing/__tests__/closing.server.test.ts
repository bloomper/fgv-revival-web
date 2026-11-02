import {beforeEach, describe, expect, it, vi} from "vitest";
import {anonymizeRevival, getMembershipParticipants, getRevivalClosing, getRevivalSyncSignal, getSyncPreview, setMembership, startSync} from "@/lib/closing/closing.server";

const {runQuery, runMutation} = vi.hoisted(() => ({runQuery: vi.fn(), runMutation: vi.fn()}));

vi.mock("@/lib/graphql.server", () => ({runQuery, runMutation}));

const RESULT = {result: true};

beforeEach(() => {
    runQuery.mockReset();
    runMutation.mockReset();
});

describe("closing.server", () => {
    it("getRevivalClosing sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getRevivalClosing("id-1");
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({id: "id-1"});
        runQuery.mockResolvedValue({revival: RESULT});
        expect(await getRevivalClosing("id-1")).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getRevivalClosing("id-1")).toEqual(null);
    });

    it("getRevivalSyncSignal sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getRevivalSyncSignal("id-1");
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({id: "id-1"});
        runQuery.mockResolvedValue({revival: {closing: {lastSync: RESULT}}});
        expect(await getRevivalSyncSignal("id-1")).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getRevivalSyncSignal("id-1")).toEqual(null);
    });

    it("getMembershipParticipants sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getMembershipParticipants("revivalId-1");
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({revivalId: "revivalId-1"});
        runQuery.mockResolvedValue({participants: RESULT});
        expect(await getMembershipParticipants("revivalId-1")).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getMembershipParticipants("revivalId-1")).toEqual([]);
    });

    it("getSyncPreview sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getSyncPreview("revivalId-1");
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({revivalId: "revivalId-1"});
        runQuery.mockResolvedValue({syncPreview: RESULT});
        expect(await getSyncPreview("revivalId-1")).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getSyncPreview("revivalId-1")).toEqual(null);
    });

    it("startSync sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await startSync("revivalId-1", "previewHash-1");
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({revivalId: "revivalId-1", previewHash: "previewHash-1"});
        runMutation.mockResolvedValue({syncStart: RESULT});
        expect(await startSync("revivalId-1", "previewHash-1")).toBe(RESULT);
        runMutation.mockResolvedValue(undefined);
        expect(await startSync("revivalId-1", "previewHash-1")).toEqual(null);
    });

    it("setMembership sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await setMembership(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
        runMutation.mockResolvedValue({membershipSet: RESULT});
        expect(await setMembership(({marker: "input"} as never))).toBe(RESULT);
        runMutation.mockResolvedValue(undefined);
        expect(await setMembership(({marker: "input"} as never))).toEqual([]);
    });

    it("anonymizeRevival sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await anonymizeRevival("id-1", 3, "confirmation-1");
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3, confirmation: "confirmation-1"});
        runMutation.mockResolvedValue({revivalAnonymize: RESULT});
        expect(await anonymizeRevival("id-1", 3, "confirmation-1")).toBe(RESULT);
        runMutation.mockResolvedValue(undefined);
        expect(await anonymizeRevival("id-1", 3, "confirmation-1")).toEqual(null);
    });

});
