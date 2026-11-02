import {beforeEach, describe, expect, it, vi} from "vitest";
import {addChecklistItemsFromTemplate, cancelEventChecklist, createChecklistItem, createEventChecklist, getChecklist, getRevivalChecklists, setChecklistItemState, updateChecklistItem, updateEventChecklist} from "@/lib/checklist/checklist.server";

const {runQuery, runMutation} = vi.hoisted(() => ({runQuery: vi.fn(), runMutation: vi.fn()}));

vi.mock("@/lib/graphql.server", () => ({runQuery, runMutation}));

const RESULT = {result: true};

beforeEach(() => {
    runQuery.mockReset();
    runMutation.mockReset();
});

describe("checklist.server", () => {
    it("getRevivalChecklists sends its variables", async () => {
        runQuery.mockResolvedValue(undefined);
        await getRevivalChecklists("revivalId-1", ({marker: "filter"} as never), true);
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toMatchObject({id: "revivalId-1", filter: ({marker: "filter"} as never), includeCancelled: true});
    });

    it("getChecklist sends its variables", async () => {
        runQuery.mockResolvedValue(undefined);
        await getChecklist("revivalId-1", "id-1");
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({id: "id-1", revivalId: "revivalId-1"});
    });

    it("createChecklistItem sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await createChecklistItem(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
    });

    it("updateChecklistItem sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await updateChecklistItem(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
    });

    it("setChecklistItemState sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await setChecklistItemState(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
    });

    it("createEventChecklist sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await createEventChecklist(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
        runMutation.mockResolvedValue({eventChecklistCreate: RESULT});
        expect(await createEventChecklist(({marker: "input"} as never))).toBe(RESULT);
        runMutation.mockResolvedValue(undefined);
        expect(await createEventChecklist(({marker: "input"} as never))).toEqual(null);
    });

    it("updateEventChecklist sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await updateEventChecklist(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
    });

    it("cancelEventChecklist sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await cancelEventChecklist("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

    it("addChecklistItemsFromTemplate sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await addChecklistItemsFromTemplate(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
    });

});
