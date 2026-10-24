import {beforeEach, describe, expect, it, vi} from "vitest";
import {NextRequest} from "next/server";
import {GET} from "@/app/api/budget-export/[id]/route";

const apiFetch = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api.server", () => ({apiFetch}));

const get = (id: string, locale?: string) => {
    const request = new NextRequest(`http://localhost/api/budget-export/${id}`, {headers: locale ? {cookie: `locale=${locale}`} : {}});

    return GET(request, {params: Promise.resolve({id})});
};

describe("GET /api/budget-export/[id]", () => {
    beforeEach(() => {
        apiFetch.mockReset();
    });

    it.each(["1;drop", "../1", "a b"])("refuses %s", async id => {
        expect((await get(id)).status).toBe(400);
        expect(apiFetch).not.toHaveBeenCalled();
    });

    it("downloads the workbook in the locale cookie's language", async () => {
        apiFetch.mockResolvedValue(new Response(new Uint8Array([80, 75, 3, 4]), {
            status: 200,
            headers: {"content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "content-disposition": "attachment; filename=\"budget-ali-baba-2028.xlsx\""},
        }));

        const response = await get("3", "en");

        expect(apiFetch).toHaveBeenCalledWith("/api/revivals/3/budget.xlsx?lang=en");
        expect(response.status).toBe(200);
        expect(response.headers.get("content-disposition")).toBe("attachment; filename=\"budget-ali-baba-2028.xlsx\"");
        expect(response.headers.get("cache-control")).toBe("no-store");
        expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array([80, 75, 3, 4]));
    });

    it("falls back to Swedish for an unknown locale", async () => {
        apiFetch.mockResolvedValue(new Response(new Uint8Array([1]), {status: 200}));

        await get("3", "de");

        expect(apiFetch).toHaveBeenCalledWith("/api/revivals/3/budget.xlsx?lang=sv");
    });

    it("forwards the server's error status", async () => {
        apiFetch.mockResolvedValue(new Response("{}", {status: 404}));

        expect((await get("3")).status).toBe(404);
    });
});
