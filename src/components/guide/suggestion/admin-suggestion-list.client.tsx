"use client";

import type {GuideItemType, GuideSuggestionFieldsFragment} from "@/gql/graphql";
import {SuggestionAcceptDialog, SuggestionRejectDialog} from "@/components/guide/suggestion/suggestion-accept-dialog.client";
import {SuggestionList} from "@/components/guide/suggestion/suggestion-list.client";

export type DraftItems = Record<string, { type: GuideItemType; text: { sv: string; en?: string | null } }>;

/**
 * Every suggestion, with accept and reject on the open ones (FR-033). {@code draftItems} are the draft's items by key,
 * shown next to a suggestion whose item has changed since.
 */
export function AdminSuggestionList({suggestions, draftItems}: { suggestions: GuideSuggestionFieldsFragment[]; draftItems: DraftItems }) {
    return (
        <SuggestionList
            suggestions={suggestions}
            showRevival
            actions={suggestion => suggestion.status === "OPEN" && (
                <>
                    <SuggestionAcceptDialog suggestion={suggestion} draftItem={suggestion.itemKey ? draftItems[suggestion.itemKey] ?? null : null}/>
                    <SuggestionRejectDialog suggestion={suggestion}/>
                </>
            )}
        />
    );
}
