import {describe, expect, it} from "vitest";
import {
    appendLogoutParams,
    canReadAllRevivals,
    extractRolesFromClaims,
    hasAccess,
    isObserver,
    isSuperAdmin,
    normalizeTheme,
} from "@/utils/auth";

describe("extractRolesFromClaims", () => {
    it("reads the fgv-revival client roles only", () => {
        expect(extractRolesFromClaims({
            resource_access: {
                "fgv-revival": {roles: ["USER", "super_admin", "OBSERVER", "USER", "UNKNOWN"]},
                spexregister: {roles: ["ADMIN"]},
            },
        })).toEqual(["USER", "SUPER_ADMIN", "OBSERVER"]);
    });

    it("gives no roles without the claim", () => {
        expect(extractRolesFromClaims({})).toEqual([]);
        expect(extractRolesFromClaims({resource_access: {spexregister: {roles: ["USER"]}}})).toEqual([]);
    });
});

describe("role helpers", () => {
    it("tells access and global roles apart", () => {
        expect(hasAccess(["USER"])).toBe(true);
        expect(hasAccess(["SUPER_ADMIN"])).toBe(false);
        expect(isSuperAdmin(["USER", "SUPER_ADMIN"])).toBe(true);
        expect(isObserver(["USER", "OBSERVER"])).toBe(true);
        expect(canReadAllRevivals(["USER"])).toBe(false);
        expect(canReadAllRevivals(["USER", "OBSERVER"])).toBe(true);
        expect(canReadAllRevivals(["USER", "SUPER_ADMIN"])).toBe(true);
    });
});

describe("normalizeTheme", () => {
    it("accepts known themes only", () => {
        expect(normalizeTheme("dark")).toBe("dark");
        expect(normalizeTheme("light")).toBe("light");
        expect(normalizeTheme("system")).toBe("system");
        expect(normalizeTheme("neon")).toBeUndefined();
        expect(normalizeTheme(undefined)).toBeUndefined();
    });
});

describe("appendLogoutParams", () => {
    const endSession = "https://kc.example/realms/r/protocol/openid-connect/logout";

    it("returns the URL untouched when there is nothing to append", () => {
        expect(appendLogoutParams(endSession)).toBe(endSession);
    });

    it("appends locale and theme", () => {
        const url = new URL(appendLogoutParams(endSession, "sv", "dark"));

        expect(url.searchParams.get("ui_locales")).toBe("sv");
        expect(url.searchParams.get("theme")).toBe("dark");
    });

    it("preserves the params Better Auth already put on the URL", () => {
        const withHint = `${endSession}?id_token_hint=abc&post_logout_redirect_uri=https%3A%2F%2Fapp.example`;

        const url = new URL(appendLogoutParams(withHint, "en"));

        expect(url.searchParams.get("id_token_hint")).toBe("abc");
        expect(url.searchParams.get("post_logout_redirect_uri")).toBe("https://app.example");
        expect(url.searchParams.get("ui_locales")).toBe("en");
        expect(url.searchParams.get("theme")).toBeNull();
    });
});
