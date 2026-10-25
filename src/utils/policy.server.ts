import "server-only";

import {requireAllRoles, requireAnyRole} from "@/utils/auth.server";
import {AuthzResult} from "@/types/auth";

/**
 * Page and action guards by global role. They only decide which pages to show; the server enforces every rule,
 * and what a user may do with a revival comes from `Revival.permissions`.
 */
export const Policies = {
    app: {
        async requireAccess(): Promise<AuthzResult> {
            return requireAnyRole(["USER"]);
        },
    },
    admin: {
        async requireSuperAdmin(): Promise<AuthzResult> {
            return requireAllRoles(["USER", "SUPER_ADMIN"]);
        },
    },
    revivals: {
        async requireReadAll(): Promise<AuthzResult> {
            const access = await requireAnyRole(["USER"]);

            return access.ok ? requireAnyRole(["SUPER_ADMIN", "OBSERVER"]) : access;
        },
    },
} as const;
