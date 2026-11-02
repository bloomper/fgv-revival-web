import {beforeEach, describe, expect, it, vi} from "vitest";
import {getRevivalEvents} from "@/lib/event/event.server";

const {runQuery} = vi.hoisted(() => ({runQuery: vi.fn()}));

vi.mock("@/lib/graphql.server", () => ({runQuery, runMutation: vi.fn()}));

beforeEach(() => {
    runQuery.mockReset();
});

describe("getRevivalEvents", () => {
    it("asks for the active events without meetings by default", async () => {
        runQuery.mockResolvedValue(undefined);

        expect(await getRevivalEvents("r1")).toBeNull();
        expect(runQuery.mock.calls[0][1]).toEqual({id: "r1", includeCancelled: false, withMeetings: false});
    });

    it("gathers the revival, its events, the types and the meetings", async () => {
        runQuery.mockResolvedValue({revival: {id: "r1"}, events: [{id: "e1"}], eventTypes: [{id: "t1"}], meetings: null});

        expect(await getRevivalEvents("r1", {includeCancelled: true, withMeetings: true})).toEqual({
            revival: {id: "r1"}, events: [{id: "e1"}], types: [{id: "t1"}], meetings: [],
        });
        expect(runQuery.mock.calls[0][1]).toEqual({id: "r1", includeCancelled: true, withMeetings: true});
    });
});
