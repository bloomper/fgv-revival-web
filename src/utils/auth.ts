import {AccessTokenClaims, type Role} from "@/types/auth";

export const CLIENT_ID = "fgv-revival";

export const hasAccess = (roles: Role[]) => roles.includes("USER");
export const isSuperAdmin = (roles: Role[]) => roles.includes("SUPER_ADMIN");
export const isObserver = (roles: Role[]) => roles.includes("OBSERVER");
export const canReadAllRevivals = (roles: Role[]) => isSuperAdmin(roles) || isObserver(roles);

function normalizeRole(value: string): Role | null {
    const v = value.trim().toUpperCase();
    if (v === "USER" || v === "SUPER_ADMIN" || v === "OBSERVER") {
        return v;
    }
    return null;
}

/**
 * Global roles from the `fgv-revival` client roles in the access token. Revival roles are never read here; the
 * server's `Revival.permissions` says what the user may do with a revival.
 */
export function extractRolesFromClaims(claims: AccessTokenClaims): Role[] {
    const rawRoles = claims.resource_access?.[CLIENT_ID]?.roles ?? [];
    const roles = rawRoles
        .map(normalizeRole)
        .filter((r): r is Role => r !== null);

    return Array.from(new Set(roles));
}

export const appendLogoutParams = (
    logoutUrl: string,
    locale?: string,
    theme?: "light" | "dark" | "system"
): string => {
    if (!locale && !theme) {
        return logoutUrl;
    }

    const separator = logoutUrl.includes("?") ? "&" : "?";
    const urlParams = new URLSearchParams();

    if (locale) {
        urlParams.append("ui_locales", locale);
    }
    if (theme) {
        urlParams.append("theme", theme);
    }

    return `${logoutUrl}${separator}${urlParams.toString()}`;
};

export function normalizeTheme(value?: string): "light" | "dark" | "system" | undefined {
    if (value === "light" || value === "dark" || value === "system") return value;
    return undefined;
}
