import {beforeEach, describe, expect, it, vi} from "vitest";
import {addParticipant, addSpexareParticipants, createReferral, getMyParticipation, getParticipantCandidates, getParticipants, getParticipantsOverview, getPositions, handleReferral, inviteParticipants, removeParticipant, respondToParticipation, searchSpexare, setAssignedChecklistItemDone, setParticipantFeePaid, setParticipationDietary, updateParticipant, updateParticipationContact, updateParticipationSettings} from "@/lib/participant/participant.server";

const {runQuery, runMutation} = vi.hoisted(() => ({runQuery: vi.fn(), runMutation: vi.fn()}));

vi.mock("@/lib/graphql.server", () => ({runQuery, runMutation}));

const RESULT = {result: true};

beforeEach(() => {
    runQuery.mockReset();
    runMutation.mockReset();
});

describe("participant.server", () => {
    it("getParticipantsOverview sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getParticipantsOverview("id-1");
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({id: "id-1"});
        runQuery.mockResolvedValue({revival: RESULT});
        expect(await getParticipantsOverview("id-1")).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getParticipantsOverview("id-1")).toEqual(null);
    });

    it("getParticipants sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getParticipants("revivalId-1", true);
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({revivalId: "revivalId-1", includeRemoved: true});
        runQuery.mockResolvedValue({participants: RESULT});
        expect(await getParticipants("revivalId-1", true)).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getParticipants("revivalId-1", true)).toEqual([]);
    });

    it("getPositions sends its variables", async () => {
        runQuery.mockResolvedValue(undefined);
        await getPositions();
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({});
    });

    it("getParticipantCandidates sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getParticipantCandidates("revivalId-1");
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({revivalId: "revivalId-1"});
        runQuery.mockResolvedValue({participantCandidates: RESULT});
        expect(await getParticipantCandidates("revivalId-1")).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getParticipantCandidates("revivalId-1")).toEqual([]);
    });

    it("searchSpexare sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await searchSpexare("revivalId-1", "query-1");
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({revivalId: "revivalId-1", query: "query-1"});
        runQuery.mockResolvedValue({spexareSearch: RESULT});
        expect(await searchSpexare("revivalId-1", "query-1")).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await searchSpexare("revivalId-1", "query-1")).toEqual([]);
    });

    it("getMyParticipation sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getMyParticipation("revivalId-1");
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({revivalId: "revivalId-1"});
        runQuery.mockResolvedValue({myParticipation: RESULT});
        expect(await getMyParticipation("revivalId-1")).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getMyParticipation("revivalId-1")).toEqual(null);
    });

    it("addParticipant sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await addParticipant(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
        runMutation.mockResolvedValue({participantAdd: RESULT});
        expect(await addParticipant(({marker: "input"} as never))).toBe(RESULT);
        runMutation.mockResolvedValue(undefined);
        expect(await addParticipant(({marker: "input"} as never))).toEqual(null);
    });

    it("addSpexareParticipants sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await addSpexareParticipants("revivalId-1", ["spexareIds-1"]);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({revivalId: "revivalId-1", spexareIds: ["spexareIds-1"]});
        runMutation.mockResolvedValue({participantsAddSpexare: RESULT});
        expect(await addSpexareParticipants("revivalId-1", ["spexareIds-1"])).toBe(RESULT);
        runMutation.mockResolvedValue(undefined);
        expect(await addSpexareParticipants("revivalId-1", ["spexareIds-1"])).toEqual([]);
    });

    it("updateParticipant sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await updateParticipant(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
    });

    it("removeParticipant sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await removeParticipant("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

    it("inviteParticipants sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await inviteParticipants(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
        runMutation.mockResolvedValue({participantsInvite: RESULT});
        expect(await inviteParticipants(({marker: "input"} as never))).toBe(RESULT);
        runMutation.mockResolvedValue(undefined);
        expect(await inviteParticipants(({marker: "input"} as never))).toEqual({invited: [], skipped: []});
    });

    it("setParticipantFeePaid sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await setParticipantFeePaid("id-1", 3, true);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3, paid: true});
    });

    it("updateParticipationSettings sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await updateParticipationSettings(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
    });

    it("handleReferral sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await handleReferral("id-1", ({marker: "outcome"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", outcome: ({marker: "outcome"} as never)});
    });

    it("respondToParticipation sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await respondToParticipation(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
    });

    it("updateParticipationContact sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await updateParticipationContact(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
    });

    it("setParticipationDietary sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await setParticipationDietary("revivalId-1", ({marker: "text"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({revivalId: "revivalId-1", text: ({marker: "text"} as never)});
    });

    it("createReferral sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await createReferral(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
    });

    it("setAssignedChecklistItemDone sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await setAssignedChecklistItemDone("id-1", 3, true);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3, done: true});
    });

});
