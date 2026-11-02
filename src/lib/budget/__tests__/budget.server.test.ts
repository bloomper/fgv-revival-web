import {beforeEach, describe, expect, it, vi} from "vitest";
import {calculateScenario, cancelTransaction, createBudgetLine, createTransaction, getBudgetAccess, getBudgetLines, getBudgetOverview, getBudgetScenarios, getBudgetTransactions, getRevivalBudgetSummary, removeBudgetLine, removeScenario, restoreBudgetLine, saveScenario, setTransactionReimbursed, updateBudgetLine, updateBudgetSettings, updateScenario, updateTransaction} from "@/lib/budget/budget.server";

const {runQuery, runMutation} = vi.hoisted(() => ({runQuery: vi.fn(), runMutation: vi.fn()}));

vi.mock("@/lib/graphql.server", () => ({runQuery, runMutation}));

const RESULT = {result: true};

beforeEach(() => {
    runQuery.mockReset();
    runMutation.mockReset();
});

describe("budget.server", () => {
    it("getBudgetAccess sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getBudgetAccess("revivalId-1");
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({id: "revivalId-1"});
        runQuery.mockResolvedValue({revival: RESULT});
        expect(await getBudgetAccess("revivalId-1")).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getBudgetAccess("revivalId-1")).toEqual(null);
    });

    it("getBudgetOverview sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getBudgetOverview("revivalId-1");
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({id: "revivalId-1"});
        runQuery.mockResolvedValue({revival: RESULT});
        expect(await getBudgetOverview("revivalId-1")).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getBudgetOverview("revivalId-1")).toEqual(null);
    });

    it("getBudgetLines sends its variables", async () => {
        runQuery.mockResolvedValue(undefined);
        await getBudgetLines("revivalId-1", true);
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({id: "revivalId-1", includeRemoved: true});
    });

    it("getBudgetTransactions sends its variables", async () => {
        runQuery.mockResolvedValue(undefined);
        await getBudgetTransactions("revivalId-1", true);
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({id: "revivalId-1", includeCancelled: true});
    });

    it("getBudgetScenarios sends its variables", async () => {
        runQuery.mockResolvedValue(undefined);
        await getBudgetScenarios("revivalId-1");
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({id: "revivalId-1"});
    });

    it("getRevivalBudgetSummary sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getRevivalBudgetSummary("revivalId-1");
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({id: "revivalId-1"});
        runQuery.mockResolvedValue({revival: {budget: RESULT}});
        expect(await getRevivalBudgetSummary("revivalId-1")).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getRevivalBudgetSummary("revivalId-1")).toEqual(null);
    });

    it("calculateScenario sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await calculateScenario("revivalId-1", ({marker: "input"} as never));
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({revivalId: "revivalId-1", input: ({marker: "input"} as never)});
        runQuery.mockResolvedValue({budgetScenarioCalculate: RESULT});
        expect(await calculateScenario("revivalId-1", ({marker: "input"} as never))).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await calculateScenario("revivalId-1", ({marker: "input"} as never))).toEqual(null);
    });

    it("updateBudgetSettings sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await updateBudgetSettings(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
    });

    it("createBudgetLine sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await createBudgetLine(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
        runMutation.mockResolvedValue({budgetLineCreate: RESULT});
        expect(await createBudgetLine(({marker: "input"} as never))).toBe(RESULT);
    });

    it("updateBudgetLine sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await updateBudgetLine(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
    });

    it("removeBudgetLine sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await removeBudgetLine("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

    it("restoreBudgetLine sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await restoreBudgetLine("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

    it("createTransaction sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await createTransaction(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
        runMutation.mockResolvedValue({transactionCreate: RESULT});
        expect(await createTransaction(({marker: "input"} as never))).toBe(RESULT);
    });

    it("updateTransaction sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await updateTransaction(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
    });

    it("cancelTransaction sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await cancelTransaction("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

    it("setTransactionReimbursed sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await setTransactionReimbursed("id-1", 3, true);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3, reimbursed: true});
    });

    it("saveScenario sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await saveScenario(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
        runMutation.mockResolvedValue({budgetScenarioSave: RESULT});
        expect(await saveScenario(({marker: "input"} as never))).toBe(RESULT);
    });

    it("updateScenario sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await updateScenario("id-1", 3, ({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3, input: ({marker: "input"} as never)});
    });

    it("removeScenario sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await removeScenario("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

});
