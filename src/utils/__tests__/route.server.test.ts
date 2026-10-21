import {describe, expect, it, vi} from "vitest";
import type {NextRequest} from "next/server";
import {authzFailureResponse, withPolicyAction, withPolicyPage, withPolicyRoute} from "@/utils/route.server";

vi.mock("next/navigation", () => ({
    redirect: vi.fn((path: string) => {
        throw new Error(`redirect:${path}`);
    }),
}));

const ok = async () => ({ok: true as const, roles: ["USER" as const]});
const unauthenticated = async () => ({ok: false as const, status: 401 as const, message: "Not authenticated"});
const forbidden = async () => ({ok: false as const, status: 403 as const, message: "Not authorized"});

describe("route.server", () => {
    it("runs the handler when the policy allows it", async () => {
        expect(await withPolicyAction(ok, async () => "done")).toBe("done");
        expect(await withPolicyPage(ok, async ({roles}) => roles)).toEqual(["USER"]);
    });

    it("sends an action without a session to login and refuses others", async () => {
        await expect(withPolicyAction(unauthenticated, async () => "x")).rejects.toThrow("redirect:/api/auth/login");
        await expect(withPolicyAction(forbidden, async () => "x")).rejects.toThrow("Not authorized");
    });

    it("sends a page to login or to the no-access page", async () => {
        await expect(withPolicyPage(unauthenticated, async () => "x")).rejects.toThrow("redirect:/api/auth/login");
        await expect(withPolicyPage(forbidden, async () => "x")).rejects.toThrow("redirect:/no-access");
    });

    it("answers a refused route with the status", async () => {
        const handler = withPolicyRoute(forbidden, () => new Response("ok"));
        const response = await handler({} as NextRequest, {});

        expect(response.status).toBe(403);
        expect(authzFailureResponse({ok: false, status: 401, message: "x"}).status).toBe(401);
        await expect(withPolicyRoute(unauthenticated, () => new Response("ok"))({} as NextRequest, {})).rejects.toThrow("redirect:/");
        expect(await (await withPolicyRoute(ok, () => new Response("ok"))({} as NextRequest, {})).text()).toBe("ok");
    });
});
