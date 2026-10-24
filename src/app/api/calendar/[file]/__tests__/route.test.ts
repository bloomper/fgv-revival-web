import {beforeEach, describe, expect, it, vi} from "vitest";
import {NextRequest} from "next/server";
import {GET} from "@/app/api/calendar/[file]/route";

const apiFetchPublic = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api.server", () => ({apiFetchPublic}));

const TOKEN = "AbCdEfGhIjKlMnOpQrStUvWxYz0123456789_-abcde";
const get = (file: string, query = "") => GET(new NextRequest(`http://localhost/api/calendar/${file}${query}`), {params: Promise.resolve({file})});
const ICS = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nEND:VCALENDAR\r\n";

describe("GET /api/calendar/[file]", () => {
    beforeEach(() => {
        apiFetchPublic.mockReset();
    });

    it.each(["feed", `${TOKEN}.txt`, `${TOKEN}`, "short.ics", `..%2F${TOKEN}.ics`, `${TOKEN};x.ics`])("answers 404 for %s without asking the server", async file => {
        const response = await get(file);

        expect(response.status).toBe(404);
        expect(apiFetchPublic).not.toHaveBeenCalled();
    });

    it("passes the feed through without a session, privately cached", async () => {
        apiFetchPublic.mockResolvedValue(new Response(ICS, {
            status: 200,
            headers: {"content-type": "text/calendar; charset=utf-8"}
        }));

        const response = await get(`${TOKEN}.ics`);

        expect(apiFetchPublic).toHaveBeenCalledWith(`/api/calendar/${TOKEN}.ics`);
        expect(response.status).toBe(200);
        expect(response.headers.get("content-type")).toBe("text/calendar; charset=utf-8");
        expect(response.headers.get("cache-control")).toBe("private, max-age=900");
        expect(response.headers.get("x-content-type-options")).toBe("nosniff");
        expect(await response.text()).toBe(ICS);
    });

    it("passes a known language on and drops anything else", async () => {
        apiFetchPublic.mockImplementation(async () => new Response(ICS, {status: 200}));

        await get(`${TOKEN}.ics`, "?lang=en");
        await get(`${TOKEN}.ics`, "?lang=de&x=1");

        expect(apiFetchPublic).toHaveBeenNthCalledWith(1, `/api/calendar/${TOKEN}.ics?lang=en`);
        expect(apiFetchPublic).toHaveBeenNthCalledWith(2, `/api/calendar/${TOKEN}.ics`);
    });

    it("answers 404 for a link the server does not know", async () => {
        apiFetchPublic.mockResolvedValue(new Response("{}", {status: 404}));

        const response = await get(`${TOKEN}.ics`);

        expect(response.status).toBe(404);
        expect(await response.text()).toBe("Not found");
    });

    it("forwards the server's error status", async () => {
        apiFetchPublic.mockResolvedValue(new Response("{}", {status: 503}));

        expect((await get(`${TOKEN}.ics`)).status).toBe(503);
    });
});
