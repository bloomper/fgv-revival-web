import {beforeEach, describe, expect, it, vi} from "vitest";
import {createSpexCalendarDate, deleteSpexCalendarDate, getRevivalTimeline, getSpexCalendarDates, updateSpexCalendarDate} from "@/lib/spex-calendar/spex-calendar.server";

const {runQuery, runMutation} = vi.hoisted(() => ({runQuery: vi.fn(), runMutation: vi.fn()}));

vi.mock("@/lib/graphql.server", () => ({runQuery, runMutation}));

const RESULT = {result: true};

beforeEach(() => {
    runQuery.mockReset();
    runMutation.mockReset();
});

describe("spex-calendar.server", () => {
    it("getSpexCalendarDates sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getSpexCalendarDates();
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({});
        runQuery.mockResolvedValue({spexCalendarDates: RESULT});
        expect(await getSpexCalendarDates()).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getSpexCalendarDates()).toEqual([]);
    });

    it("getRevivalTimeline sends its variables", async () => {
        runQuery.mockResolvedValue(undefined);
        await getRevivalTimeline();
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({});
    });

    it("createSpexCalendarDate sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await createSpexCalendarDate(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
    });

    it("updateSpexCalendarDate sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await updateSpexCalendarDate("id-1", 3, ({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3, input: ({marker: "input"} as never)});
    });

    it("deleteSpexCalendarDate sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await deleteSpexCalendarDate("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

});
