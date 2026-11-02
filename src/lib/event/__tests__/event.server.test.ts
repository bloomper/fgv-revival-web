import {beforeEach, describe, expect, it, vi} from "vitest";
import {cancelEvent, createCalendarFeed, createEvent, createEventType, getEventTypes, moveEventType, restoreEvent, restoreEventType, retireEventType, revokeCalendarFeed, updateEvent, updateEventType} from "@/lib/event/event.server";

const {runQuery, runMutation} = vi.hoisted(() => ({runQuery: vi.fn(), runMutation: vi.fn()}));

vi.mock("@/lib/graphql.server", () => ({runQuery, runMutation}));

const RESULT = {result: true};

beforeEach(() => {
    runQuery.mockReset();
    runMutation.mockReset();
});

describe("event.server", () => {
    it("getEventTypes sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getEventTypes(true);
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({includeRetired: true});
        runQuery.mockResolvedValue({eventTypes: RESULT});
        expect(await getEventTypes(true)).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getEventTypes(true)).toEqual([]);
    });

    it("createEvent sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await createEvent(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
        runMutation.mockResolvedValue({eventCreate: RESULT});
        expect(await createEvent(({marker: "input"} as never))).toBe(RESULT);
    });

    it("updateEvent sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await updateEvent(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
    });

    it("cancelEvent sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await cancelEvent("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

    it("restoreEvent sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await restoreEvent("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

    it("createEventType sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await createEventType(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
        runMutation.mockResolvedValue({eventTypeCreate: RESULT});
        expect(await createEventType(({marker: "input"} as never))).toBe(RESULT);
    });

    it("updateEventType sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await updateEventType("id-1", 3, ({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3, input: ({marker: "input"} as never)});
    });

    it("moveEventType sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await moveEventType("id-1", 3, 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3, position: 3});
    });

    it("retireEventType sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await retireEventType("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

    it("restoreEventType sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await restoreEventType("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

    it("createCalendarFeed sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await createCalendarFeed("revivalId-1");
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({revivalId: "revivalId-1"});
        runMutation.mockResolvedValue({calendarFeedCreate: RESULT});
        expect(await createCalendarFeed("revivalId-1")).toBe(RESULT);
        runMutation.mockResolvedValue(undefined);
        expect(await createCalendarFeed("revivalId-1")).toEqual(null);
    });

    it("revokeCalendarFeed sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await revokeCalendarFeed("revivalId-1");
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({revivalId: "revivalId-1"});
    });

});
