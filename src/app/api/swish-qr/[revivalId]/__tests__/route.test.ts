import {beforeEach, describe, expect, it, vi} from "vitest";
import {NextRequest} from "next/server";
import {GET} from "@/app/api/swish-qr/[revivalId]/route";

const apiFetch = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api.server", () => ({apiFetch}));

const get = (revivalId: string) => GET(new NextRequest(`http://localhost/api/swish-qr/${revivalId}`), {params: Promise.resolve({revivalId})});

describe("GET /api/swish-qr/[revivalId]", () => {
    beforeEach(() => {
        apiFetch.mockReset();
    });

    it.each(["abc", "1;drop", "../1"])("refuses %s", async revivalId => {
        expect((await get(revivalId)).status).toBe(400);
        expect(apiFetch).not.toHaveBeenCalled();
    });

    it("passes the QR code through as a sandboxed SVG, cached privately", async () => {
        apiFetch.mockResolvedValue(new Response("<svg/>", {status: 200, headers: {"content-type": "image/svg+xml"}}));

        const response = await get("3");

        expect(apiFetch).toHaveBeenCalledWith("/api/revivals/3/swish-qr");
        expect(response.status).toBe(200);
        expect(response.headers.get("content-type")).toBe("image/svg+xml");
        expect(response.headers.get("content-security-policy")).toContain("sandbox");
        expect(response.headers.get("x-content-type-options")).toBe("nosniff");
        expect(response.headers.get("cache-control")).toBe("private, max-age=3600");
        expect(await response.text()).toBe("<svg/>");
    });

    it.each([404, 503])("forwards the server's %i", async status => {
        apiFetch.mockResolvedValue(new Response("{}", {status}));

        expect((await get("3")).status).toBe(status);
    });
});
