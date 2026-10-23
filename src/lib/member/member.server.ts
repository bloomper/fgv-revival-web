import "server-only";

import {graphql} from "@/gql";
import type {RevivalMemberAddInput, RevivalMemberCapabilitiesInput} from "@/gql/graphql";
import {runMutation, runQuery} from "@/lib/graphql.server";

const MemberCandidatesQuery = graphql(`
    query RevivalMemberCandidates($revivalId: ID!, $query: String!) {
        revivalMemberCandidates(revivalId: $revivalId, query: $query) { email displayName hasAccess }
    }
`);

const MemberAddMutation = graphql(`
    mutation RevivalMemberAdd($input: RevivalMemberAddInput!) {
        revivalMemberAdd(input: $input) { id role capabilities { ...CapabilityFields } state displayName email invitedAt version }
    }
`);

const MemberCapabilitiesMutation = graphql(`
    mutation RevivalMemberCapabilitiesSet($input: RevivalMemberCapabilitiesInput!) {
        revivalMemberCapabilitiesSet(input: $input) { id capabilities { ...CapabilityFields } version }
    }
`);

const MemberRemoveMutation = graphql(`
    mutation RevivalMemberRemove($id: ID!) {
        revivalMemberRemove(id: $id)
    }
`);

/**
 * Users in the FGV realm matching the query, for picking a member; the server asks for at least 3 characters.
 */
export async function searchMemberCandidates(revivalId: string, query: string) {
    return (await runQuery(MemberCandidatesQuery, {revivalId, query}))?.revivalMemberCandidates ?? [];
}

export async function addMember(input: RevivalMemberAddInput) {
    return (await runMutation(MemberAddMutation, {input}))?.revivalMemberAdd;
}

export async function setCapabilities(input: RevivalMemberCapabilitiesInput) {
    return (await runMutation(MemberCapabilitiesMutation, {input}))?.revivalMemberCapabilitiesSet;
}

export async function removeMember(id: string): Promise<void> {
    await runMutation(MemberRemoveMutation, {id});
}
