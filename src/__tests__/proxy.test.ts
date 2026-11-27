import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

const getAccessTokenMock = vi.fn();

vi.mock("@/auth", () => ({
  auth: { api: { getAccessToken: (...args: unknown[]) => getAccessTokenMock(...args) } },
}));

const request = (path: string, cookie?: string) =>
  new NextRequest(new URL(`http://localhost${path}`), {
    headers: cookie ? { cookie } : {},
  });

beforeEach(() => {
  getAccessTokenMock.mockReset();
  getAccessTokenMock.mockResolvedValue({ headers: new Headers() });
});

describe("proxy", () => {
  it("gives pages their Content Security Policy, signed in or not", async () => {
    expect((await proxy(request("/revivals"))).headers.get("Content-Security-Policy")).toContain("default-src 'self'");
    expect(
      (await proxy(request("/revivals", "better-auth.account_data=abc"))).headers.get("Content-Security-Policy")
    ).toContain("frame-ancestors 'none'");
  });

  it("leaves the API routes to set a policy of their own", async () => {
    expect((await proxy(request("/api/guide-pdf"))).headers.get("Content-Security-Policy")).toBeNull();
  });

  it("refreshes the token only for requests with an account cookie, and never for Better Auth's own routes", async () => {
    await proxy(request("/revivals"));
    await proxy(request("/api/auth/sign-out", "better-auth.account_data=abc"));
    expect(getAccessTokenMock).not.toHaveBeenCalled();

    await proxy(request("/revivals", "better-auth.account_data=abc"));
    expect(getAccessTokenMock).toHaveBeenCalledTimes(1);
  });
});
