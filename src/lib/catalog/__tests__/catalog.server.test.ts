import {beforeEach, describe, expect, it, vi} from "vitest";
import {createCapability, createGuideItemType, deleteCapability, deleteGuideItemType, getCapabilities, getGuideItemTypes, moveCapability, moveGuideItemType, restoreCapability, restoreGuideItemType, retireCapability, retireGuideItemType, updateCapability, updateGuideItemType} from "@/lib/catalog/catalog.server";

const {runQuery, runMutation} = vi.hoisted(() => ({runQuery: vi.fn(), runMutation: vi.fn()}));

vi.mock("@/lib/graphql.server", () => ({runQuery, runMutation}));

const RESULT = {result: true};

beforeEach(() => {
    runQuery.mockReset();
    runMutation.mockReset();
});

describe("catalog.server", () => {
    it("getCapabilities sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getCapabilities(true);
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({includeRetired: true});
        runQuery.mockResolvedValue({capabilities: RESULT});
        expect(await getCapabilities(true)).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getCapabilities(true)).toEqual([]);
    });

    it("createCapability sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await createCapability(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
        runMutation.mockResolvedValue({capabilityCreate: RESULT});
        expect(await createCapability(({marker: "input"} as never))).toBe(RESULT);
    });

    it("updateCapability sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await updateCapability(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
        runMutation.mockResolvedValue({capabilityUpdate: RESULT});
        expect(await updateCapability(({marker: "input"} as never))).toBe(RESULT);
    });

    it("moveCapability sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await moveCapability("id-1", 3, 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3, position: 3});
        runMutation.mockResolvedValue({capabilityMove: RESULT});
        expect(await moveCapability("id-1", 3, 3)).toBe(RESULT);
    });

    it("retireCapability sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await retireCapability("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
        runMutation.mockResolvedValue({capabilityRetire: RESULT});
        expect(await retireCapability("id-1", 3)).toBe(RESULT);
    });

    it("restoreCapability sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await restoreCapability("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
        runMutation.mockResolvedValue({capabilityRestore: RESULT});
        expect(await restoreCapability("id-1", 3)).toBe(RESULT);
    });

    it("deleteCapability sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await deleteCapability("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

    it("getGuideItemTypes sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getGuideItemTypes(true);
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({includeRetired: true});
        runQuery.mockResolvedValue({guideItemTypes: RESULT});
        expect(await getGuideItemTypes(true)).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getGuideItemTypes(true)).toEqual([]);
    });

    it("createGuideItemType sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await createGuideItemType(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
        runMutation.mockResolvedValue({guideItemTypeCreate: RESULT});
        expect(await createGuideItemType(({marker: "input"} as never))).toBe(RESULT);
    });

    it("updateGuideItemType sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await updateGuideItemType(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
        runMutation.mockResolvedValue({guideItemTypeUpdate: RESULT});
        expect(await updateGuideItemType(({marker: "input"} as never))).toBe(RESULT);
    });

    it("moveGuideItemType sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await moveGuideItemType("id-1", 3, 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3, position: 3});
        runMutation.mockResolvedValue({guideItemTypeMove: RESULT});
        expect(await moveGuideItemType("id-1", 3, 3)).toBe(RESULT);
    });

    it("retireGuideItemType sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await retireGuideItemType("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
        runMutation.mockResolvedValue({guideItemTypeRetire: RESULT});
        expect(await retireGuideItemType("id-1", 3)).toBe(RESULT);
    });

    it("restoreGuideItemType sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await restoreGuideItemType("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
        runMutation.mockResolvedValue({guideItemTypeRestore: RESULT});
        expect(await restoreGuideItemType("id-1", 3)).toBe(RESULT);
    });

    it("deleteGuideItemType sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await deleteGuideItemType("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

});
