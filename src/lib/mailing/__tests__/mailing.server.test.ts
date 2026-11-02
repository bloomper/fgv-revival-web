import {beforeEach, describe, expect, it, vi} from "vitest";
import {cancelMailing, createMailing, createMailingTemplate, getMailing, getMailingEditorOptions, getMailingPositions, getMailingTemplates, getMailings, moveMailingTemplate, previewMailingAudience, restoreMailingTemplate, retireMailingTemplate, retryMailing, sendMailing, updateMailing, updateMailingTemplate} from "@/lib/mailing/mailing.server";

const {runQuery, runMutation} = vi.hoisted(() => ({runQuery: vi.fn(), runMutation: vi.fn()}));

vi.mock("@/lib/graphql.server", () => ({runQuery, runMutation}));

const RESULT = {result: true};

beforeEach(() => {
    runQuery.mockReset();
    runMutation.mockReset();
});

describe("mailing.server", () => {
    it("getMailings sends its variables", async () => {
        runQuery.mockResolvedValue(undefined);
        await getMailings("revivalId-1");
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({id: "revivalId-1"});
    });

    it("getMailing sends its variables", async () => {
        runQuery.mockResolvedValue(undefined);
        await getMailing("revivalId-1", "id-1");
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({id: "id-1", revivalId: "revivalId-1"});
    });

    it("getMailingEditorOptions sends its variables", async () => {
        runQuery.mockResolvedValue(undefined);
        await getMailingEditorOptions("revivalId-1");
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({id: "revivalId-1"});
    });

    it("getMailingPositions sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getMailingPositions();
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({});
        runQuery.mockResolvedValue({positions: RESULT});
        expect(await getMailingPositions()).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getMailingPositions()).toEqual([]);
    });

    it("previewMailingAudience sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await previewMailingAudience("revivalId-1", ({marker: "audience"} as never));
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({revivalId: "revivalId-1", audience: ({marker: "audience"} as never)});
        runQuery.mockResolvedValue({mailingAudiencePreview: RESULT});
        expect(await previewMailingAudience("revivalId-1", ({marker: "audience"} as never))).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await previewMailingAudience("revivalId-1", ({marker: "audience"} as never))).toEqual([]);
    });

    it("getMailingTemplates sends its variables and unwraps the result", async () => {
        runQuery.mockResolvedValue(undefined);
        await getMailingTemplates(true);
        expect(runQuery).toHaveBeenCalledTimes(1);
        expect(runQuery.mock.calls[0][1]).toEqual({includeRetired: true});
        runQuery.mockResolvedValue({mailingTemplates: RESULT});
        expect(await getMailingTemplates(true)).toBe(RESULT);
        runQuery.mockResolvedValue(undefined);
        expect(await getMailingTemplates(true)).toEqual([]);
    });

    it("createMailing sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await createMailing(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
        runMutation.mockResolvedValue({mailingCreate: RESULT});
        expect(await createMailing(({marker: "input"} as never))).toBe(RESULT);
        runMutation.mockResolvedValue(undefined);
        expect(await createMailing(({marker: "input"} as never))).toEqual(null);
    });

    it("updateMailing sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await updateMailing("id-1", 3, ({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3, input: ({marker: "input"} as never)});
    });

    it("cancelMailing sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await cancelMailing("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

    it("sendMailing sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await sendMailing("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
        runMutation.mockResolvedValue({mailingSend: RESULT});
        expect(await sendMailing("id-1", 3)).toBe(RESULT);
        runMutation.mockResolvedValue(undefined);
        expect(await sendMailing("id-1", 3)).toEqual(null);
    });

    it("retryMailing sends its variables and unwraps the result", async () => {
        runMutation.mockResolvedValue(undefined);
        await retryMailing("id-1");
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1"});
        runMutation.mockResolvedValue({mailingRetry: RESULT});
        expect(await retryMailing("id-1")).toBe(RESULT);
        runMutation.mockResolvedValue(undefined);
        expect(await retryMailing("id-1")).toEqual(null);
    });

    it("createMailingTemplate sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await createMailingTemplate(({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({input: ({marker: "input"} as never)});
    });

    it("updateMailingTemplate sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await updateMailingTemplate("id-1", 3, ({marker: "input"} as never));
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3, input: ({marker: "input"} as never)});
    });

    it("moveMailingTemplate sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await moveMailingTemplate("id-1", 3, 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3, position: 3});
    });

    it("retireMailingTemplate sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await retireMailingTemplate("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

    it("restoreMailingTemplate sends its variables", async () => {
        runMutation.mockResolvedValue(undefined);
        await restoreMailingTemplate("id-1", 3);
        expect(runMutation).toHaveBeenCalledTimes(1);
        expect(runMutation.mock.calls[0][1]).toEqual({id: "id-1", version: 3});
    });

});
