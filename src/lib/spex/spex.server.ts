import "server-only";

import {graphql} from "@/gql";
import {runQuery} from "@/lib/graphql.server";

const SpexSearchQuery = graphql(`
    query SpexSearch($query: String!, $first: Int) {
        spexSearch(query: $query, first: $first) { id title year available }
    }
`);

export async function searchSpex(query: string) {
    return (await runQuery(SpexSearchQuery, {query, first: 20}))?.spexSearch ?? [];
}
