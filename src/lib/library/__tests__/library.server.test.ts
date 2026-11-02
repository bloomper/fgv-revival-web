import {beforeEach, describe, expect, it, vi} from "vitest";
import {createLibraryEntry, getLibraryEntries, restoreLibraryEntry, retireLibraryEntry, updateLibraryEntry} from "@/lib/library/library.server";

const {runQuery, runMutation} = vi.hoisted(() => ({runQuery: vi.fn(), runMutation: vi.fn()}));

vi.mock("@/lib/graphql.server", () => ({runQuery, runMutation}));

const RESULT = {result: true};

beforeEach(() => {
    runQuery.mockReset();
    runMutation.mockReset();
});

describe("library.server", () => {
    it("getLibraryEntries sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getLibraryEntries(true);
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({includeRetired: true});
        runQuery.mockResolvedValue({libraryEntries: RESULT});
        expect(await getLibraryEntries(true)).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getLibraryEntries(true)).toEqual([]);
    });

    it("createLibraryEntry sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await createLibraryEntry(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
    });

    it("updateLibraryEntry sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await updateLibraryEntry("id-1", 3, ({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3, input: ({marker: "input"} as never)});
    });

    it("retireLibraryEntry sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await retireLibraryEntry("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

    it("restoreLibraryEntry sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await restoreLibraryEntry("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

});
