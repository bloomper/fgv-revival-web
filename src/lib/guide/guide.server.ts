import "server-only";

import {graphql} from "@/gql";
import type {
    GuideChapterInput,
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
import {apiFetch} from "@/lib/api.server";
import {type ErrorCode, GraphQLRequestError, runMutation, runQuery} from "@/lib/graphql.server";

const GuideVersionsQuery = graphql(`
    query GuideVersions {
        guideVersions { id label publishedAt }
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
            guideVersionHistory { from { id label } to { id label } changedBy changedAt }
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
            chapters { phase renamed before { sv en } after { sv en } }
            sections { key kind phaseBefore phaseAfter renamed moved reordered before { sv en } after { sv en } }
            items {
                key
                kind
                reworded
                retyped
                moved
                before { phase sectionKey sectionTitle { sv en } type text { sv en } }
                after { phase sectionKey sectionTitle { sv en } type text { sv en } }
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
            phase
            chapterTitle { sv en }
            sectionKey
            sectionTitle { sv en }
            itemKey
            itemType
            snippet
            matchedLanguage
        }
    }
`);

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
            importReport {
                fileName
                createdAt
                totals { sections tips requirements questions texts }
                chapters { phase counts { sections tips requirements questions texts } }
                warnings { code phase sectionTitle detail }
            }
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

export async function getGuideDraft() {
    return (await runQuery(GuideDraftQuery, {}))?.guideDraft ?? null;
}

export async function publishGuideDraft(input: GuideDraftPublishInput) {
    return (await runMutation(PublishMutation, {input}))?.guideDraftPublish;
}

export async function discardGuideDraft(id: string, version: number) {
    await runMutation(DiscardMutation, {id, version});
}

const HTTP_CODES: Record<number, ErrorCode> = {400: "BAD_REQUEST", 401: "UNAUTHORIZED", 403: "FORBIDDEN", 404: "NOT_FOUND", 409: "CONFLICT", 413: "BAD_REQUEST"};

/**
 * Uploads a Word document as the first draft (contracts/http.md). Errors come back as GraphQL's do.
 */
export async function importGuide(file: File): Promise<{ draftId: number }> {
    const body = new FormData();

    body.append("file", file, file.name);

    const response = await apiFetch("/api/guide/import", {method: "POST", body});
    const json = await response.json().catch(() => ({})) as { draftId?: number, code?: string, message?: string };

    if (!response.ok) {
        const code = (json.code as ErrorCode | undefined) ?? HTTP_CODES[response.status] ?? "INTERNAL_ERROR";

        throw new GraphQLRequestError(code, json.message ?? response.statusText);
    }
    return {draftId: json.draftId ?? 0};
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

export async function updateGuideChapter(input: GuideChapterInput) {
    await runMutation(GuideChapterUpdateMutation, {input});
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
        phase
        sectionKey
        itemKey
        reason
        decidedBy
        decidedAt
        decisionReason
        reopenedAt
        createdAt
        proposedType
        proposedText { sv en }
        revival { id title year }
        madeOn { id label }
        publishedIn { id label }
        item { phase sectionKey sectionTitle { sv en } type text { sv en } }
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
