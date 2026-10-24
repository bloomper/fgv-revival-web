import {beforeEach, describe, expect, it, vi} from "vitest";
import {NextRequest} from "next/server";
import {GET} from "@/app/api/revival-poster/[id]/route";

const apiFetch = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api.server", () => ({apiFetch}));

const get = (id: string) => GET(new NextRequest(`http://localhost/api/revival-poster/${id}`), {params: Promise.resolve({id})});

describe("GET /api/revival-poster/[id]", () => {
    beforeEach(() => {
        apiFetch.mockReset();
    });

    it.each(["abc", "1;drop", "../1"])("refuses %s", async id => {
        const response = await get(id);

        expect(response.status).toBe(400);
        expect(apiFetch).not.toHaveBeenCalled();
    });

    it("passes the poster through, sandboxed", async () => {
        apiFetch.mockResolvedValue(new Response(new Uint8Array([137, 80, 78, 71]), {
            status: 200,
            headers: {"content-type": "image/png"}
        }));

        const response = await get("3");

        expect(apiFetch).toHaveBeenCalledWith("/api/revivals/3/poster");
        expect(response.status).toBe(200);
        expect(response.headers.get("content-type")).toBe("image/png");
        expect(response.headers.get("content-security-policy")).toContain("sandbox");
        expect(response.headers.get("x-content-type-options")).toBe("nosniff");
        expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array([137, 80, 78, 71]));
    });

    it("answers 404 when the spex has no poster", async () => {
        apiFetch.mockResolvedValue(new Response(null, {status: 204}));

        expect((await get("3")).status).toBe(404);
    });

    it("forwards the server's error status", async () => {
        apiFetch.mockResolvedValue(new Response("{}", {status: 503}));

        expect((await get("3")).status).toBe(503);
    });
});
