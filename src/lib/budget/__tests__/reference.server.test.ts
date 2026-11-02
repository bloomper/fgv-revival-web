import {beforeEach, describe, expect, it, vi} from "vitest";
import {createBudgetCategory, createEventTypeBudgetLine, createReferenceRevival, deleteBudgetCategory, deleteReferenceRevival, getBudgetCategories, getReferenceRevivals, moveBudgetCategory, removeEventTypeBudgetLine, restoreBudgetCategory, retireBudgetCategory, updateBudgetCategory, updateEventTypeBudgetLine, updateReferenceRevival} from "@/lib/budget/reference.server";

const {runQuery, runMutation} = vi.hoisted(() => ({runQuery: vi.fn(), runMutation: vi.fn()}));

vi.mock("@/lib/graphql.server", () => ({runQuery, runMutation}));

const RESULT = {result: true};

beforeEach(() => {
    runQuery.mockReset();
    runMutation.mockReset();
});

describe("reference.server", () => {
    it("getBudgetCategories sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getBudgetCategories(true);
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({includeRetired: true});
        runQuery.mockResolvedValue({budgetCategories: RESULT});
        expect(await getBudgetCategories(true)).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getBudgetCategories(true)).toEqual([]);
    });

    it("createBudgetCategory sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await createBudgetCategory(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
    });

    it("updateBudgetCategory sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await updateBudgetCategory(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
    });

    it("moveBudgetCategory sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await moveBudgetCategory("id-1", 3, 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3, position: 3});
    });

    it("retireBudgetCategory sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await retireBudgetCategory("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

    it("restoreBudgetCategory sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await restoreBudgetCategory("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

    it("deleteBudgetCategory sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await deleteBudgetCategory("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

    it("getReferenceRevivals sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getReferenceRevivals();
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({});
        runQuery.mockResolvedValue({referenceRevivals: RESULT});
        expect(await getReferenceRevivals()).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getReferenceRevivals()).toEqual([]);
    });

    it("createReferenceRevival sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await createReferenceRevival(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
    });

    it("updateReferenceRevival sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await updateReferenceRevival("id-1", 3, ({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3, input: ({marker: "input"} as never)});
    });

    it("deleteReferenceRevival sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await deleteReferenceRevival("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

    it("createEventTypeBudgetLine sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await createEventTypeBudgetLine(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
    });

    it("updateEventTypeBudgetLine sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await updateEventTypeBudgetLine("id-1", 3, ({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3, input: ({marker: "input"} as never)});
    });

    it("removeEventTypeBudgetLine sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await removeEventTypeBudgetLine("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

});
