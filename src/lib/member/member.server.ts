import "server-only";

import {graphql} from "@/gql";
import type {RevivalMemberAddInput, RevivalMemberCapabilitiesInput} from "@/gql/graphql";
import {runMutation} from "@/lib/graphql.server";

const MemberAddMutation = graphql(`
    mutation RevivalMemberAdd($input: RevivalMemberAddInput!) {
        revivalMemberAdd(input: $input) { id role capabilities { ...CapabilityFields } state displayName email version }
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

export async function addMember(input: RevivalMemberAddInput) {
    return (await runMutation(MemberAddMutation, {input}))?.revivalMemberAdd;
}

export async function setCapabilities(input: RevivalMemberCapabilitiesInput) {
    return (await runMutation(MemberCapabilitiesMutation, {input}))?.revivalMemberCapabilitiesSet;
}

export async function removeMember(id: string): Promise<void> {
    await runMutation(MemberRemoveMutation, {id});
}
