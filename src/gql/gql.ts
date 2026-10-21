/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n    fragment GuideItemFields on GuideItem {\n        id\n        key\n        type\n        text { sv en }\n        version\n    }\n": typeof types.GuideItemFieldsFragmentDoc,
    "\n    fragment GuideVersionFields on GuideVersion {\n        id\n        status\n        label\n        note\n        publishedAt\n        publishedBy\n        version\n        basedOn { id label publishedAt }\n        introduction { sv en }\n        chapters {\n            id\n            phase\n            title { sv en }\n            version\n            items { ...GuideItemFields }\n            sections {\n                id\n                key\n                title { sv en }\n                version\n                items { ...GuideItemFields }\n            }\n        }\n    }\n": typeof types.GuideVersionFieldsFragmentDoc,
    "\n    query GuideVersions {\n        guideVersions { id label publishedAt }\n    }\n": typeof types.GuideVersionsDocument,
    "\n    query GuideLatestVersion {\n        guideLatestVersion { ...GuideVersionFields }\n    }\n": typeof types.GuideLatestVersionDocument,
    "\n    query GuideVersion($id: ID!) {\n        guideVersion(id: $id) { ...GuideVersionFields }\n    }\n": typeof types.GuideVersionDocument,
    "\n    query RevivalGuide($id: ID!) {\n        revival(id: $id) {\n            id\n            workingTitle\n            year\n            status\n            guideVersion { id label publishedAt }\n            newerGuideVersion { id label publishedAt }\n            guideVersionHistory { from { id label } to { id label } changedBy changedAt }\n            permissions { canSuggestGuideChange guideVersionsAllowed { id label publishedAt } }\n        }\n    }\n": typeof types.RevivalGuideDocument,
    "\n    query GuideChanges($fromId: ID!, $toId: ID!) {\n        guideChanges(fromId: $fromId, toId: $toId) {\n            from { id label publishedAt }\n            to { id label publishedAt }\n            introductionChanged\n            chapters { phase renamed before { sv en } after { sv en } }\n            sections { key kind phaseBefore phaseAfter renamed moved reordered before { sv en } after { sv en } }\n            items {\n                key\n                kind\n                reworded\n                retyped\n                moved\n                before { phase sectionKey sectionTitle { sv en } type text { sv en } }\n                after { phase sectionKey sectionTitle { sv en } type text { sv en } }\n            }\n        }\n    }\n": typeof types.GuideChangesDocument,
    "\n    mutation RevivalGuideVersionChange($input: RevivalGuideVersionChangeInput!) {\n        revivalGuideVersionChange(input: $input) { id guideVersion { id label } }\n    }\n": typeof types.RevivalGuideVersionChangeDocument,
    "\n    mutation GuideDraftStart {\n        guideDraftStart { draft { id } }\n    }\n": typeof types.GuideDraftStartDocument,
    "\n    mutation GuideIntroductionUpdate($input: GuideIntroductionInput!) {\n        guideIntroductionUpdate(input: $input) { id version }\n    }\n": typeof types.GuideIntroductionUpdateDocument,
    "\n    mutation GuideChapterUpdate($input: GuideChapterInput!) {\n        guideChapterUpdate(input: $input) { id version }\n    }\n": typeof types.GuideChapterUpdateDocument,
    "\n    mutation GuideSectionCreate($input: GuideSectionCreateInput!) {\n        guideSectionCreate(input: $input) { id key }\n    }\n": typeof types.GuideSectionCreateDocument,
    "\n    mutation GuideSectionUpdate($input: GuideSectionUpdateInput!) {\n        guideSectionUpdate(input: $input) { id version }\n    }\n": typeof types.GuideSectionUpdateDocument,
    "\n    mutation GuideSectionMove($input: GuideSectionMoveInput!) {\n        guideSectionMove(input: $input) { id }\n    }\n": typeof types.GuideSectionMoveDocument,
    "\n    mutation GuideSectionRemove($id: ID!, $version: Int!) {\n        guideSectionRemove(id: $id, version: $version)\n    }\n": typeof types.GuideSectionRemoveDocument,
    "\n    mutation GuideItemCreate($input: GuideItemCreateInput!) {\n        guideItemCreate(input: $input) { id key }\n    }\n": typeof types.GuideItemCreateDocument,
    "\n    mutation GuideItemUpdate($input: GuideItemUpdateInput!) {\n        guideItemUpdate(input: $input) { id version }\n    }\n": typeof types.GuideItemUpdateDocument,
    "\n    mutation GuideItemMove($input: GuideItemMoveInput!) {\n        guideItemMove(input: $input) { id }\n    }\n": typeof types.GuideItemMoveDocument,
    "\n    mutation GuideItemRemove($id: ID!, $version: Int!) {\n        guideItemRemove(id: $id, version: $version)\n    }\n": typeof types.GuideItemRemoveDocument,
    "\n    query GuideSearch($versionId: ID, $query: String!) {\n        guideSearch(versionId: $versionId, query: $query) {\n            kind\n            phase\n            chapterTitle { sv en }\n            sectionKey\n            sectionTitle { sv en }\n            itemKey\n            itemType\n            snippet\n            matchedLanguage\n        }\n    }\n": typeof types.GuideSearchDocument,
    "\n    query GuideDraft {\n        guideDraft {\n            draft { ...GuideVersionFields }\n            importReport {\n                fileName\n                createdAt\n                totals { sections tips requirements questions texts }\n                chapters { phase counts { sections tips requirements questions texts } }\n                warnings { code phase sectionTitle detail }\n            }\n            acceptedSuggestionCount\n            untranslatedCount\n        }\n    }\n": typeof types.GuideDraftDocument,
    "\n    mutation GuideDraftPublish($input: GuideDraftPublishInput!) {\n        guideDraftPublish(input: $input) { id label }\n    }\n": typeof types.GuideDraftPublishDocument,
    "\n    mutation GuideDraftDiscard($id: ID!, $version: Int!) {\n        guideDraftDiscard(id: $id, version: $version)\n    }\n": typeof types.GuideDraftDiscardDocument,
    "\n    fragment GuideSuggestionFields on GuideSuggestion {\n        id\n        kind\n        status\n        version\n        mine\n        author\n        phase\n        sectionKey\n        itemKey\n        reason\n        decidedBy\n        decidedAt\n        decisionReason\n        reopenedAt\n        createdAt\n        proposedType\n        proposedText { sv en }\n        revival { id workingTitle year }\n        madeOn { id label }\n        publishedIn { id label }\n        item { phase sectionKey sectionTitle { sv en } type text { sv en } }\n    }\n": typeof types.GuideSuggestionFieldsFragmentDoc,
    "\n    query GuideSuggestions($status: [GuideSuggestionStatus!], $revivalId: ID) {\n        guideSuggestions(status: $status, revivalId: $revivalId) { ...GuideSuggestionFields }\n    }\n": typeof types.GuideSuggestionsDocument,
    "\n    mutation GuideSuggestionCreate($input: GuideSuggestionCreateInput!) {\n        guideSuggestionCreate(input: $input) { id }\n    }\n": typeof types.GuideSuggestionCreateDocument,
    "\n    mutation GuideSuggestionAccept($input: GuideSuggestionAcceptInput!) {\n        guideSuggestionAccept(input: $input) { id status }\n    }\n": typeof types.GuideSuggestionAcceptDocument,
    "\n    mutation GuideSuggestionReject($input: GuideSuggestionRejectInput!) {\n        guideSuggestionReject(input: $input) { id status }\n    }\n": typeof types.GuideSuggestionRejectDocument,
    "\n    mutation GuideSuggestionWithdraw($id: ID!, $version: Int!) {\n        guideSuggestionWithdraw(id: $id, version: $version) { id status }\n    }\n": typeof types.GuideSuggestionWithdrawDocument,
    "\n    mutation RevivalMemberAdd($input: RevivalMemberAddInput!) {\n        revivalMemberAdd(input: $input) { id role capabilities state displayName email version }\n    }\n": typeof types.RevivalMemberAddDocument,
    "\n    mutation RevivalMemberCapabilitiesSet($input: RevivalMemberCapabilitiesInput!) {\n        revivalMemberCapabilitiesSet(input: $input) { id capabilities version }\n    }\n": typeof types.RevivalMemberCapabilitiesSetDocument,
    "\n    mutation RevivalMemberRemove($id: ID!) {\n        revivalMemberRemove(id: $id)\n    }\n": typeof types.RevivalMemberRemoveDocument,
    "\n    fragment RevivalSummary on Revival {\n        id\n        year\n        workingTitle\n        premiereDate\n        status\n        spex { id title available }\n        members { id role state displayName email }\n        permissions { canEditCore canEditDetails allowedStatuses canManageDirecteurs canManageSteeringGroup }\n    }\n": typeof types.RevivalSummaryFragmentDoc,
    "\n    fragment RevivalDetail on Revival {\n        ...RevivalSummary\n        showDates\n        venues\n        version\n        createdBy\n        createdAt\n        lastModifiedBy\n        lastModifiedAt\n        members { id role capabilities state displayName email version }\n        statusHistory { from to changedBy changedAt }\n        guideVersion { id label }\n    }\n": typeof types.RevivalDetailFragmentDoc,
    "\n    query Me {\n        me {\n            id\n            displayName\n            email\n            globalRoles\n            revivalRoles { role capabilities revival { id } }\n        }\n    }\n": typeof types.MeDocument,
    "\n    query Revivals($status: [RevivalStatus!]) {\n        revivals(status: $status) { ...RevivalSummary }\n    }\n": typeof types.RevivalsDocument,
    "\n    query Revival($id: ID!) {\n        revival(id: $id) { ...RevivalDetail }\n    }\n": typeof types.RevivalDocument,
    "\n    mutation RevivalCreate($input: RevivalCreateInput!) {\n        revivalCreate(input: $input) { ...RevivalSummary }\n    }\n": typeof types.RevivalCreateDocument,
    "\n    mutation RevivalUpdate($input: RevivalUpdateInput!) {\n        revivalUpdate(input: $input) { ...RevivalDetail }\n    }\n": typeof types.RevivalUpdateDocument,
    "\n    mutation RevivalStatusChange($input: RevivalStatusChangeInput!) {\n        revivalStatusChange(input: $input) { ...RevivalSummary }\n    }\n": typeof types.RevivalStatusChangeDocument,
    "\n    query SpexSearch($query: String!, $first: Int) {\n        spexSearch(query: $query, first: $first) { id title year available }\n    }\n": typeof types.SpexSearchDocument,
};
const documents: Documents = {
    "\n    fragment GuideItemFields on GuideItem {\n        id\n        key\n        type\n        text { sv en }\n        version\n    }\n": types.GuideItemFieldsFragmentDoc,
    "\n    fragment GuideVersionFields on GuideVersion {\n        id\n        status\n        label\n        note\n        publishedAt\n        publishedBy\n        version\n        basedOn { id label publishedAt }\n        introduction { sv en }\n        chapters {\n            id\n            phase\n            title { sv en }\n            version\n            items { ...GuideItemFields }\n            sections {\n                id\n                key\n                title { sv en }\n                version\n                items { ...GuideItemFields }\n            }\n        }\n    }\n": types.GuideVersionFieldsFragmentDoc,
    "\n    query GuideVersions {\n        guideVersions { id label publishedAt }\n    }\n": types.GuideVersionsDocument,
    "\n    query GuideLatestVersion {\n        guideLatestVersion { ...GuideVersionFields }\n    }\n": types.GuideLatestVersionDocument,
    "\n    query GuideVersion($id: ID!) {\n        guideVersion(id: $id) { ...GuideVersionFields }\n    }\n": types.GuideVersionDocument,
    "\n    query RevivalGuide($id: ID!) {\n        revival(id: $id) {\n            id\n            workingTitle\n            year\n            status\n            guideVersion { id label publishedAt }\n            newerGuideVersion { id label publishedAt }\n            guideVersionHistory { from { id label } to { id label } changedBy changedAt }\n            permissions { canSuggestGuideChange guideVersionsAllowed { id label publishedAt } }\n        }\n    }\n": types.RevivalGuideDocument,
    "\n    query GuideChanges($fromId: ID!, $toId: ID!) {\n        guideChanges(fromId: $fromId, toId: $toId) {\n            from { id label publishedAt }\n            to { id label publishedAt }\n            introductionChanged\n            chapters { phase renamed before { sv en } after { sv en } }\n            sections { key kind phaseBefore phaseAfter renamed moved reordered before { sv en } after { sv en } }\n            items {\n                key\n                kind\n                reworded\n                retyped\n                moved\n                before { phase sectionKey sectionTitle { sv en } type text { sv en } }\n                after { phase sectionKey sectionTitle { sv en } type text { sv en } }\n            }\n        }\n    }\n": types.GuideChangesDocument,
    "\n    mutation RevivalGuideVersionChange($input: RevivalGuideVersionChangeInput!) {\n        revivalGuideVersionChange(input: $input) { id guideVersion { id label } }\n    }\n": types.RevivalGuideVersionChangeDocument,
    "\n    mutation GuideDraftStart {\n        guideDraftStart { draft { id } }\n    }\n": types.GuideDraftStartDocument,
    "\n    mutation GuideIntroductionUpdate($input: GuideIntroductionInput!) {\n        guideIntroductionUpdate(input: $input) { id version }\n    }\n": types.GuideIntroductionUpdateDocument,
    "\n    mutation GuideChapterUpdate($input: GuideChapterInput!) {\n        guideChapterUpdate(input: $input) { id version }\n    }\n": types.GuideChapterUpdateDocument,
    "\n    mutation GuideSectionCreate($input: GuideSectionCreateInput!) {\n        guideSectionCreate(input: $input) { id key }\n    }\n": types.GuideSectionCreateDocument,
    "\n    mutation GuideSectionUpdate($input: GuideSectionUpdateInput!) {\n        guideSectionUpdate(input: $input) { id version }\n    }\n": types.GuideSectionUpdateDocument,
    "\n    mutation GuideSectionMove($input: GuideSectionMoveInput!) {\n        guideSectionMove(input: $input) { id }\n    }\n": types.GuideSectionMoveDocument,
    "\n    mutation GuideSectionRemove($id: ID!, $version: Int!) {\n        guideSectionRemove(id: $id, version: $version)\n    }\n": types.GuideSectionRemoveDocument,
    "\n    mutation GuideItemCreate($input: GuideItemCreateInput!) {\n        guideItemCreate(input: $input) { id key }\n    }\n": types.GuideItemCreateDocument,
    "\n    mutation GuideItemUpdate($input: GuideItemUpdateInput!) {\n        guideItemUpdate(input: $input) { id version }\n    }\n": types.GuideItemUpdateDocument,
    "\n    mutation GuideItemMove($input: GuideItemMoveInput!) {\n        guideItemMove(input: $input) { id }\n    }\n": types.GuideItemMoveDocument,
    "\n    mutation GuideItemRemove($id: ID!, $version: Int!) {\n        guideItemRemove(id: $id, version: $version)\n    }\n": types.GuideItemRemoveDocument,
    "\n    query GuideSearch($versionId: ID, $query: String!) {\n        guideSearch(versionId: $versionId, query: $query) {\n            kind\n            phase\n            chapterTitle { sv en }\n            sectionKey\n            sectionTitle { sv en }\n            itemKey\n            itemType\n            snippet\n            matchedLanguage\n        }\n    }\n": types.GuideSearchDocument,
    "\n    query GuideDraft {\n        guideDraft {\n            draft { ...GuideVersionFields }\n            importReport {\n                fileName\n                createdAt\n                totals { sections tips requirements questions texts }\n                chapters { phase counts { sections tips requirements questions texts } }\n                warnings { code phase sectionTitle detail }\n            }\n            acceptedSuggestionCount\n            untranslatedCount\n        }\n    }\n": types.GuideDraftDocument,
    "\n    mutation GuideDraftPublish($input: GuideDraftPublishInput!) {\n        guideDraftPublish(input: $input) { id label }\n    }\n": types.GuideDraftPublishDocument,
    "\n    mutation GuideDraftDiscard($id: ID!, $version: Int!) {\n        guideDraftDiscard(id: $id, version: $version)\n    }\n": types.GuideDraftDiscardDocument,
    "\n    fragment GuideSuggestionFields on GuideSuggestion {\n        id\n        kind\n        status\n        version\n        mine\n        author\n        phase\n        sectionKey\n        itemKey\n        reason\n        decidedBy\n        decidedAt\n        decisionReason\n        reopenedAt\n        createdAt\n        proposedType\n        proposedText { sv en }\n        revival { id workingTitle year }\n        madeOn { id label }\n        publishedIn { id label }\n        item { phase sectionKey sectionTitle { sv en } type text { sv en } }\n    }\n": types.GuideSuggestionFieldsFragmentDoc,
    "\n    query GuideSuggestions($status: [GuideSuggestionStatus!], $revivalId: ID) {\n        guideSuggestions(status: $status, revivalId: $revivalId) { ...GuideSuggestionFields }\n    }\n": types.GuideSuggestionsDocument,
    "\n    mutation GuideSuggestionCreate($input: GuideSuggestionCreateInput!) {\n        guideSuggestionCreate(input: $input) { id }\n    }\n": types.GuideSuggestionCreateDocument,
    "\n    mutation GuideSuggestionAccept($input: GuideSuggestionAcceptInput!) {\n        guideSuggestionAccept(input: $input) { id status }\n    }\n": types.GuideSuggestionAcceptDocument,
    "\n    mutation GuideSuggestionReject($input: GuideSuggestionRejectInput!) {\n        guideSuggestionReject(input: $input) { id status }\n    }\n": types.GuideSuggestionRejectDocument,
    "\n    mutation GuideSuggestionWithdraw($id: ID!, $version: Int!) {\n        guideSuggestionWithdraw(id: $id, version: $version) { id status }\n    }\n": types.GuideSuggestionWithdrawDocument,
    "\n    mutation RevivalMemberAdd($input: RevivalMemberAddInput!) {\n        revivalMemberAdd(input: $input) { id role capabilities state displayName email version }\n    }\n": types.RevivalMemberAddDocument,
    "\n    mutation RevivalMemberCapabilitiesSet($input: RevivalMemberCapabilitiesInput!) {\n        revivalMemberCapabilitiesSet(input: $input) { id capabilities version }\n    }\n": types.RevivalMemberCapabilitiesSetDocument,
    "\n    mutation RevivalMemberRemove($id: ID!) {\n        revivalMemberRemove(id: $id)\n    }\n": types.RevivalMemberRemoveDocument,
    "\n    fragment RevivalSummary on Revival {\n        id\n        year\n        workingTitle\n        premiereDate\n        status\n        spex { id title available }\n        members { id role state displayName email }\n        permissions { canEditCore canEditDetails allowedStatuses canManageDirecteurs canManageSteeringGroup }\n    }\n": types.RevivalSummaryFragmentDoc,
    "\n    fragment RevivalDetail on Revival {\n        ...RevivalSummary\n        showDates\n        venues\n        version\n        createdBy\n        createdAt\n        lastModifiedBy\n        lastModifiedAt\n        members { id role capabilities state displayName email version }\n        statusHistory { from to changedBy changedAt }\n        guideVersion { id label }\n    }\n": types.RevivalDetailFragmentDoc,
    "\n    query Me {\n        me {\n            id\n            displayName\n            email\n            globalRoles\n            revivalRoles { role capabilities revival { id } }\n        }\n    }\n": types.MeDocument,
    "\n    query Revivals($status: [RevivalStatus!]) {\n        revivals(status: $status) { ...RevivalSummary }\n    }\n": types.RevivalsDocument,
    "\n    query Revival($id: ID!) {\n        revival(id: $id) { ...RevivalDetail }\n    }\n": types.RevivalDocument,
    "\n    mutation RevivalCreate($input: RevivalCreateInput!) {\n        revivalCreate(input: $input) { ...RevivalSummary }\n    }\n": types.RevivalCreateDocument,
    "\n    mutation RevivalUpdate($input: RevivalUpdateInput!) {\n        revivalUpdate(input: $input) { ...RevivalDetail }\n    }\n": types.RevivalUpdateDocument,
    "\n    mutation RevivalStatusChange($input: RevivalStatusChangeInput!) {\n        revivalStatusChange(input: $input) { ...RevivalSummary }\n    }\n": types.RevivalStatusChangeDocument,
    "\n    query SpexSearch($query: String!, $first: Int) {\n        spexSearch(query: $query, first: $first) { id title year available }\n    }\n": types.SpexSearchDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment GuideItemFields on GuideItem {\n        id\n        key\n        type\n        text { sv en }\n        version\n    }\n"): (typeof documents)["\n    fragment GuideItemFields on GuideItem {\n        id\n        key\n        type\n        text { sv en }\n        version\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment GuideVersionFields on GuideVersion {\n        id\n        status\n        label\n        note\n        publishedAt\n        publishedBy\n        version\n        basedOn { id label publishedAt }\n        introduction { sv en }\n        chapters {\n            id\n            phase\n            title { sv en }\n            version\n            items { ...GuideItemFields }\n            sections {\n                id\n                key\n                title { sv en }\n                version\n                items { ...GuideItemFields }\n            }\n        }\n    }\n"): (typeof documents)["\n    fragment GuideVersionFields on GuideVersion {\n        id\n        status\n        label\n        note\n        publishedAt\n        publishedBy\n        version\n        basedOn { id label publishedAt }\n        introduction { sv en }\n        chapters {\n            id\n            phase\n            title { sv en }\n            version\n            items { ...GuideItemFields }\n            sections {\n                id\n                key\n                title { sv en }\n                version\n                items { ...GuideItemFields }\n            }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GuideVersions {\n        guideVersions { id label publishedAt }\n    }\n"): (typeof documents)["\n    query GuideVersions {\n        guideVersions { id label publishedAt }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GuideLatestVersion {\n        guideLatestVersion { ...GuideVersionFields }\n    }\n"): (typeof documents)["\n    query GuideLatestVersion {\n        guideLatestVersion { ...GuideVersionFields }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GuideVersion($id: ID!) {\n        guideVersion(id: $id) { ...GuideVersionFields }\n    }\n"): (typeof documents)["\n    query GuideVersion($id: ID!) {\n        guideVersion(id: $id) { ...GuideVersionFields }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query RevivalGuide($id: ID!) {\n        revival(id: $id) {\n            id\n            workingTitle\n            year\n            status\n            guideVersion { id label publishedAt }\n            newerGuideVersion { id label publishedAt }\n            guideVersionHistory { from { id label } to { id label } changedBy changedAt }\n            permissions { canSuggestGuideChange guideVersionsAllowed { id label publishedAt } }\n        }\n    }\n"): (typeof documents)["\n    query RevivalGuide($id: ID!) {\n        revival(id: $id) {\n            id\n            workingTitle\n            year\n            status\n            guideVersion { id label publishedAt }\n            newerGuideVersion { id label publishedAt }\n            guideVersionHistory { from { id label } to { id label } changedBy changedAt }\n            permissions { canSuggestGuideChange guideVersionsAllowed { id label publishedAt } }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GuideChanges($fromId: ID!, $toId: ID!) {\n        guideChanges(fromId: $fromId, toId: $toId) {\n            from { id label publishedAt }\n            to { id label publishedAt }\n            introductionChanged\n            chapters { phase renamed before { sv en } after { sv en } }\n            sections { key kind phaseBefore phaseAfter renamed moved reordered before { sv en } after { sv en } }\n            items {\n                key\n                kind\n                reworded\n                retyped\n                moved\n                before { phase sectionKey sectionTitle { sv en } type text { sv en } }\n                after { phase sectionKey sectionTitle { sv en } type text { sv en } }\n            }\n        }\n    }\n"): (typeof documents)["\n    query GuideChanges($fromId: ID!, $toId: ID!) {\n        guideChanges(fromId: $fromId, toId: $toId) {\n            from { id label publishedAt }\n            to { id label publishedAt }\n            introductionChanged\n            chapters { phase renamed before { sv en } after { sv en } }\n            sections { key kind phaseBefore phaseAfter renamed moved reordered before { sv en } after { sv en } }\n            items {\n                key\n                kind\n                reworded\n                retyped\n                moved\n                before { phase sectionKey sectionTitle { sv en } type text { sv en } }\n                after { phase sectionKey sectionTitle { sv en } type text { sv en } }\n            }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation RevivalGuideVersionChange($input: RevivalGuideVersionChangeInput!) {\n        revivalGuideVersionChange(input: $input) { id guideVersion { id label } }\n    }\n"): (typeof documents)["\n    mutation RevivalGuideVersionChange($input: RevivalGuideVersionChangeInput!) {\n        revivalGuideVersionChange(input: $input) { id guideVersion { id label } }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation GuideDraftStart {\n        guideDraftStart { draft { id } }\n    }\n"): (typeof documents)["\n    mutation GuideDraftStart {\n        guideDraftStart { draft { id } }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation GuideIntroductionUpdate($input: GuideIntroductionInput!) {\n        guideIntroductionUpdate(input: $input) { id version }\n    }\n"): (typeof documents)["\n    mutation GuideIntroductionUpdate($input: GuideIntroductionInput!) {\n        guideIntroductionUpdate(input: $input) { id version }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation GuideChapterUpdate($input: GuideChapterInput!) {\n        guideChapterUpdate(input: $input) { id version }\n    }\n"): (typeof documents)["\n    mutation GuideChapterUpdate($input: GuideChapterInput!) {\n        guideChapterUpdate(input: $input) { id version }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation GuideSectionCreate($input: GuideSectionCreateInput!) {\n        guideSectionCreate(input: $input) { id key }\n    }\n"): (typeof documents)["\n    mutation GuideSectionCreate($input: GuideSectionCreateInput!) {\n        guideSectionCreate(input: $input) { id key }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation GuideSectionUpdate($input: GuideSectionUpdateInput!) {\n        guideSectionUpdate(input: $input) { id version }\n    }\n"): (typeof documents)["\n    mutation GuideSectionUpdate($input: GuideSectionUpdateInput!) {\n        guideSectionUpdate(input: $input) { id version }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation GuideSectionMove($input: GuideSectionMoveInput!) {\n        guideSectionMove(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation GuideSectionMove($input: GuideSectionMoveInput!) {\n        guideSectionMove(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation GuideSectionRemove($id: ID!, $version: Int!) {\n        guideSectionRemove(id: $id, version: $version)\n    }\n"): (typeof documents)["\n    mutation GuideSectionRemove($id: ID!, $version: Int!) {\n        guideSectionRemove(id: $id, version: $version)\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation GuideItemCreate($input: GuideItemCreateInput!) {\n        guideItemCreate(input: $input) { id key }\n    }\n"): (typeof documents)["\n    mutation GuideItemCreate($input: GuideItemCreateInput!) {\n        guideItemCreate(input: $input) { id key }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation GuideItemUpdate($input: GuideItemUpdateInput!) {\n        guideItemUpdate(input: $input) { id version }\n    }\n"): (typeof documents)["\n    mutation GuideItemUpdate($input: GuideItemUpdateInput!) {\n        guideItemUpdate(input: $input) { id version }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation GuideItemMove($input: GuideItemMoveInput!) {\n        guideItemMove(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation GuideItemMove($input: GuideItemMoveInput!) {\n        guideItemMove(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation GuideItemRemove($id: ID!, $version: Int!) {\n        guideItemRemove(id: $id, version: $version)\n    }\n"): (typeof documents)["\n    mutation GuideItemRemove($id: ID!, $version: Int!) {\n        guideItemRemove(id: $id, version: $version)\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GuideSearch($versionId: ID, $query: String!) {\n        guideSearch(versionId: $versionId, query: $query) {\n            kind\n            phase\n            chapterTitle { sv en }\n            sectionKey\n            sectionTitle { sv en }\n            itemKey\n            itemType\n            snippet\n            matchedLanguage\n        }\n    }\n"): (typeof documents)["\n    query GuideSearch($versionId: ID, $query: String!) {\n        guideSearch(versionId: $versionId, query: $query) {\n            kind\n            phase\n            chapterTitle { sv en }\n            sectionKey\n            sectionTitle { sv en }\n            itemKey\n            itemType\n            snippet\n            matchedLanguage\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GuideDraft {\n        guideDraft {\n            draft { ...GuideVersionFields }\n            importReport {\n                fileName\n                createdAt\n                totals { sections tips requirements questions texts }\n                chapters { phase counts { sections tips requirements questions texts } }\n                warnings { code phase sectionTitle detail }\n            }\n            acceptedSuggestionCount\n            untranslatedCount\n        }\n    }\n"): (typeof documents)["\n    query GuideDraft {\n        guideDraft {\n            draft { ...GuideVersionFields }\n            importReport {\n                fileName\n                createdAt\n                totals { sections tips requirements questions texts }\n                chapters { phase counts { sections tips requirements questions texts } }\n                warnings { code phase sectionTitle detail }\n            }\n            acceptedSuggestionCount\n            untranslatedCount\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation GuideDraftPublish($input: GuideDraftPublishInput!) {\n        guideDraftPublish(input: $input) { id label }\n    }\n"): (typeof documents)["\n    mutation GuideDraftPublish($input: GuideDraftPublishInput!) {\n        guideDraftPublish(input: $input) { id label }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation GuideDraftDiscard($id: ID!, $version: Int!) {\n        guideDraftDiscard(id: $id, version: $version)\n    }\n"): (typeof documents)["\n    mutation GuideDraftDiscard($id: ID!, $version: Int!) {\n        guideDraftDiscard(id: $id, version: $version)\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment GuideSuggestionFields on GuideSuggestion {\n        id\n        kind\n        status\n        version\n        mine\n        author\n        phase\n        sectionKey\n        itemKey\n        reason\n        decidedBy\n        decidedAt\n        decisionReason\n        reopenedAt\n        createdAt\n        proposedType\n        proposedText { sv en }\n        revival { id workingTitle year }\n        madeOn { id label }\n        publishedIn { id label }\n        item { phase sectionKey sectionTitle { sv en } type text { sv en } }\n    }\n"): (typeof documents)["\n    fragment GuideSuggestionFields on GuideSuggestion {\n        id\n        kind\n        status\n        version\n        mine\n        author\n        phase\n        sectionKey\n        itemKey\n        reason\n        decidedBy\n        decidedAt\n        decisionReason\n        reopenedAt\n        createdAt\n        proposedType\n        proposedText { sv en }\n        revival { id workingTitle year }\n        madeOn { id label }\n        publishedIn { id label }\n        item { phase sectionKey sectionTitle { sv en } type text { sv en } }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GuideSuggestions($status: [GuideSuggestionStatus!], $revivalId: ID) {\n        guideSuggestions(status: $status, revivalId: $revivalId) { ...GuideSuggestionFields }\n    }\n"): (typeof documents)["\n    query GuideSuggestions($status: [GuideSuggestionStatus!], $revivalId: ID) {\n        guideSuggestions(status: $status, revivalId: $revivalId) { ...GuideSuggestionFields }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation GuideSuggestionCreate($input: GuideSuggestionCreateInput!) {\n        guideSuggestionCreate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation GuideSuggestionCreate($input: GuideSuggestionCreateInput!) {\n        guideSuggestionCreate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation GuideSuggestionAccept($input: GuideSuggestionAcceptInput!) {\n        guideSuggestionAccept(input: $input) { id status }\n    }\n"): (typeof documents)["\n    mutation GuideSuggestionAccept($input: GuideSuggestionAcceptInput!) {\n        guideSuggestionAccept(input: $input) { id status }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation GuideSuggestionReject($input: GuideSuggestionRejectInput!) {\n        guideSuggestionReject(input: $input) { id status }\n    }\n"): (typeof documents)["\n    mutation GuideSuggestionReject($input: GuideSuggestionRejectInput!) {\n        guideSuggestionReject(input: $input) { id status }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation GuideSuggestionWithdraw($id: ID!, $version: Int!) {\n        guideSuggestionWithdraw(id: $id, version: $version) { id status }\n    }\n"): (typeof documents)["\n    mutation GuideSuggestionWithdraw($id: ID!, $version: Int!) {\n        guideSuggestionWithdraw(id: $id, version: $version) { id status }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation RevivalMemberAdd($input: RevivalMemberAddInput!) {\n        revivalMemberAdd(input: $input) { id role capabilities state displayName email version }\n    }\n"): (typeof documents)["\n    mutation RevivalMemberAdd($input: RevivalMemberAddInput!) {\n        revivalMemberAdd(input: $input) { id role capabilities state displayName email version }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation RevivalMemberCapabilitiesSet($input: RevivalMemberCapabilitiesInput!) {\n        revivalMemberCapabilitiesSet(input: $input) { id capabilities version }\n    }\n"): (typeof documents)["\n    mutation RevivalMemberCapabilitiesSet($input: RevivalMemberCapabilitiesInput!) {\n        revivalMemberCapabilitiesSet(input: $input) { id capabilities version }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation RevivalMemberRemove($id: ID!) {\n        revivalMemberRemove(id: $id)\n    }\n"): (typeof documents)["\n    mutation RevivalMemberRemove($id: ID!) {\n        revivalMemberRemove(id: $id)\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment RevivalSummary on Revival {\n        id\n        year\n        workingTitle\n        premiereDate\n        status\n        spex { id title available }\n        members { id role state displayName email }\n        permissions { canEditCore canEditDetails allowedStatuses canManageDirecteurs canManageSteeringGroup }\n    }\n"): (typeof documents)["\n    fragment RevivalSummary on Revival {\n        id\n        year\n        workingTitle\n        premiereDate\n        status\n        spex { id title available }\n        members { id role state displayName email }\n        permissions { canEditCore canEditDetails allowedStatuses canManageDirecteurs canManageSteeringGroup }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment RevivalDetail on Revival {\n        ...RevivalSummary\n        showDates\n        venues\n        version\n        createdBy\n        createdAt\n        lastModifiedBy\n        lastModifiedAt\n        members { id role capabilities state displayName email version }\n        statusHistory { from to changedBy changedAt }\n        guideVersion { id label }\n    }\n"): (typeof documents)["\n    fragment RevivalDetail on Revival {\n        ...RevivalSummary\n        showDates\n        venues\n        version\n        createdBy\n        createdAt\n        lastModifiedBy\n        lastModifiedAt\n        members { id role capabilities state displayName email version }\n        statusHistory { from to changedBy changedAt }\n        guideVersion { id label }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Me {\n        me {\n            id\n            displayName\n            email\n            globalRoles\n            revivalRoles { role capabilities revival { id } }\n        }\n    }\n"): (typeof documents)["\n    query Me {\n        me {\n            id\n            displayName\n            email\n            globalRoles\n            revivalRoles { role capabilities revival { id } }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Revivals($status: [RevivalStatus!]) {\n        revivals(status: $status) { ...RevivalSummary }\n    }\n"): (typeof documents)["\n    query Revivals($status: [RevivalStatus!]) {\n        revivals(status: $status) { ...RevivalSummary }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Revival($id: ID!) {\n        revival(id: $id) { ...RevivalDetail }\n    }\n"): (typeof documents)["\n    query Revival($id: ID!) {\n        revival(id: $id) { ...RevivalDetail }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation RevivalCreate($input: RevivalCreateInput!) {\n        revivalCreate(input: $input) { ...RevivalSummary }\n    }\n"): (typeof documents)["\n    mutation RevivalCreate($input: RevivalCreateInput!) {\n        revivalCreate(input: $input) { ...RevivalSummary }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation RevivalUpdate($input: RevivalUpdateInput!) {\n        revivalUpdate(input: $input) { ...RevivalDetail }\n    }\n"): (typeof documents)["\n    mutation RevivalUpdate($input: RevivalUpdateInput!) {\n        revivalUpdate(input: $input) { ...RevivalDetail }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation RevivalStatusChange($input: RevivalStatusChangeInput!) {\n        revivalStatusChange(input: $input) { ...RevivalSummary }\n    }\n"): (typeof documents)["\n    mutation RevivalStatusChange($input: RevivalStatusChangeInput!) {\n        revivalStatusChange(input: $input) { ...RevivalSummary }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query SpexSearch($query: String!, $first: Int) {\n        spexSearch(query: $query, first: $first) { id title year available }\n    }\n"): (typeof documents)["\n    query SpexSearch($query: String!, $first: Int) {\n        spexSearch(query: $query, first: $first) { id title year available }\n    }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;