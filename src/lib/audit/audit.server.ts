import "server-only";

import {graphql} from "@/gql";
import type {AuditedType} from "@/gql/graphql";
import {runQuery} from "@/lib/graphql.server";

// A record's history (audit.graphqls), read only. The server decides who may read it, as it does for the record.

const RevisionsQuery = graphql(`
    query Revisions($type: AuditedType!, $id: ID!) {
        revisions(type: $type, id: $id) {
            revision
            revisionType
            modifiedAt
            modifiedBy
            source
            comment
            changes { field kind oldValue newValue }
        }
    }
`);

export async function getRevisions(type: AuditedType, id: string) {
    return (await runQuery(RevisionsQuery, {type, id}))?.revisions ?? [];
}
