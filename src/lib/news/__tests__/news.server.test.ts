import {beforeEach, describe, expect, it, vi} from "vitest";
import {createNews, deleteNews, getAllNews, getPublishedNews, updateNews} from "@/lib/news/news.server";

const {runQuery, runMutation} = vi.hoisted(() => ({runQuery: vi.fn(), runMutation: vi.fn()}));

vi.mock("@/lib/graphql.server", () => ({runQuery, runMutation}));

const RESULT = {result: true};

beforeEach(() => {
    runQuery.mockReset();
    runMutation.mockReset();
});

describe("news.server", () => {
    it("getPublishedNews sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getPublishedNews(3);
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toMatchObject({all: false});
        runQuery.mockResolvedValue({news: RESULT});
        expect(await getPublishedNews(3)).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getPublishedNews(3)).toEqual([]);
    });

    it("getAllNews sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getAllNews();
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toMatchObject({all: true});
        runQuery.mockResolvedValue({news: RESULT});
        expect(await getAllNews()).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getAllNews()).toEqual([]);
    });

    it("createNews sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await createNews(({marker: "values"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toMatchObject({});
    });

    it("updateNews sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await updateNews("id-1", 3, ({marker: "values"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toMatchObject({id: "id-1", version: 3});
    });

    it("deleteNews sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await deleteNews("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

});
