import "server-only";

import {graphql} from "@/gql";
import type {LibraryEntryInput} from "@/gql/graphql";
import {runMutation, runQuery} from "@/lib/graphql.server";

// The reference library (library.graphqls): whoever reads the guide reads it, the super admin keeps it.

const LibraryEntriesQuery = graphql(`
    query LibraryEntries($includeRetired: Boolean) {
        libraryEntries(includeRetired: $includeRetired) { ...LibraryEntryFields }
    }
`);

const LibraryEntryCreateMutation = graphql(`
    mutation LibraryEntryCreate($input: LibraryEntryInput!) {
        libraryEntryCreate(input: $input) { id }
    }
`);

const LibraryEntryUpdateMutation = graphql(`
    mutation LibraryEntryUpdate($id: ID!, $version: Int!, $input: LibraryEntryInput!) {
        libraryEntryUpdate(id: $id, version: $version, input: $input) { id }
    }
`);

const LibraryEntryRetireMutation = graphql(`
    mutation LibraryEntryRetire($id: ID!, $version: Int!) {
        libraryEntryRetire(id: $id, version: $version) { id }
    }
`);

const LibraryEntryRestoreMutation = graphql(`
    mutation LibraryEntryRestore($id: ID!, $version: Int!) {
        libraryEntryRestore(id: $id, version: $version) { id }
    }
`);

/**
 * By kind, then Swedish name; retired entries only when asked for.
 */
export async function getLibraryEntries(includeRetired = false) {
    return (await runQuery(LibraryEntriesQuery, {includeRetired}))?.libraryEntries ?? [];
}

export async function createLibraryEntry(input: LibraryEntryInput) {
    await runMutation(LibraryEntryCreateMutation, {input});
}

export async function updateLibraryEntry(id: string, version: number, input: LibraryEntryInput) {
    await runMutation(LibraryEntryUpdateMutation, {id, version, input});
}

export async function retireLibraryEntry(id: string, version: number) {
    await runMutation(LibraryEntryRetireMutation, {id, version});
}

export async function restoreLibraryEntry(id: string, version: number) {
    await runMutation(LibraryEntryRestoreMutation, {id, version});
}
