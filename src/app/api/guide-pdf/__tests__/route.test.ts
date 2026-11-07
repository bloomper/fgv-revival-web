import {beforeEach, describe, expect, it, vi} from "vitest";
import {NextRequest} from "next/server";
import {GET} from "@/app/api/guide-pdf/route";

const apiFetch = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api.server", () => ({apiFetch}));

const request = (query: string) => new NextRequest(`http://localhost/api/guide-pdf?${query}`);

describe("GET /api/guide-pdf", () => {
    beforeEach(() => {
        apiFetch.mockReset();
    });

    it.each(["", "version=abc", "version=1", "revival=1&version=2", "version=1&lang=de", "version=1;drop"])("refuses %s", async query => {
        const response = await GET(request(query));

        expect(response.status).toBe(400);
        expect(apiFetch).not.toHaveBeenCalled();
    });

    it("fetches a version's PDF and passes its name through", async () => {
        apiFetch.mockResolvedValue(new Response(new Uint8Array([37, 80, 68, 70]), {
            status: 200,
            headers: {
                "content-type": "application/pdf",
                "content-disposition": "attachment; filename=\"nyuppsattningsguide-v1-sv.pdf\""
            },
        }));

        const response = await GET(request("version=00000000-0000-7000-8000-000000000007&lang=sv"));

        expect(apiFetch).toHaveBeenCalledWith("/api/guide/versions/00000000-0000-7000-8000-000000000007/pdf?lang=sv");
        expect(response.status).toBe(200);
        expect(response.headers.get("content-disposition")).toContain("nyuppsattningsguide-v1-sv.pdf");
        expect(response.headers.get("cache-control")).toBe("no-store");
        expect(response.headers.get("content-security-policy")).toBe("default-src 'none'; sandbox");
        expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    });

    it("fetches a revival's guide and forwards the server's status", async () => {
        apiFetch.mockResolvedValue(new Response("{}", {status: 404}));

        const response = await GET(request("revival=00000000-0000-7000-8000-000000000003"));

        expect(apiFetch).toHaveBeenCalledWith("/api/revivals/00000000-0000-7000-8000-000000000003/guide/pdf");
        expect(response.status).toBe(404);
    });
});
