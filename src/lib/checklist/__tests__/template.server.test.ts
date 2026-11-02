import {beforeEach, describe, expect, it, vi} from "vitest";
import {createChecklistTemplate, createChecklistTemplateItem, getChecklistTemplate, getChecklistTemplates, getEventChecklistTemplates, moveChecklistTemplateItem, restoreChecklistTemplate, restoreChecklistTemplateItem, retireChecklistTemplate, retireChecklistTemplateItem, updateChecklistTemplate, updateChecklistTemplateItem} from "@/lib/checklist/template.server";

const {runQuery, runMutation} = vi.hoisted(() => ({runQuery: vi.fn(), runMutation: vi.fn()}));

vi.mock("@/lib/graphql.server", () => ({runQuery, runMutation}));

const RESULT = {result: true};

beforeEach(() => {
    runQuery.mockReset();
    runMutation.mockReset();
});

describe("template.server", () => {
    it("getChecklistTemplates sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getChecklistTemplates(true);
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({includeRetired: true});
        runQuery.mockResolvedValue({checklistTemplates: RESULT});
        expect(await getChecklistTemplates(true)).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getChecklistTemplates(true)).toEqual([]);
    });

    it("getChecklistTemplate sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getChecklistTemplate("id-1");
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({id: "id-1"});
        runQuery.mockResolvedValue({checklistTemplate: RESULT});
        expect(await getChecklistTemplate("id-1")).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getChecklistTemplate("id-1")).toEqual(null);
    });

    it("getEventChecklistTemplates sends its variables", async () => {
        runQuery.mockResolvedValue(undefined);
        await getEventChecklistTemplates();
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({});
    });

    it("createChecklistTemplate sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await createChecklistTemplate(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
        runMutation.mockResolvedValue({checklistTemplateCreate: RESULT});
        expect(await createChecklistTemplate(({marker: "input"} as never))).toBe(RESULT);
        runMutation.mockResolvedValue(undefined);
        expect(await createChecklistTemplate(({marker: "input"} as never))).toEqual(null);
    });

    it("updateChecklistTemplate sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await updateChecklistTemplate(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
    });

    it("retireChecklistTemplate sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await retireChecklistTemplate("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

    it("restoreChecklistTemplate sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await restoreChecklistTemplate("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

    it("createChecklistTemplateItem sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await createChecklistTemplateItem(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
    });

    it("updateChecklistTemplateItem sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await updateChecklistTemplateItem(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
    });

    it("moveChecklistTemplateItem sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await moveChecklistTemplateItem("id-1", 3, 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3, position: 3});
    });

    it("retireChecklistTemplateItem sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await retireChecklistTemplateItem("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

    it("restoreChecklistTemplateItem sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await restoreChecklistTemplateItem("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

});
