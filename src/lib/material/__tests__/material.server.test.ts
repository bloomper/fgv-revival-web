import {beforeEach, describe, expect, it, vi} from "vitest";
import {createInventoryItem, createLinkService, createMaterial, deleteLinkService, getLinkServices, getMaterialsAccess, getRevivalInventory, getRevivalMaterials, moveLinkService, removeInventoryItem, removeMaterial, restoreInventoryItem, restoreLinkService, restoreMaterial, retireLinkService, updateInventoryItem, updateLinkService, updateMaterial} from "@/lib/material/material.server";

const {runQuery, runMutation} = vi.hoisted(() => ({runQuery: vi.fn(), runMutation: vi.fn()}));

vi.mock("@/lib/graphql.server", () => ({runQuery, runMutation}));

const RESULT = {result: true};

beforeEach(() => {
    runQuery.mockReset();
    runMutation.mockReset();
});

describe("material.server", () => {
    it("getMaterialsAccess sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getMaterialsAccess("revivalId-1");
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({id: "revivalId-1"});
        runQuery.mockResolvedValue({revival: RESULT});
        expect(await getMaterialsAccess("revivalId-1")).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getMaterialsAccess("revivalId-1")).toEqual(null);
    });

    it("getRevivalMaterials sends its variables", async () => {
        runQuery.mockResolvedValue(undefined);
        await getRevivalMaterials("revivalId-1", true);
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({id: "revivalId-1", includeRemoved: true});
    });

    it("getRevivalInventory sends its variables", async () => {
        runQuery.mockResolvedValue(undefined);
        await getRevivalInventory("revivalId-1", true);
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({id: "revivalId-1", includeRemoved: true});
    });

    it("getLinkServices sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getLinkServices(true);
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({includeRetired: true});
        runQuery.mockResolvedValue({linkServices: RESULT});
        expect(await getLinkServices(true)).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getLinkServices(true)).toEqual([]);
    });

    it("createMaterial sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await createMaterial(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
        runMutation.mockResolvedValue({materialCreate: RESULT});
        expect(await createMaterial(({marker: "input"} as never))).toBe(RESULT);
        runMutation.mockResolvedValue(undefined);
        expect(await createMaterial(({marker: "input"} as never))).toEqual(null);
    });

    it("updateMaterial sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await updateMaterial("id-1", 3, ({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3, input: ({marker: "input"} as never)});
    });

    it("removeMaterial sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await removeMaterial("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

    it("restoreMaterial sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await restoreMaterial("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

    it("createInventoryItem sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await createInventoryItem(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
        runMutation.mockResolvedValue({inventoryItemCreate: RESULT});
        expect(await createInventoryItem(({marker: "input"} as never))).toBe(RESULT);
        runMutation.mockResolvedValue(undefined);
        expect(await createInventoryItem(({marker: "input"} as never))).toEqual(null);
    });

    it("updateInventoryItem sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await updateInventoryItem("id-1", 3, ({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3, input: ({marker: "input"} as never)});
    });

    it("removeInventoryItem sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await removeInventoryItem("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

    it("restoreInventoryItem sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await restoreInventoryItem("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

    it("createLinkService sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await createLinkService(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
        runMutation.mockResolvedValue({linkServiceCreate: RESULT});
        expect(await createLinkService(({marker: "input"} as never))).toBe(RESULT);
    });

    it("updateLinkService sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await updateLinkService("id-1", 3, ({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3, input: ({marker: "input"} as never)});
    });

    it("moveLinkService sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await moveLinkService("id-1", 3, 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3, position: 3});
    });

    it("retireLinkService sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await retireLinkService("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

    it("restoreLinkService sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await restoreLinkService("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

    it("deleteLinkService sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await deleteLinkService("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

});
