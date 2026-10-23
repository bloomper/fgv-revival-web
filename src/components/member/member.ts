import type {MemberState, RevivalRole} from "@/gql/graphql";
import type {CatalogEntryValue} from "@/components/catalog/catalog";

export type Member = {
    id: string;
    role: RevivalRole;
    capabilities?: CatalogEntryValue[] | null;
    state: MemberState;
    displayName?: string | null;
    email?: string | null;
    invitedAt?: string | null;
    version?: number | null;
};

/**
 * A member waiting for access may be known only by their email address, or, when it is not sent, by neither.
 */
export function memberName(member: Member, fallback: string): string {
    return member.displayName ?? member.email ?? fallback;
}
