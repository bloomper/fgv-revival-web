import {beforeEach, describe, expect, it, vi} from "vitest";
import * as guide from "@/lib/guide/guide.server";

const {runQuery, runMutation} = vi.hoisted(() => ({runQuery: vi.fn(), runMutation: vi.fn()}));

vi.mock("@/lib/graphql.server", () => ({runQuery, runMutation}));

const variables = (mock: typeof runQuery) => mock.mock.calls.at(-1)?.[1];

describe("the guide client", () => {
    beforeEach(() => {
        runQuery.mockReset();
        runMutation.mockReset();
    });

    it("treats the guide as readable when the server does not say otherwise or cannot be asked", async () => {
        runQuery.mockResolvedValueOnce({guideReadable: false});
        expect(await guide.getGuideReadable()).toBe(false);
        runQuery.mockResolvedValueOnce(undefined);
        expect(await guide.getGuideReadable()).toBe(true);
        runQuery.mockRejectedValueOnce(new Error("down"));
        expect(await guide.getGuideReadable()).toBe(true);
    });

    it("gives a revival with the version it is pinned to", async () => {
        runQuery.mockResolvedValueOnce({revival: {id: "r1", guideVersion: {id: "g2"}}});
        runQuery.mockResolvedValueOnce({guideVersion: {id: "g2", label: "2027"}});

        expect(await guide.getRevivalGuide("r1")).toEqual({
            revival: {id: "r1", guideVersion: {id: "g2"}},
            version: {id: "g2", label: "2027"},
        });
        expect(variables(runQuery)).toEqual({id: "g2"});
    });

    it("gives no version before the first is published, and nothing for a revival the user cannot see", async () => {
        runQuery.mockResolvedValueOnce({revival: {id: "r1", guideVersion: null}});
        expect(await guide.getRevivalGuide("r1")).toEqual({revival: {id: "r1", guideVersion: null}, version: null});
        expect(runQuery).toHaveBeenCalledTimes(1);

        runQuery.mockResolvedValueOnce({revival: null});
        expect(await guide.getRevivalGuide("r2")).toBeNull();
    });

    it.each([
        ["getGuideLatestVersion", [], null],
        ["getGuideVersion", ["g1"], null],
        ["searchGuide", [null, "scen"], []],
        ["getGuideVersions", [], []],
        ["getGuideVersionsAdmin", [], []],
        ["getGuideDraft", [], null],
    ] as const)("%s falls back when the server answers nothing", async (name, args, fallback) => {
        runQuery.mockResolvedValueOnce(undefined);
        expect(await (guide[name] as (...a: unknown[]) => Promise<unknown>)(...args)).toEqual(fallback);
    });

    it("passes the search's version and query", async () => {
        runQuery.mockResolvedValueOnce({guideSearch: [{id: "s1"}]});
        expect(await guide.searchGuide("g1", "scen")).toEqual([{id: "s1"}]);
        expect(variables(runQuery)).toEqual({versionId: "g1", query: "scen"});
    });

    it("publishes, discards and deletes versions with their optimistic lock", async () => {
        runMutation.mockResolvedValueOnce({guideDraftPublish: {id: "g3", label: "2028"}});
        expect(await guide.publishGuideDraft({label: "2028"} as never)).toEqual({id: "g3", label: "2028"});
        expect(variables(runMutation)).toEqual({input: {label: "2028"}});

        runMutation.mockResolvedValue({});
        await guide.discardGuideDraft("d1", 4);
        expect(variables(runMutation)).toEqual({id: "d1", version: 4});
        await guide.deleteGuideVersion("g1", 2);
        expect(variables(runMutation)).toEqual({id: "g1", version: 2});
    });
});
