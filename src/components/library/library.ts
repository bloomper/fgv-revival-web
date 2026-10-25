import type {LibraryEntryKind} from "@/gql/graphql";
import type {LocalizedTextValue} from "@/components/guide/localized";

/**
 * A reference library entry as the pages show it.
 */
export type LibraryEntryRow = {
    id: string;
    kind: LibraryEntryKind;
    name: LocalizedTextValue;
    description?: LocalizedTextValue | null;
    pros?: LocalizedTextValue | null;
    cons?: LocalizedTextValue | null;
    booking?: LocalizedTextValue | null;
    prices?: LocalizedTextValue | null;
    contact?: LocalizedTextValue | null;
    url?: string | null;
    retired: boolean;
    version: number;
};

/**
 * What a guide item links to: enough to name the entry and point at it.
 */
export type LibraryLinkValue = { id: string; kind: LibraryEntryKind; name: LocalizedTextValue; retired: boolean };

export function libraryAnchor(id: string) {
    return `entry-${id}`;
}
