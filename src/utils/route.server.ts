import "server-only";

import type {NextRequest} from "next/server";
import {NextResponse} from "next/server";
import type {AuthzFail, AuthzOk, AuthzResult} from "@/types/auth";
import {redirect} from "next/navigation";

const LOGIN_PATH = "/api/auth/login";
const NO_ACCESS_PATH = "/no-access";

type RouteContext = unknown;

type RouteHandler = (request: NextRequest, context: RouteContext) => Promise<Response> | Response;

type AuthedRouteHandler = (
    request: NextRequest,
    context: RouteContext,
    authz: AuthzOk
) => Promise<Response> | Response;

export function authzFailureResponse(authz: AuthzFail): Response {
    return NextResponse.json({error: authz.message}, {status: authz.status});
}

export function withPolicyRoute(policy: () => Promise<AuthzResult>, handler: AuthedRouteHandler): RouteHandler {
    return async (request, context) => {
        const authz = await policy();
        if (!authz.ok) {
            if (authz.status === 401) {
                redirect("/");
            }
            return authzFailureResponse(authz);
        }
        return handler(request, context, authz);
    };
}

export async function withPolicyAction<T>(
    policy: () => Promise<AuthzResult>,
    handler: (authz: AuthzOk) => Promise<T>
): Promise<T> {
    const authz = await policy();
    if (!authz.ok) {
        if (authz.status === 401) {
            redirect(LOGIN_PATH);
        }
        throw new Error(authz.message);
    }
    return handler(authz);
}

/**
 * As {@link withPolicyAction}, but a user who is logged in without the right role is sent to the no-access page
 * instead of an error.
 */
export async function withPolicyPage<T>(
    policy: () => Promise<AuthzResult>,
    handler: (authz: AuthzOk) => Promise<T>
): Promise<T> {
    const authz = await policy();
    if (!authz.ok) {
        redirect(authz.status === 401 ? LOGIN_PATH : NO_ACCESS_PATH);
    }
    return handler(authz);
}
