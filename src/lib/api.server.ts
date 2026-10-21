import "server-only";

import {getLocale} from "next-intl/server";
import {getAccessToken} from "@/utils/auth.server";

/**
 * The server's plain HTTP endpoints (contracts/http.md) live next to GraphQL, so their base comes from
 * API_GRAPHQL_ENDPOINT and no other variable is needed.
 */
export function apiUrl(path: string): string {
    return new URL(path, process.env.API_GRAPHQL_ENDPOINT || "http://localhost").toString();
}

/**
 * Calls a plain HTTP endpoint with the user's token and language, from the server only.
 */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
    const token = await getAccessToken();
    const headers = new Headers(init.headers);

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Accept-Language", await getLocale());
    return fetch(apiUrl(path), {...init, headers, cache: "no-store"});
}
