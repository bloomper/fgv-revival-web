import "server-only";

import {jwtDecode} from "jwt-decode";
import {getSessionContext} from "@/utils/auth.server";
import {type Application, resolveApplications} from "@/utils/applications";
import type {AccessTokenClaims} from "@/types/auth";

/**
 * The applications the signed-in user can switch to from Nyuppsättning. The addresses are read from the environment
 * at request time, so one image serves every environment; without a session only Nyuppsättning itself is listed.
 */
export async function getApplications(): Promise<Application[]> {
    const {accessToken} = await getSessionContext();
    const claims = accessToken ? jwtDecode<AccessTokenClaims>(accessToken) : {};

    return resolveApplications("revival", claims, process.env);
}
