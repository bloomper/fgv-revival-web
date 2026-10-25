import {beforeEach, describe, expect, it, vi} from "vitest";
import {NextRequest} from "next/server";
import {DELETE, GET, POST} from "@/app/api/receipts/[transactionId]/route";

const apiFetch = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api.server", () => ({apiFetch}));

const context = (transactionId: string) => ({params: Promise.resolve({transactionId})});
const url = (id: string) => `http://localhost/api/receipts/${id}`;

function upload(id: string, file?: File) {
    const body = new FormData();

    if (file) {
        body.append("file", file);
    }
    return POST(new NextRequest(url(id), {method: "POST", body}), context(id));
}

describe("/api/receipts/[transactionId]", () => {
    beforeEach(() => {
        apiFetch.mockReset();
    });

    it("refuses an id that is not one", async () => {
        expect((await GET(new NextRequest(url("..")), context(".."))).status).toBe(400);
        expect((await DELETE(new NextRequest(url("1;x"), {method: "DELETE"}), context("1;x"))).status).toBe(400);
        expect(apiFetch).not.toHaveBeenCalled();
    });

    it("downloads the receipt as a sandboxed attachment", async () => {
        apiFetch.mockResolvedValue(new Response(new Uint8Array([37, 80, 68, 70]), {
            status: 200,
            headers: {"content-type": "application/pdf", "content-disposition": "attachment; filename=\"kvitto.pdf\""},
        }));

        const response = await GET(new NextRequest(url("7")), context("7"));

        expect(apiFetch).toHaveBeenCalledWith("/api/transactions/7/receipt");
        expect(response.headers.get("content-type")).toBe("application/pdf");
        expect(response.headers.get("content-disposition")).toBe("attachment; filename=\"kvitto.pdf\"");
        expect(response.headers.get("content-security-policy")).toContain("sandbox");
        expect(response.headers.get("x-content-type-options")).toBe("nosniff");
        expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array([37, 80, 68, 70]));
    });

    it("passes the server's error code and message on", async () => {
        apiFetch.mockResolvedValue(Response.json({code: "NOT_FOUND", message: "Kvittot finns inte."}, {status: 404}));

        const response = await GET(new NextRequest(url("7")), context("7"));

        expect(response.status).toBe(404);
        expect(await response.json()).toEqual({code: "NOT_FOUND", message: "Kvittot finns inte."});
    });

    it("forwards an uploaded receipt as multipart and returns its metadata", async () => {
        const metadata = {
            filename: "kvitto.pdf",
            contentType: "application/pdf",
            size: 4,
            uploadedAt: "2027-11-02T10:00:00Z"
        };

        apiFetch.mockResolvedValue(Response.json(metadata));

        const response = await upload("7", new File(["%PDF"], "kvitto.pdf", {type: "application/pdf"}));

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual(metadata);

        const [path, init] = apiFetch.mock.calls[0];
        const sent = (init.body as FormData).get("file") as File;

        expect(path).toBe("/api/transactions/7/receipt");
        expect(init.method).toBe("POST");
        expect(sent.type).toBe("application/pdf");
        expect(await sent.text()).toBe("%PDF");
    });

    it("refuses an upload without a file, of another type or too large", async () => {
        expect((await upload("7")).status).toBe(400);
        expect((await upload("7", new File(["<svg/>"], "x.svg", {type: "image/svg+xml"}))).status).toBe(400);

        const large = new File([new Uint8Array(10 * 1024 * 1024 + 1)], "big.pdf", {type: "application/pdf"});

        expect((await upload("7", large)).status).toBe(413);
        expect(apiFetch).not.toHaveBeenCalled();
    });

    it("removes the receipt", async () => {
        apiFetch.mockResolvedValue(new Response(null, {status: 204}));

        const response = await DELETE(new NextRequest(url("7"), {method: "DELETE"}), context("7"));

        expect(apiFetch).toHaveBeenCalledWith("/api/transactions/7/receipt", {method: "DELETE"});
        expect(response.status).toBe(204);
    });

    it("refuses an upload or removal from another site", async () => {
        const headers = {origin: "https://evil.example.org", host: "localhost"};
        const body = new FormData();

        body.append("file", new File(["%PDF"], "kvitto.pdf", {type: "application/pdf"}));
        expect((await POST(new NextRequest(url("7"), {method: "POST", body, headers}), context("7"))).status).toBe(403);
        expect((await DELETE(new NextRequest(url("7"), {method: "DELETE", headers}), context("7"))).status).toBe(403);
        expect(apiFetch).not.toHaveBeenCalled();
    });

    it("accepts a removal from the application's own origin", async () => {
        apiFetch.mockResolvedValue(new Response(null, {status: 204}));

        const headers = {origin: "https://revival.example.org", "x-forwarded-host": "revival.example.org", host: "web:3000"};
        const response = await DELETE(new NextRequest(url("7"), {method: "DELETE", headers}), context("7"));

        expect(response.status).toBe(204);
    });
});
