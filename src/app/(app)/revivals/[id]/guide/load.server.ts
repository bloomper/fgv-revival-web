import "server-only";

import {cache} from "react";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getRevivalGuide} from "@/lib/guide/guide.server";

/**
 * A revival and its pinned version, or null when the user cannot see the revival. Once per request, as the chapters'
 * layout and page both need it.
 */
export const loadRevivalGuide = cache(async (id: string) => {
    try {
        return await getRevivalGuide(id);
    } catch (error) {
        if (error instanceof GraphQLRequestError && (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")) {
            return null;
        }
        throw error;
    }
});
