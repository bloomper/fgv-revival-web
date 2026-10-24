import "server-only";

import {cache} from "react";
import {graphql} from "@/gql";
import type {
    GuideChapterCreateInput,
    GuideChapterInput,
    GuideChapterMoveInput,
    GuideDraftPublishInput,
    GuideIntroductionInput,
    GuideItemCreateInput,
    GuideItemMoveInput,
    GuideItemUpdateInput,
    GuideSectionCreateInput,
    GuideSectionMoveInput,
    GuideSectionUpdateInput,
    GuideSuggestionAcceptInput,
    GuideSuggestionCreateInput,
    GuideSuggestionRejectInput,
    GuideSuggestionStatus,
    RevivalGuideVersionChangeInput,
} from "@/gql/graphql";
import {runMutation, runQuery} from "@/lib/graphql.server";

const GuideReadableQuery = graphql(`
    query GuideReadable {
        guideReadable
    }
`);

const GuideVersionsQuery = graphql(`
    query GuideVersions {
        guideVersions { id label publishedAt }
    }
`);

const GuideVersionsAdminQuery = graphql(`
    query GuideVersionsAdmin {
        guideVersions { id label note publishedAt publishedBy revivalCount suggestionCount deletable version }
    }
`);

const GuideVersionDeleteMutation = graphql(`
    mutation GuideVersionDelete($id: ID!, $version: Int!) {
        guideVersionDelete(id: $id, version: $version)
    }
`);

const GuideLatestVersionQuery = graphql(`
    query GuideLatestVersion {
        guideLatestVersion { ...GuideVersionFields }
    }
`);

const GuideVersionQuery = graphql(`
    query GuideVersion($id: ID!) {
        guideVersion(id: $id) { ...GuideVersionFields }
    }
`);

const RevivalGuideQuery = graphql(`
    query RevivalGuide($id: ID!) {
        revival(id: $id) {
            id
            title
            year
            status
            guideVersion { id label publishedAt }
            newerGuideVersion { id label publishedAt }
            guideVersionHistory { fromLabel toLabel changedBy changedAt }
            permissions { canSuggestGuideChange guideVersionsAllowed { id label publishedAt } }
        }
    }
`);

const GuideChangesQuery = graphql(`
    query GuideChanges($fromId: ID!, $toId: ID!) {
        guideChanges(fromId: $fromId, toId: $toId) {
            from { id label publishedAt }
            to { id label publishedAt }
            introductionChanged
            chapters { key kind renamed moved before { sv en } after { sv en } }
            sections {
                key
                kind
                chapterBefore { key title { sv en } }
                chapterAfter { key title { sv en } }
                renamed
                moved
                reordered
                before { sv en }
                after { sv en }
            }
            items {
                key
                kind
                reworded
                retyped
                moved
                before { chapter { key title { sv en } } sectionKey sectionTitle { sv en } type { ...GuideItemTypeFields } text { sv en } }
                after { chapter { key title { sv en } } sectionKey sectionTitle { sv en } type { ...GuideItemTypeFields } text { sv en } }
            }
        }
    }
`);

const RevivalGuideVersionChangeMutation = graphql(`
    mutation RevivalGuideVersionChange($input: RevivalGuideVersionChangeInput!) {
        revivalGuideVersionChange(input: $input) { id guideVersion { id label } }
    }
`);

const GuideDraftStartMutation = graphql(`
    mutation GuideDraftStart {
        guideDraftStart { draft { id } }
    }
`);

const GuideIntroductionUpdateMutation = graphql(`
    mutation GuideIntroductionUpdate($input: GuideIntroductionInput!) {
        guideIntroductionUpdate(input: $input) { id version }
    }
`);

const GuideChapterCreateMutation = graphql(`
    mutation GuideChapterCreate($input: GuideChapterCreateInput!) {
        guideChapterCreate(input: $input) { id key }
    }
`);

const GuideChapterMoveMutation = graphql(`
    mutation GuideChapterMove($input: GuideChapterMoveInput!) {
        guideChapterMove(input: $input) { id }
    }
`);

const GuideChapterRemoveMutation = graphql(`
    mutation GuideChapterRemove($id: ID!, $version: Int!) {
        guideChapterRemove(id: $id, version: $version)
    }
`);

const GuideChapterRemovalImpactQuery = graphql(`
    query GuideChapterRemovalImpact($chapterKey: ID!) {
        guideChapterRemovalImpact(chapterKey: $chapterKey) { chapterKey revivalCount itemCount doneCount }
    }
`);

const RevivalGuideVersionChangeImpactQuery = graphql(`
    query RevivalGuideVersionChangeImpact($id: ID!, $toId: ID!) {
        revival(id: $id) {
            id
            guideVersionChangeImpact(toId: $toId) { checklistId chapterKey chapterTitle { sv en } itemCount doneCount linkedLogEntryCount }
        }
    }
`);

const GuideChapterUpdateMutation = graphql(`
    mutation GuideChapterUpdate($input: GuideChapterInput!) {
        guideChapterUpdate(input: $input) { id version }
    }
`);

const GuideSectionCreateMutation = graphql(`
    mutation GuideSectionCreate($input: GuideSectionCreateInput!) {
        guideSectionCreate(input: $input) { id key }
    }
`);

const GuideSectionUpdateMutation = graphql(`
    mutation GuideSectionUpdate($input: GuideSectionUpdateInput!) {
        guideSectionUpdate(input: $input) { id version }
    }
`);

const GuideSectionMoveMutation = graphql(`
    mutation GuideSectionMove($input: GuideSectionMoveInput!) {
        guideSectionMove(input: $input) { id }
    }
`);

const GuideSectionRemoveMutation = graphql(`
    mutation GuideSectionRemove($id: ID!, $version: Int!) {
        guideSectionRemove(id: $id, version: $version)
    }
`);

const GuideItemCreateMutation = graphql(`
    mutation GuideItemCreate($input: GuideItemCreateInput!) {
        guideItemCreate(input: $input) { id key }
    }
`);

const GuideItemUpdateMutation = graphql(`
    mutation GuideItemUpdate($input: GuideItemUpdateInput!) {
        guideItemUpdate(input: $input) { id version }
    }
`);

const GuideItemMoveMutation = graphql(`
    mutation GuideItemMove($input: GuideItemMoveInput!) {
        guideItemMove(input: $input) { id }
    }
`);

const GuideItemRemoveMutation = graphql(`
    mutation GuideItemRemove($id: ID!, $version: Int!) {
        guideItemRemove(id: $id, version: $version)
    }
`);

const GuideSearchQuery = graphql(`
    query GuideSearch($versionId: ID, $query: String!) {
        guideSearch(versionId: $versionId, query: $query) {
            kind
            chapterKey
            chapterTitle { sv en }
            sectionKey
            sectionTitle { sv en }
            itemKey
            itemType { ...GuideItemTypeFields }
            snippet
            matchedLanguage
        }
    }
`);

/**
 * Whether the caller reads the guide, which the server decides from their roles in revivals. Shown as readable when
 * the server cannot say, since the guide's pages tell those who may not read it why. Once per request: the layout and
 * the home page both ask.
 */
export const getGuideReadable = cache(async () => {
    try {
        return (await runQuery(GuideReadableQuery, {}))?.guideReadable ?? true;
    } catch {
        return true;
    }
});

export async function getGuideLatestVersion() {
    return (await runQuery(GuideLatestVersionQuery, {}))?.guideLatestVersion ?? null;
}

export async function getGuideVersion(id: string) {
    return (await runQuery(GuideVersionQuery, {id}))?.guideVersion ?? null;
}

/**
 * A revival the user can see and the version it is pinned to, or a null version before the first is published.
 */
export async function getRevivalGuide(revivalId: string) {
    const revival = (await runQuery(RevivalGuideQuery, {id: revivalId}))?.revival ?? null;

    if (!revival) {
        return null;
    }
    return {revival, version: revival.guideVersion ? await getGuideVersion(revival.guideVersion.id) : null};
}

export async function searchGuide(versionId: string | null, query: string) {
    return (await runQuery(GuideSearchQuery, {versionId, query}))?.guideSearch ?? [];
}

const GuideDraftQuery = graphql(`
    query GuideDraft {
        guideDraft {
            draft { ...GuideVersionFields }
            acceptedSuggestionCount
            untranslatedCount
        }
    }
`);

const PublishMutation = graphql(`
    mutation GuideDraftPublish($input: GuideDraftPublishInput!) {
        guideDraftPublish(input: $input) { id label }
    }
`);

const DiscardMutation = graphql(`
    mutation GuideDraftDiscard($id: ID!, $version: Int!) {
        guideDraftDiscard(id: $id, version: $version)
    }
`);

export async function getGuideVersions() {
    return (await runQuery(GuideVersionsQuery, {}))?.guideVersions ?? [];
}

/**
 * Published versions with how much each is used, for super admins.
 */
export async function getGuideVersionsAdmin() {
    return (await runQuery(GuideVersionsAdminQuery, {}))?.guideVersions ?? [];
}

export async function deleteGuideVersion(id: string, version: number) {
    await runMutation(GuideVersionDeleteMutation, {id, version});
}

export async function getGuideDraft() {
    return (await runQuery(GuideDraftQuery, {}))?.guideDraft ?? null;
}

export async function publishGuideDraft(input: GuideDraftPublishInput) {
    return (await runMutation(PublishMutation, {input}))?.guideDraftPublish;
}

export async function discardGuideDraft(id: string, version: number) {
    await runMutation(DiscardMutation, {id, version});
}

export async function getGuideChanges(fromId: string, toId: string) {
    return (await runQuery(GuideChangesQuery, {fromId, toId}))?.guideChanges ?? null;
}

export async function changeRevivalGuideVersion(input: RevivalGuideVersionChangeInput) {
    return (await runMutation(RevivalGuideVersionChangeMutation, {input}))?.revivalGuideVersionChange;
}

export async function startGuideDraft() {
    return (await runMutation(GuideDraftStartMutation, {}))?.guideDraftStart;
}

export async function updateGuideIntroduction(input: GuideIntroductionInput) {
    await runMutation(GuideIntroductionUpdateMutation, {input});
}

export async function createGuideChapter(input: GuideChapterCreateInput) {
    return (await runMutation(GuideChapterCreateMutation, {input}))?.guideChapterCreate;
}

export async function updateGuideChapter(input: GuideChapterInput) {
    await runMutation(GuideChapterUpdateMutation, {input});
}

export async function moveGuideChapter(input: GuideChapterMoveInput) {
    await runMutation(GuideChapterMoveMutation, {input});
}

export async function removeGuideChapter(id: string, version: number) {
    await runMutation(GuideChapterRemoveMutation, {id, version});
}

/**
 * What removing the chapter would delete in revivals' checklists once they move to a version without it.
 */
export async function getChapterRemovalImpact(chapterKey: string) {
    return (await runQuery(GuideChapterRemovalImpactQuery, {chapterKey}))?.guideChapterRemovalImpact ?? null;
}

/**
 * The chapters of the version the draft is based on that the draft no longer has, each with what removing it would
 * delete in revivals' checklists.
 */
export async function getRemovedChapters(draft: { basedOn?: { id: string } | null; chapters: { key: string }[] }) {
    if (!draft.basedOn) {
        return [];
    }

    const basedOn = await getGuideVersion(draft.basedOn.id);
    const kept = new Set(draft.chapters.map(chapter => chapter.key));
    const removed = (basedOn?.chapters ?? []).filter(chapter => !kept.has(chapter.key));

    return Promise.all(removed.map(async chapter => {
        const impact = await getChapterRemovalImpact(chapter.key);

        return {
            key: chapter.key,
            title: chapter.title,
            revivalCount: impact?.revivalCount ?? 0,
            itemCount: impact?.itemCount ?? 0,
            doneCount: impact?.doneCount ?? 0
        };
    }));
}

/**
 * The revival's chapter checklists that moving to the version would delete.
 */
export async function getGuideVersionChangeImpact(revivalId: string, toId: string) {
    return (await runQuery(RevivalGuideVersionChangeImpactQuery, {
        id: revivalId,
        toId
    }))?.revival?.guideVersionChangeImpact ?? [];
}

export async function createGuideSection(input: GuideSectionCreateInput) {
    await runMutation(GuideSectionCreateMutation, {input});
}

export async function updateGuideSection(input: GuideSectionUpdateInput) {
    await runMutation(GuideSectionUpdateMutation, {input});
}

export async function moveGuideSection(input: GuideSectionMoveInput) {
    await runMutation(GuideSectionMoveMutation, {input});
}

export async function removeGuideSection(id: string, version: number) {
    await runMutation(GuideSectionRemoveMutation, {id, version});
}

export async function createGuideItem(input: GuideItemCreateInput) {
    await runMutation(GuideItemCreateMutation, {input});
}

export async function updateGuideItem(input: GuideItemUpdateInput) {
    await runMutation(GuideItemUpdateMutation, {input});
}

export async function moveGuideItem(input: GuideItemMoveInput) {
    await runMutation(GuideItemMoveMutation, {input});
}

export async function removeGuideItem(id: string, version: number) {
    await runMutation(GuideItemRemoveMutation, {id, version});
}

export const GuideSuggestionFields = graphql(`
    fragment GuideSuggestionFields on GuideSuggestion {
        id
        kind
        status
        version
        mine
        author
        chapterKey
        chapterTitle { sv en }
        sectionKey
        itemKey
        reason
        decidedBy
        decidedAt
        decisionReason
        reopenedAt
        createdAt
        proposedType { ...GuideItemTypeFields }
        proposedText { sv en }
        revival { id title year }
        madeOn { id label }
        publishedIn { id label }
        item { chapter { key title { sv en } } sectionKey sectionTitle { sv en } type { ...GuideItemTypeFields } text { sv en } }
    }
`);

const GuideSuggestionsQuery = graphql(`
    query GuideSuggestions($status: [GuideSuggestionStatus!], $revivalId: ID) {
        guideSuggestions(status: $status, revivalId: $revivalId) { ...GuideSuggestionFields }
    }
`);

const GuideSuggestionCreateMutation = graphql(`
    mutation GuideSuggestionCreate($input: GuideSuggestionCreateInput!) {
        guideSuggestionCreate(input: $input) { id }
    }
`);

const GuideSuggestionAcceptMutation = graphql(`
    mutation GuideSuggestionAccept($input: GuideSuggestionAcceptInput!) {
        guideSuggestionAccept(input: $input) { id status }
    }
`);

const GuideSuggestionRejectMutation = graphql(`
    mutation GuideSuggestionReject($input: GuideSuggestionRejectInput!) {
        guideSuggestionReject(input: $input) { id status }
    }
`);

const GuideSuggestionWithdrawMutation = graphql(`
    mutation GuideSuggestionWithdraw($id: ID!, $version: Int!) {
        guideSuggestionWithdraw(id: $id, version: $version) { id status }
    }
`);

export async function getGuideSuggestions(status: GuideSuggestionStatus[] | null, revivalId: string | null) {
    return (await runQuery(GuideSuggestionsQuery, {status, revivalId}))?.guideSuggestions ?? [];
}

export async function createGuideSuggestion(input: GuideSuggestionCreateInput) {
    await runMutation(GuideSuggestionCreateMutation, {input});
}

export async function acceptGuideSuggestion(input: GuideSuggestionAcceptInput) {
    await runMutation(GuideSuggestionAcceptMutation, {input});
}

export async function rejectGuideSuggestion(input: GuideSuggestionRejectInput) {
    await runMutation(GuideSuggestionRejectMutation, {input});
}

export async function withdrawGuideSuggestion(id: string, version: number) {
    await runMutation(GuideSuggestionWithdrawMutation, {id, version});
}
