import {beforeEach, describe, expect, it, vi} from "vitest";
import {cancelMeeting, closeMeeting, createMeeting, getMeeting, getRevivalMeetings, retryMinutes, sendMinutes, startMeeting, updateMeeting} from "@/lib/meeting/meeting.server";

const {runQuery, runMutation} = vi.hoisted(() => ({runQuery: vi.fn(), runMutation: vi.fn()}));

vi.mock("@/lib/graphql.server", () => ({runQuery, runMutation}));

const RESULT = {result: true};

beforeEach(() => {
    runQuery.mockReset();
    runMutation.mockReset();
});

describe("meeting.server", () => {
    it("getRevivalMeetings sends its variables", async () => {
        runQuery.mockResolvedValue(undefined);
        await getRevivalMeetings("revivalId-1");
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({id: "revivalId-1"});
    });

    it("getMeeting sends its variables", async () => {
        runQuery.mockResolvedValue(undefined);
        await getMeeting("revivalId-1", "id-1");
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({id: "id-1", revivalId: "revivalId-1"});
    });

    it("createMeeting sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await createMeeting(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
        runMutation.mockResolvedValue({meetingCreate: RESULT});
        expect(await createMeeting(({marker: "input"} as never))).toBe(RESULT);
    });

    it("updateMeeting sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await updateMeeting(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
    });

    it("startMeeting sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await startMeeting("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

    it("closeMeeting sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await closeMeeting("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

    it("cancelMeeting sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await cancelMeeting("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

    it("sendMinutes sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await sendMinutes(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
        runMutation.mockResolvedValue({minutesEmailSend: RESULT});
        expect(await sendMinutes(({marker: "input"} as never))).toBe(RESULT);
    });

    it("retryMinutes sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await retryMinutes("emailId-1");
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({emailId: "emailId-1"});
        runMutation.mockResolvedValue({minutesEmailRetry: RESULT});
        expect(await retryMinutes("emailId-1")).toBe(RESULT);
    });

});
