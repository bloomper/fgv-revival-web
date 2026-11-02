import {beforeEach, describe, expect, it, vi} from "vitest";
import {getApplicationSettings, updateApplicationSettings} from "@/lib/settings/settings.server";

const {runQuery, runMutation} = vi.hoisted(() => ({runQuery: vi.fn(), runMutation: vi.fn()}));

vi.mock("@/lib/graphql.server", () => ({runQuery, runMutation}));

const RESULT = {result: true};

beforeEach(() => {
    runQuery.mockReset();
    runMutation.mockReset();
});

describe("settings.server", () => {
    it("getApplicationSettings sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getApplicationSettings();
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({});
        runQuery.mockResolvedValue({applicationSettings: RESULT});
        expect(await getApplicationSettings()).toBe(RESULT);
    });

    it("updateApplicationSettings sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await updateApplicationSettings(3, ({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({version: 3, input: ({marker: "input"} as never)});
    });

});
