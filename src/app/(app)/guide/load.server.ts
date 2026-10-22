import "server-only";

import {notFound} from "next/navigation";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getGuideLatestVersion, getGuideVersion, getGuideVersions} from "@/lib/guide/guide.server";

/**
 * The published versions and the one to show: the one asked for, or the latest. Not found for an unknown version;
 * refused for users the guide is not shown to.
 */
export async function loadGuide(version: string | undefined) {
    try {
        const versions = await getGuideVersions();
        const shown = version ? await getGuideVersion(version) : await getGuideLatestVersion();

        return {versions, shown, refused: false};
    } catch (error) {
        if (error instanceof GraphQLRequestError && error.code === "FORBIDDEN") {
            return {versions: [], shown: null, refused: true};
        }
        if (error instanceof GraphQLRequestError && error.code === "NOT_FOUND") {
            notFound();
        }
        throw error;
    }
}
