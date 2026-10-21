import {beforeEach, describe, expect, it, vi} from "vitest";
import {auth} from "@/auth";
import {Policies} from "@/utils/policy.server";
import {tokenWithRoles} from "@/utils/__tests__/token";

vi.mock("next/headers", () => ({headers: vi.fn(async () => new Headers())}));
vi.mock("react", async (importOriginal) => ({...(await importOriginal<typeof import("react")>()), cache: <T, >(fn: T) => fn}));

function loggedIn(roles: string[]) {
    vi.mocked(auth.api.getSession).mockResolvedValue({user: {id: "1"}} as never);
    vi.mocked(auth.api.getAccessToken).mockResolvedValue({accessToken: tokenWithRoles(roles)} as never);
}

describe("Policies", () => {
    beforeEach(() => vi.resetAllMocks());

    it("app.requireAccess needs USER", async () => {
        loggedIn(["SUPER_ADMIN"]);
        expect((await Policies.app.requireAccess()).ok).toBe(false);
        loggedIn(["USER"]);
        expect((await Policies.app.requireAccess()).ok).toBe(true);
    });

    it("admin.requireSuperAdmin needs USER and SUPER_ADMIN", async () => {
        loggedIn(["SUPER_ADMIN"]);
        expect((await Policies.admin.requireSuperAdmin()).ok).toBe(false);
        loggedIn(["USER", "OBSERVER"]);
        expect((await Policies.admin.requireSuperAdmin()).ok).toBe(false);
        loggedIn(["USER", "SUPER_ADMIN"]);
        expect((await Policies.admin.requireSuperAdmin()).ok).toBe(true);
    });

    it("revivals.requireReadAll needs USER and SUPER_ADMIN or OBSERVER", async () => {
        loggedIn(["USER"]);
        expect((await Policies.revivals.requireReadAll()).ok).toBe(false);
        loggedIn(["OBSERVER"]);
        expect((await Policies.revivals.requireReadAll()).ok).toBe(false);
        loggedIn(["USER", "OBSERVER"]);
        expect((await Policies.revivals.requireReadAll()).ok).toBe(true);
        loggedIn(["USER", "SUPER_ADMIN"]);
        expect((await Policies.revivals.requireReadAll()).ok).toBe(true);
    });
});
