/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Capability =
  | 'CATERING'
  | 'COMMS'
  | 'FINANCE'
  | 'STAFFING';

export type GlobalRole =
  | 'OBSERVER'
  | 'SUPER_ADMIN';

export type GuideChangeKind =
  | 'ADDED'
  | 'CHANGED'
  | 'REMOVED';

export type GuideChapterInput = {
  id: string | number;
  title: LocalizedTextInput;
  version: number;
};

export type GuideDraftPublishInput = {
  id: string | number;
  label: string;
  note?: string | null | undefined;
  version: number;
};

export type GuideImportWarningCode =
  | 'IMAGE'
  | 'TABLE'
  | 'UNKNOWN_LABEL';

export type GuideIntroductionInput = {
  introduction: LocalizedTextInput;
  version: number;
  versionId: string | number;
};

export type GuideItemCreateInput = {
  chapterId: string | number;
  /** Null appends. */
  position?: number | null | undefined;
  /** Null places it before the chapter's first section. */
  sectionId?: string | number | null | undefined;
  text: LocalizedTextInput;
  type: GuideItemType;
};

export type GuideItemMoveInput = {
  chapterId: string | number;
  id: string | number;
  position: number;
  sectionId?: string | number | null | undefined;
  version: number;
};

export type GuideItemType =
  | 'QUESTION'
  | 'REQUIREMENT'
  | 'TEXT'
  | 'TIP';

export type GuideItemUpdateInput = {
  id: string | number;
  text: LocalizedTextInput;
  type: GuideItemType;
  version: number;
};

export type GuideSearchHitKind =
  | 'CHAPTER_TITLE'
  | 'INTRODUCTION'
  | 'ITEM'
  | 'SECTION_TITLE';

export type GuideSectionCreateInput = {
  chapterId: string | number;
  /** Null appends. */
  position?: number | null | undefined;
  title: LocalizedTextInput;
};

export type GuideSectionMoveInput = {
  chapterId: string | number;
  id: string | number;
  position: number;
  version: number;
};

export type GuideSectionUpdateInput = {
  id: string | number;
  title: LocalizedTextInput;
  version: number;
};

export type GuideSuggestionAcceptInput = {
  id: string | number;
  note?: string | null | undefined;
  /** What the draft gets when its item differs from the suggestion's version. */
  resolution?: GuideSuggestionResolutionInput | null | undefined;
  version: number;
};

export type GuideSuggestionCreateInput = {
  /** CHANGE, REMOVE. */
  itemKey?: string | number | null | undefined;
  kind: GuideSuggestionKind;
  /** ADD. */
  phase?: Phase | null | undefined;
  proposedTextEn?: string | null | undefined;
  proposedTextSv?: string | null | undefined;
  proposedType?: GuideItemType | null | undefined;
  /** Required for CHANGE and REMOVE. */
  reason?: string | null | undefined;
  revivalId: string | number;
  /** ADD, optional. */
  sectionKey?: string | number | null | undefined;
  versionId: string | number;
};

export type GuideSuggestionKind =
  | 'ADD'
  | 'CHANGE'
  | 'REMOVE';

export type GuideSuggestionRejectInput = {
  id: string | number;
  reason?: string | null | undefined;
  version: number;
};

export type GuideSuggestionResolutionInput = {
  /** For REMOVE: keep the item instead of removing it. */
  keep?: boolean | null | undefined;
  text?: LocalizedTextInput | null | undefined;
  type?: GuideItemType | null | undefined;
};

export type GuideSuggestionStatus =
  | 'ACCEPTED'
  | 'OPEN'
  | 'REJECTED'
  | 'WITHDRAWN';

export type GuideVersionStatus =
  | 'DRAFT'
  | 'PUBLISHED';

export type LocalizedTextInput = {
  /** Empty or null clears the English text. */
  en?: string | null | undefined;
  sv: string;
};

export type MemberState =
  | 'ACTIVE'
  | 'WAITING';

/** The guide's chapters, which are the revival phases A–J (product spec section 4). */
export type Phase =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J';

export type RevivalCreateInput = {
  spexId: string | number;
  workingTitle: string;
  year: number;
};

export type RevivalGuideVersionChangeInput = {
  /** The version the caller saw; refused with CONFLICT if it has changed. */
  fromVersionId?: string | number | null | undefined;
  revivalId: string | number;
  toVersionId: string | number;
};

export type RevivalMemberAddInput = {
  capabilities?: Array<Capability> | null | undefined;
  email: string;
  revivalId: string | number;
  role: RevivalRole;
};

export type RevivalMemberCapabilitiesInput = {
  capabilities: Array<Capability>;
  id: string | number;
  version: number;
};

export type RevivalRole =
  | 'DIRECTEUR'
  | 'HELPER'
  | 'PARTICIPANT'
  | 'STEERING_GROUP';

export type RevivalStatus =
  | 'APPROVED'
  | 'ARCHIVED'
  | 'CLOSING'
  | 'OPEN'
  | 'ORGANISING'
  | 'PROPOSED'
  | 'REJECTED'
  | 'SETTLING';

export type RevivalStatusChangeInput = {
  /** The status the caller saw; refused with CONFLICT if it has changed. */
  from: RevivalStatus;
  id: string | number;
  to: RevivalStatus;
};

/** Omitted fields are left unchanged. Lists replace the whole list. */
export type RevivalUpdateInput = {
  clearPremiereDate?: boolean | null | undefined;
  id: string | number;
  premiereDate?: string | null | undefined;
  showDates?: Array<string> | null | undefined;
  spexId?: string | number | null | undefined;
  venues?: Array<string> | null | undefined;
  version: number;
  workingTitle?: string | null | undefined;
  year?: number | null | undefined;
};

export type GuideItemFieldsFragment = { id: string, key: string, type: GuideItemType, version: number, text: { sv: string, en: string | null } };

export type GuideVersionFieldsFragment = { id: string, status: GuideVersionStatus, label: string | null, note: string | null, publishedAt: string | null, publishedBy: string | null, version: number, basedOn: { id: string, label: string | null, publishedAt: string | null } | null, introduction: { sv: string, en: string | null }, chapters: Array<{ id: string, phase: Phase, version: number, title: { sv: string, en: string | null }, items: Array<{ id: string, key: string, type: GuideItemType, version: number, text: { sv: string, en: string | null } }>, sections: Array<{ id: string, key: string, version: number, title: { sv: string, en: string | null }, items: Array<{ id: string, key: string, type: GuideItemType, version: number, text: { sv: string, en: string | null } }> }> }> };

export type GuideVersionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GuideVersionsQuery = { guideVersions: Array<{ id: string, label: string | null, publishedAt: string | null }> };

export type GuideLatestVersionQueryVariables = Exact<{ [key: string]: never; }>;


export type GuideLatestVersionQuery = { guideLatestVersion: { id: string, status: GuideVersionStatus, label: string | null, note: string | null, publishedAt: string | null, publishedBy: string | null, version: number, basedOn: { id: string, label: string | null, publishedAt: string | null } | null, introduction: { sv: string, en: string | null }, chapters: Array<{ id: string, phase: Phase, version: number, title: { sv: string, en: string | null }, items: Array<{ id: string, key: string, type: GuideItemType, version: number, text: { sv: string, en: string | null } }>, sections: Array<{ id: string, key: string, version: number, title: { sv: string, en: string | null }, items: Array<{ id: string, key: string, type: GuideItemType, version: number, text: { sv: string, en: string | null } }> }> }> } | null };

export type GuideVersionQueryVariables = Exact<{
  id: string | number;
}>;


export type GuideVersionQuery = { guideVersion: { id: string, status: GuideVersionStatus, label: string | null, note: string | null, publishedAt: string | null, publishedBy: string | null, version: number, basedOn: { id: string, label: string | null, publishedAt: string | null } | null, introduction: { sv: string, en: string | null }, chapters: Array<{ id: string, phase: Phase, version: number, title: { sv: string, en: string | null }, items: Array<{ id: string, key: string, type: GuideItemType, version: number, text: { sv: string, en: string | null } }>, sections: Array<{ id: string, key: string, version: number, title: { sv: string, en: string | null }, items: Array<{ id: string, key: string, type: GuideItemType, version: number, text: { sv: string, en: string | null } }> }> }> } | null };

export type RevivalGuideQueryVariables = Exact<{
  id: string | number;
}>;


export type RevivalGuideQuery = { revival: { id: string, workingTitle: string, year: number, status: RevivalStatus, guideVersion: { id: string, label: string | null, publishedAt: string | null } | null, newerGuideVersion: { id: string, label: string | null, publishedAt: string | null } | null, guideVersionHistory: Array<{ changedBy: string | null, changedAt: string, from: { id: string, label: string | null } | null, to: { id: string, label: string | null } }>, permissions: { canSuggestGuideChange: boolean, guideVersionsAllowed: Array<{ id: string, label: string | null, publishedAt: string | null }> } } | null };

export type GuideChangesQueryVariables = Exact<{
  fromId: string | number;
  toId: string | number;
}>;


export type GuideChangesQuery = { guideChanges: { introductionChanged: Array<string>, from: { id: string, label: string | null, publishedAt: string | null }, to: { id: string, label: string | null, publishedAt: string | null }, chapters: Array<{ phase: Phase, renamed: Array<string>, before: { sv: string, en: string | null }, after: { sv: string, en: string | null } }>, sections: Array<{ key: string, kind: GuideChangeKind, phaseBefore: Phase | null, phaseAfter: Phase | null, renamed: Array<string>, moved: boolean, reordered: boolean, before: { sv: string, en: string | null } | null, after: { sv: string, en: string | null } | null }>, items: Array<{ key: string, kind: GuideChangeKind, reworded: Array<string>, retyped: boolean, moved: boolean, before: { phase: Phase, sectionKey: string | null, type: GuideItemType, sectionTitle: { sv: string, en: string | null } | null, text: { sv: string, en: string | null } } | null, after: { phase: Phase, sectionKey: string | null, type: GuideItemType, sectionTitle: { sv: string, en: string | null } | null, text: { sv: string, en: string | null } } | null }> } };

export type RevivalGuideVersionChangeMutationVariables = Exact<{
  input: RevivalGuideVersionChangeInput;
}>;


export type RevivalGuideVersionChangeMutation = { revivalGuideVersionChange: { id: string, guideVersion: { id: string, label: string | null } | null } };

export type GuideDraftStartMutationVariables = Exact<{ [key: string]: never; }>;


export type GuideDraftStartMutation = { guideDraftStart: { draft: { id: string } } };

export type GuideIntroductionUpdateMutationVariables = Exact<{
  input: GuideIntroductionInput;
}>;


export type GuideIntroductionUpdateMutation = { guideIntroductionUpdate: { id: string, version: number } };

export type GuideChapterUpdateMutationVariables = Exact<{
  input: GuideChapterInput;
}>;


export type GuideChapterUpdateMutation = { guideChapterUpdate: { id: string, version: number } };

export type GuideSectionCreateMutationVariables = Exact<{
  input: GuideSectionCreateInput;
}>;


export type GuideSectionCreateMutation = { guideSectionCreate: { id: string, key: string } };

export type GuideSectionUpdateMutationVariables = Exact<{
  input: GuideSectionUpdateInput;
}>;


export type GuideSectionUpdateMutation = { guideSectionUpdate: { id: string, version: number } };

export type GuideSectionMoveMutationVariables = Exact<{
  input: GuideSectionMoveInput;
}>;


export type GuideSectionMoveMutation = { guideSectionMove: { id: string } };

export type GuideSectionRemoveMutationVariables = Exact<{
  id: string | number;
  version: number;
}>;


export type GuideSectionRemoveMutation = { guideSectionRemove: null | null };

export type GuideItemCreateMutationVariables = Exact<{
  input: GuideItemCreateInput;
}>;


export type GuideItemCreateMutation = { guideItemCreate: { id: string, key: string } };

export type GuideItemUpdateMutationVariables = Exact<{
  input: GuideItemUpdateInput;
}>;


export type GuideItemUpdateMutation = { guideItemUpdate: { id: string, version: number } };

export type GuideItemMoveMutationVariables = Exact<{
  input: GuideItemMoveInput;
}>;


export type GuideItemMoveMutation = { guideItemMove: { id: string } };

export type GuideItemRemoveMutationVariables = Exact<{
  id: string | number;
  version: number;
}>;


export type GuideItemRemoveMutation = { guideItemRemove: null | null };

export type GuideSearchQueryVariables = Exact<{
  versionId?: string | number | null | undefined;
  query: string;
}>;


export type GuideSearchQuery = { guideSearch: Array<{ kind: GuideSearchHitKind, phase: Phase | null, sectionKey: string | null, itemKey: string | null, itemType: GuideItemType | null, snippet: string, matchedLanguage: string, chapterTitle: { sv: string, en: string | null } | null, sectionTitle: { sv: string, en: string | null } | null }> };

export type GuideDraftQueryVariables = Exact<{ [key: string]: never; }>;


export type GuideDraftQuery = { guideDraft: { acceptedSuggestionCount: number, untranslatedCount: number, draft: { id: string, status: GuideVersionStatus, label: string | null, note: string | null, publishedAt: string | null, publishedBy: string | null, version: number, basedOn: { id: string, label: string | null, publishedAt: string | null } | null, introduction: { sv: string, en: string | null }, chapters: Array<{ id: string, phase: Phase, version: number, title: { sv: string, en: string | null }, items: Array<{ id: string, key: string, type: GuideItemType, version: number, text: { sv: string, en: string | null } }>, sections: Array<{ id: string, key: string, version: number, title: { sv: string, en: string | null }, items: Array<{ id: string, key: string, type: GuideItemType, version: number, text: { sv: string, en: string | null } }> }> }> }, importReport: { fileName: string, createdAt: string, totals: { sections: number, tips: number, requirements: number, questions: number, texts: number }, chapters: Array<{ phase: Phase, counts: { sections: number, tips: number, requirements: number, questions: number, texts: number } }>, warnings: Array<{ code: GuideImportWarningCode, phase: Phase | null, sectionTitle: string | null, detail: string | null }> } | null } | null };

export type GuideDraftPublishMutationVariables = Exact<{
  input: GuideDraftPublishInput;
}>;


export type GuideDraftPublishMutation = { guideDraftPublish: { id: string, label: string | null } };

export type GuideDraftDiscardMutationVariables = Exact<{
  id: string | number;
  version: number;
}>;


export type GuideDraftDiscardMutation = { guideDraftDiscard: null | null };

export type GuideSuggestionFieldsFragment = { id: string, kind: GuideSuggestionKind, status: GuideSuggestionStatus, version: number, mine: boolean, author: string | null, phase: Phase, sectionKey: string | null, itemKey: string | null, reason: string | null, decidedBy: string | null, decidedAt: string | null, decisionReason: string | null, reopenedAt: string | null, createdAt: string, proposedType: GuideItemType | null, proposedText: { sv: string, en: string | null } | null, revival: { id: string, workingTitle: string, year: number }, madeOn: { id: string, label: string | null }, publishedIn: { id: string, label: string | null } | null, item: { phase: Phase, sectionKey: string | null, type: GuideItemType, sectionTitle: { sv: string, en: string | null } | null, text: { sv: string, en: string | null } } | null };

export type GuideSuggestionsQueryVariables = Exact<{
  status?: Array<GuideSuggestionStatus> | GuideSuggestionStatus | null | undefined;
  revivalId?: string | number | null | undefined;
}>;


export type GuideSuggestionsQuery = { guideSuggestions: Array<{ id: string, kind: GuideSuggestionKind, status: GuideSuggestionStatus, version: number, mine: boolean, author: string | null, phase: Phase, sectionKey: string | null, itemKey: string | null, reason: string | null, decidedBy: string | null, decidedAt: string | null, decisionReason: string | null, reopenedAt: string | null, createdAt: string, proposedType: GuideItemType | null, proposedText: { sv: string, en: string | null } | null, revival: { id: string, workingTitle: string, year: number }, madeOn: { id: string, label: string | null }, publishedIn: { id: string, label: string | null } | null, item: { phase: Phase, sectionKey: string | null, type: GuideItemType, sectionTitle: { sv: string, en: string | null } | null, text: { sv: string, en: string | null } } | null }> };

export type GuideSuggestionCreateMutationVariables = Exact<{
  input: GuideSuggestionCreateInput;
}>;


export type GuideSuggestionCreateMutation = { guideSuggestionCreate: { id: string } };

export type GuideSuggestionAcceptMutationVariables = Exact<{
  input: GuideSuggestionAcceptInput;
}>;


export type GuideSuggestionAcceptMutation = { guideSuggestionAccept: { id: string, status: GuideSuggestionStatus } };

export type GuideSuggestionRejectMutationVariables = Exact<{
  input: GuideSuggestionRejectInput;
}>;


export type GuideSuggestionRejectMutation = { guideSuggestionReject: { id: string, status: GuideSuggestionStatus } };

export type GuideSuggestionWithdrawMutationVariables = Exact<{
  id: string | number;
  version: number;
}>;


export type GuideSuggestionWithdrawMutation = { guideSuggestionWithdraw: { id: string, status: GuideSuggestionStatus } };

export type RevivalMemberAddMutationVariables = Exact<{
  input: RevivalMemberAddInput;
}>;


export type RevivalMemberAddMutation = { revivalMemberAdd: { id: string, role: RevivalRole, capabilities: Array<Capability>, state: MemberState, displayName: string | null, email: string | null, version: number } };

export type RevivalMemberCapabilitiesSetMutationVariables = Exact<{
  input: RevivalMemberCapabilitiesInput;
}>;


export type RevivalMemberCapabilitiesSetMutation = { revivalMemberCapabilitiesSet: { id: string, capabilities: Array<Capability>, version: number } };

export type RevivalMemberRemoveMutationVariables = Exact<{
  id: string | number;
}>;


export type RevivalMemberRemoveMutation = { revivalMemberRemove: null | null };

export type RevivalSummaryFragment = { id: string, year: number, workingTitle: string, premiereDate: string | null, status: RevivalStatus, spex: { id: string, title: string | null, available: boolean }, members: Array<{ id: string, role: RevivalRole, state: MemberState, displayName: string | null, email: string | null }>, permissions: { canEditCore: boolean, canEditDetails: boolean, allowedStatuses: Array<RevivalStatus>, canManageDirecteurs: boolean, canManageSteeringGroup: boolean } };

export type RevivalDetailFragment = { showDates: Array<string>, venues: Array<string>, version: number, createdBy: string, createdAt: string, lastModifiedBy: string | null, lastModifiedAt: string | null, id: string, year: number, workingTitle: string, premiereDate: string | null, status: RevivalStatus, members: Array<{ id: string, role: RevivalRole, capabilities: Array<Capability>, state: MemberState, displayName: string | null, email: string | null, version: number }>, statusHistory: Array<{ from: RevivalStatus, to: RevivalStatus, changedBy: string | null, changedAt: string }>, guideVersion: { id: string, label: string | null } | null, spex: { id: string, title: string | null, available: boolean }, permissions: { canEditCore: boolean, canEditDetails: boolean, allowedStatuses: Array<RevivalStatus>, canManageDirecteurs: boolean, canManageSteeringGroup: boolean } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: { id: string, displayName: string | null, email: string, globalRoles: Array<GlobalRole>, revivalRoles: Array<{ role: RevivalRole, capabilities: Array<Capability>, revival: { id: string } }> } };

export type RevivalsQueryVariables = Exact<{
  status?: Array<RevivalStatus> | RevivalStatus | null | undefined;
}>;


export type RevivalsQuery = { revivals: Array<{ id: string, year: number, workingTitle: string, premiereDate: string | null, status: RevivalStatus, spex: { id: string, title: string | null, available: boolean }, members: Array<{ id: string, role: RevivalRole, state: MemberState, displayName: string | null, email: string | null }>, permissions: { canEditCore: boolean, canEditDetails: boolean, allowedStatuses: Array<RevivalStatus>, canManageDirecteurs: boolean, canManageSteeringGroup: boolean } }> };

export type RevivalQueryVariables = Exact<{
  id: string | number;
}>;


export type RevivalQuery = { revival: { showDates: Array<string>, venues: Array<string>, version: number, createdBy: string, createdAt: string, lastModifiedBy: string | null, lastModifiedAt: string | null, id: string, year: number, workingTitle: string, premiereDate: string | null, status: RevivalStatus, members: Array<{ id: string, role: RevivalRole, capabilities: Array<Capability>, state: MemberState, displayName: string | null, email: string | null, version: number }>, statusHistory: Array<{ from: RevivalStatus, to: RevivalStatus, changedBy: string | null, changedAt: string }>, guideVersion: { id: string, label: string | null } | null, spex: { id: string, title: string | null, available: boolean }, permissions: { canEditCore: boolean, canEditDetails: boolean, allowedStatuses: Array<RevivalStatus>, canManageDirecteurs: boolean, canManageSteeringGroup: boolean } } | null };

export type RevivalCreateMutationVariables = Exact<{
  input: RevivalCreateInput;
}>;


export type RevivalCreateMutation = { revivalCreate: { id: string, year: number, workingTitle: string, premiereDate: string | null, status: RevivalStatus, spex: { id: string, title: string | null, available: boolean }, members: Array<{ id: string, role: RevivalRole, state: MemberState, displayName: string | null, email: string | null }>, permissions: { canEditCore: boolean, canEditDetails: boolean, allowedStatuses: Array<RevivalStatus>, canManageDirecteurs: boolean, canManageSteeringGroup: boolean } } };

export type RevivalUpdateMutationVariables = Exact<{
  input: RevivalUpdateInput;
}>;


export type RevivalUpdateMutation = { revivalUpdate: { showDates: Array<string>, venues: Array<string>, version: number, createdBy: string, createdAt: string, lastModifiedBy: string | null, lastModifiedAt: string | null, id: string, year: number, workingTitle: string, premiereDate: string | null, status: RevivalStatus, members: Array<{ id: string, role: RevivalRole, capabilities: Array<Capability>, state: MemberState, displayName: string | null, email: string | null, version: number }>, statusHistory: Array<{ from: RevivalStatus, to: RevivalStatus, changedBy: string | null, changedAt: string }>, guideVersion: { id: string, label: string | null } | null, spex: { id: string, title: string | null, available: boolean }, permissions: { canEditCore: boolean, canEditDetails: boolean, allowedStatuses: Array<RevivalStatus>, canManageDirecteurs: boolean, canManageSteeringGroup: boolean } } };

export type RevivalStatusChangeMutationVariables = Exact<{
  input: RevivalStatusChangeInput;
}>;


export type RevivalStatusChangeMutation = { revivalStatusChange: { id: string, year: number, workingTitle: string, premiereDate: string | null, status: RevivalStatus, spex: { id: string, title: string | null, available: boolean }, members: Array<{ id: string, role: RevivalRole, state: MemberState, displayName: string | null, email: string | null }>, permissions: { canEditCore: boolean, canEditDetails: boolean, allowedStatuses: Array<RevivalStatus>, canManageDirecteurs: boolean, canManageSteeringGroup: boolean } } };

export type SpexSearchQueryVariables = Exact<{
  query: string;
  first?: number | null | undefined;
}>;


export type SpexSearchQuery = { spexSearch: Array<{ id: string, title: string | null, year: number | null, available: boolean }> };

export const GuideItemFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GuideItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GuideItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"text"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}}]} as unknown as DocumentNode<GuideItemFieldsFragment, unknown>;
export const GuideVersionFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GuideVersionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GuideVersion"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"publishedBy"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"basedOn"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"introduction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}},{"kind":"Field","name":{"kind":"Name","value":"chapters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phase"}},{"kind":"Field","name":{"kind":"Name","value":"title"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GuideItemFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"title"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GuideItemFields"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GuideItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GuideItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"text"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}}]} as unknown as DocumentNode<GuideVersionFieldsFragment, unknown>;
export const GuideSuggestionFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GuideSuggestionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GuideSuggestion"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"mine"}},{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"phase"}},{"kind":"Field","name":{"kind":"Name","value":"sectionKey"}},{"kind":"Field","name":{"kind":"Name","value":"itemKey"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"decidedBy"}},{"kind":"Field","name":{"kind":"Name","value":"decidedAt"}},{"kind":"Field","name":{"kind":"Name","value":"decisionReason"}},{"kind":"Field","name":{"kind":"Name","value":"reopenedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"proposedType"}},{"kind":"Field","name":{"kind":"Name","value":"proposedText"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}},{"kind":"Field","name":{"kind":"Name","value":"revival"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"workingTitle"}},{"kind":"Field","name":{"kind":"Name","value":"year"}}]}},{"kind":"Field","name":{"kind":"Name","value":"madeOn"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"Field","name":{"kind":"Name","value":"publishedIn"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"Field","name":{"kind":"Name","value":"item"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"phase"}},{"kind":"Field","name":{"kind":"Name","value":"sectionKey"}},{"kind":"Field","name":{"kind":"Name","value":"sectionTitle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"text"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}}]}}]}}]} as unknown as DocumentNode<GuideSuggestionFieldsFragment, unknown>;
export const RevivalSummaryFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RevivalSummary"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Revival"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"workingTitle"}},{"kind":"Field","name":{"kind":"Name","value":"premiereDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"available"}}]}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"permissions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"canEditCore"}},{"kind":"Field","name":{"kind":"Name","value":"canEditDetails"}},{"kind":"Field","name":{"kind":"Name","value":"allowedStatuses"}},{"kind":"Field","name":{"kind":"Name","value":"canManageDirecteurs"}},{"kind":"Field","name":{"kind":"Name","value":"canManageSteeringGroup"}}]}}]}}]} as unknown as DocumentNode<RevivalSummaryFragment, unknown>;
export const RevivalDetailFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RevivalDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Revival"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RevivalSummary"}},{"kind":"Field","name":{"kind":"Name","value":"showDates"}},{"kind":"Field","name":{"kind":"Name","value":"venues"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastModifiedBy"}},{"kind":"Field","name":{"kind":"Name","value":"lastModifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"capabilities"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusHistory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"changedBy"}},{"kind":"Field","name":{"kind":"Name","value":"changedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"guideVersion"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RevivalSummary"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Revival"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"workingTitle"}},{"kind":"Field","name":{"kind":"Name","value":"premiereDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"available"}}]}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"permissions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"canEditCore"}},{"kind":"Field","name":{"kind":"Name","value":"canEditDetails"}},{"kind":"Field","name":{"kind":"Name","value":"allowedStatuses"}},{"kind":"Field","name":{"kind":"Name","value":"canManageDirecteurs"}},{"kind":"Field","name":{"kind":"Name","value":"canManageSteeringGroup"}}]}}]}}]} as unknown as DocumentNode<RevivalDetailFragment, unknown>;
export const GuideVersionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GuideVersions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"guideVersions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}}]}}]}}]} as unknown as DocumentNode<GuideVersionsQuery, GuideVersionsQueryVariables>;
export const GuideLatestVersionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GuideLatestVersion"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"guideLatestVersion"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GuideVersionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GuideItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GuideItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"text"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GuideVersionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GuideVersion"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"publishedBy"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"basedOn"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"introduction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}},{"kind":"Field","name":{"kind":"Name","value":"chapters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phase"}},{"kind":"Field","name":{"kind":"Name","value":"title"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GuideItemFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"title"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GuideItemFields"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GuideLatestVersionQuery, GuideLatestVersionQueryVariables>;
export const GuideVersionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GuideVersion"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"guideVersion"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GuideVersionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GuideItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GuideItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"text"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GuideVersionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GuideVersion"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"publishedBy"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"basedOn"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"introduction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}},{"kind":"Field","name":{"kind":"Name","value":"chapters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phase"}},{"kind":"Field","name":{"kind":"Name","value":"title"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GuideItemFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"title"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GuideItemFields"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GuideVersionQuery, GuideVersionQueryVariables>;
export const RevivalGuideDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RevivalGuide"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revival"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"workingTitle"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"guideVersion"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"newerGuideVersion"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"guideVersionHistory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"from"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"Field","name":{"kind":"Name","value":"to"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"Field","name":{"kind":"Name","value":"changedBy"}},{"kind":"Field","name":{"kind":"Name","value":"changedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"permissions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"canSuggestGuideChange"}},{"kind":"Field","name":{"kind":"Name","value":"guideVersionsAllowed"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}}]}}]}}]}}]}}]} as unknown as DocumentNode<RevivalGuideQuery, RevivalGuideQueryVariables>;
export const GuideChangesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GuideChanges"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fromId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"toId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"guideChanges"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fromId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fromId"}}},{"kind":"Argument","name":{"kind":"Name","value":"toId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"toId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"from"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"to"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"introductionChanged"}},{"kind":"Field","name":{"kind":"Name","value":"chapters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"phase"}},{"kind":"Field","name":{"kind":"Name","value":"renamed"}},{"kind":"Field","name":{"kind":"Name","value":"before"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}},{"kind":"Field","name":{"kind":"Name","value":"after"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"sections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"phaseBefore"}},{"kind":"Field","name":{"kind":"Name","value":"phaseAfter"}},{"kind":"Field","name":{"kind":"Name","value":"renamed"}},{"kind":"Field","name":{"kind":"Name","value":"moved"}},{"kind":"Field","name":{"kind":"Name","value":"reordered"}},{"kind":"Field","name":{"kind":"Name","value":"before"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}},{"kind":"Field","name":{"kind":"Name","value":"after"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"reworded"}},{"kind":"Field","name":{"kind":"Name","value":"retyped"}},{"kind":"Field","name":{"kind":"Name","value":"moved"}},{"kind":"Field","name":{"kind":"Name","value":"before"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"phase"}},{"kind":"Field","name":{"kind":"Name","value":"sectionKey"}},{"kind":"Field","name":{"kind":"Name","value":"sectionTitle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"text"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"after"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"phase"}},{"kind":"Field","name":{"kind":"Name","value":"sectionKey"}},{"kind":"Field","name":{"kind":"Name","value":"sectionTitle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"text"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GuideChangesQuery, GuideChangesQueryVariables>;
export const RevivalGuideVersionChangeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevivalGuideVersionChange"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RevivalGuideVersionChangeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revivalGuideVersionChange"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"guideVersion"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]}}]}}]} as unknown as DocumentNode<RevivalGuideVersionChangeMutation, RevivalGuideVersionChangeMutationVariables>;
export const GuideDraftStartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GuideDraftStart"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"guideDraftStart"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"draft"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<GuideDraftStartMutation, GuideDraftStartMutationVariables>;
export const GuideIntroductionUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GuideIntroductionUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GuideIntroductionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"guideIntroductionUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}}]}}]} as unknown as DocumentNode<GuideIntroductionUpdateMutation, GuideIntroductionUpdateMutationVariables>;
export const GuideChapterUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GuideChapterUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GuideChapterInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"guideChapterUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}}]}}]} as unknown as DocumentNode<GuideChapterUpdateMutation, GuideChapterUpdateMutationVariables>;
export const GuideSectionCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GuideSectionCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GuideSectionCreateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"guideSectionCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}}]}}]}}]} as unknown as DocumentNode<GuideSectionCreateMutation, GuideSectionCreateMutationVariables>;
export const GuideSectionUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GuideSectionUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GuideSectionUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"guideSectionUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}}]}}]} as unknown as DocumentNode<GuideSectionUpdateMutation, GuideSectionUpdateMutationVariables>;
export const GuideSectionMoveDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GuideSectionMove"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GuideSectionMoveInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"guideSectionMove"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<GuideSectionMoveMutation, GuideSectionMoveMutationVariables>;
export const GuideSectionRemoveDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GuideSectionRemove"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"version"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"guideSectionRemove"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"version"},"value":{"kind":"Variable","name":{"kind":"Name","value":"version"}}}]}]}}]} as unknown as DocumentNode<GuideSectionRemoveMutation, GuideSectionRemoveMutationVariables>;
export const GuideItemCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GuideItemCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GuideItemCreateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"guideItemCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}}]}}]}}]} as unknown as DocumentNode<GuideItemCreateMutation, GuideItemCreateMutationVariables>;
export const GuideItemUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GuideItemUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GuideItemUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"guideItemUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}}]}}]} as unknown as DocumentNode<GuideItemUpdateMutation, GuideItemUpdateMutationVariables>;
export const GuideItemMoveDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GuideItemMove"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GuideItemMoveInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"guideItemMove"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<GuideItemMoveMutation, GuideItemMoveMutationVariables>;
export const GuideItemRemoveDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GuideItemRemove"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"version"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"guideItemRemove"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"version"},"value":{"kind":"Variable","name":{"kind":"Name","value":"version"}}}]}]}}]} as unknown as DocumentNode<GuideItemRemoveMutation, GuideItemRemoveMutationVariables>;
export const GuideSearchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GuideSearch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"versionId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"guideSearch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"versionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"versionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"phase"}},{"kind":"Field","name":{"kind":"Name","value":"chapterTitle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sectionKey"}},{"kind":"Field","name":{"kind":"Name","value":"sectionTitle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}},{"kind":"Field","name":{"kind":"Name","value":"itemKey"}},{"kind":"Field","name":{"kind":"Name","value":"itemType"}},{"kind":"Field","name":{"kind":"Name","value":"snippet"}},{"kind":"Field","name":{"kind":"Name","value":"matchedLanguage"}}]}}]}}]} as unknown as DocumentNode<GuideSearchQuery, GuideSearchQueryVariables>;
export const GuideDraftDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GuideDraft"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"guideDraft"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"draft"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GuideVersionFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"importReport"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fileName"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"totals"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sections"}},{"kind":"Field","name":{"kind":"Name","value":"tips"}},{"kind":"Field","name":{"kind":"Name","value":"requirements"}},{"kind":"Field","name":{"kind":"Name","value":"questions"}},{"kind":"Field","name":{"kind":"Name","value":"texts"}}]}},{"kind":"Field","name":{"kind":"Name","value":"chapters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"phase"}},{"kind":"Field","name":{"kind":"Name","value":"counts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sections"}},{"kind":"Field","name":{"kind":"Name","value":"tips"}},{"kind":"Field","name":{"kind":"Name","value":"requirements"}},{"kind":"Field","name":{"kind":"Name","value":"questions"}},{"kind":"Field","name":{"kind":"Name","value":"texts"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"warnings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"phase"}},{"kind":"Field","name":{"kind":"Name","value":"sectionTitle"}},{"kind":"Field","name":{"kind":"Name","value":"detail"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"acceptedSuggestionCount"}},{"kind":"Field","name":{"kind":"Name","value":"untranslatedCount"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GuideItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GuideItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"text"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GuideVersionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GuideVersion"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"publishedBy"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"basedOn"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"introduction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}},{"kind":"Field","name":{"kind":"Name","value":"chapters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phase"}},{"kind":"Field","name":{"kind":"Name","value":"title"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GuideItemFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"title"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GuideItemFields"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GuideDraftQuery, GuideDraftQueryVariables>;
export const GuideDraftPublishDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GuideDraftPublish"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GuideDraftPublishInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"guideDraftPublish"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]}}]} as unknown as DocumentNode<GuideDraftPublishMutation, GuideDraftPublishMutationVariables>;
export const GuideDraftDiscardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GuideDraftDiscard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"version"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"guideDraftDiscard"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"version"},"value":{"kind":"Variable","name":{"kind":"Name","value":"version"}}}]}]}}]} as unknown as DocumentNode<GuideDraftDiscardMutation, GuideDraftDiscardMutationVariables>;
export const GuideSuggestionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GuideSuggestions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GuideSuggestionStatus"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"revivalId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"guideSuggestions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"revivalId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"revivalId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GuideSuggestionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GuideSuggestionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GuideSuggestion"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"mine"}},{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"phase"}},{"kind":"Field","name":{"kind":"Name","value":"sectionKey"}},{"kind":"Field","name":{"kind":"Name","value":"itemKey"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"decidedBy"}},{"kind":"Field","name":{"kind":"Name","value":"decidedAt"}},{"kind":"Field","name":{"kind":"Name","value":"decisionReason"}},{"kind":"Field","name":{"kind":"Name","value":"reopenedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"proposedType"}},{"kind":"Field","name":{"kind":"Name","value":"proposedText"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}},{"kind":"Field","name":{"kind":"Name","value":"revival"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"workingTitle"}},{"kind":"Field","name":{"kind":"Name","value":"year"}}]}},{"kind":"Field","name":{"kind":"Name","value":"madeOn"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"Field","name":{"kind":"Name","value":"publishedIn"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"Field","name":{"kind":"Name","value":"item"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"phase"}},{"kind":"Field","name":{"kind":"Name","value":"sectionKey"}},{"kind":"Field","name":{"kind":"Name","value":"sectionTitle"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"text"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sv"}},{"kind":"Field","name":{"kind":"Name","value":"en"}}]}}]}}]}}]} as unknown as DocumentNode<GuideSuggestionsQuery, GuideSuggestionsQueryVariables>;
export const GuideSuggestionCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GuideSuggestionCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GuideSuggestionCreateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"guideSuggestionCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<GuideSuggestionCreateMutation, GuideSuggestionCreateMutationVariables>;
export const GuideSuggestionAcceptDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GuideSuggestionAccept"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GuideSuggestionAcceptInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"guideSuggestionAccept"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<GuideSuggestionAcceptMutation, GuideSuggestionAcceptMutationVariables>;
export const GuideSuggestionRejectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GuideSuggestionReject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GuideSuggestionRejectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"guideSuggestionReject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<GuideSuggestionRejectMutation, GuideSuggestionRejectMutationVariables>;
export const GuideSuggestionWithdrawDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GuideSuggestionWithdraw"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"version"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"guideSuggestionWithdraw"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"version"},"value":{"kind":"Variable","name":{"kind":"Name","value":"version"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<GuideSuggestionWithdrawMutation, GuideSuggestionWithdrawMutationVariables>;
export const RevivalMemberAddDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevivalMemberAdd"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RevivalMemberAddInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revivalMemberAdd"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"capabilities"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}}]}}]} as unknown as DocumentNode<RevivalMemberAddMutation, RevivalMemberAddMutationVariables>;
export const RevivalMemberCapabilitiesSetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevivalMemberCapabilitiesSet"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RevivalMemberCapabilitiesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revivalMemberCapabilitiesSet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"capabilities"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}}]}}]} as unknown as DocumentNode<RevivalMemberCapabilitiesSetMutation, RevivalMemberCapabilitiesSetMutationVariables>;
export const RevivalMemberRemoveDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevivalMemberRemove"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revivalMemberRemove"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<RevivalMemberRemoveMutation, RevivalMemberRemoveMutationVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"globalRoles"}},{"kind":"Field","name":{"kind":"Name","value":"revivalRoles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"capabilities"}},{"kind":"Field","name":{"kind":"Name","value":"revival"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const RevivalsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Revivals"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RevivalStatus"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revivals"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RevivalSummary"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RevivalSummary"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Revival"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"workingTitle"}},{"kind":"Field","name":{"kind":"Name","value":"premiereDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"available"}}]}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"permissions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"canEditCore"}},{"kind":"Field","name":{"kind":"Name","value":"canEditDetails"}},{"kind":"Field","name":{"kind":"Name","value":"allowedStatuses"}},{"kind":"Field","name":{"kind":"Name","value":"canManageDirecteurs"}},{"kind":"Field","name":{"kind":"Name","value":"canManageSteeringGroup"}}]}}]}}]} as unknown as DocumentNode<RevivalsQuery, RevivalsQueryVariables>;
export const RevivalDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Revival"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revival"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RevivalDetail"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RevivalSummary"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Revival"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"workingTitle"}},{"kind":"Field","name":{"kind":"Name","value":"premiereDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"available"}}]}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"permissions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"canEditCore"}},{"kind":"Field","name":{"kind":"Name","value":"canEditDetails"}},{"kind":"Field","name":{"kind":"Name","value":"allowedStatuses"}},{"kind":"Field","name":{"kind":"Name","value":"canManageDirecteurs"}},{"kind":"Field","name":{"kind":"Name","value":"canManageSteeringGroup"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RevivalDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Revival"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RevivalSummary"}},{"kind":"Field","name":{"kind":"Name","value":"showDates"}},{"kind":"Field","name":{"kind":"Name","value":"venues"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastModifiedBy"}},{"kind":"Field","name":{"kind":"Name","value":"lastModifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"capabilities"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusHistory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"changedBy"}},{"kind":"Field","name":{"kind":"Name","value":"changedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"guideVersion"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]}}]} as unknown as DocumentNode<RevivalQuery, RevivalQueryVariables>;
export const RevivalCreateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevivalCreate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RevivalCreateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revivalCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RevivalSummary"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RevivalSummary"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Revival"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"workingTitle"}},{"kind":"Field","name":{"kind":"Name","value":"premiereDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"available"}}]}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"permissions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"canEditCore"}},{"kind":"Field","name":{"kind":"Name","value":"canEditDetails"}},{"kind":"Field","name":{"kind":"Name","value":"allowedStatuses"}},{"kind":"Field","name":{"kind":"Name","value":"canManageDirecteurs"}},{"kind":"Field","name":{"kind":"Name","value":"canManageSteeringGroup"}}]}}]}}]} as unknown as DocumentNode<RevivalCreateMutation, RevivalCreateMutationVariables>;
export const RevivalUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevivalUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RevivalUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revivalUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RevivalDetail"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RevivalSummary"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Revival"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"workingTitle"}},{"kind":"Field","name":{"kind":"Name","value":"premiereDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"available"}}]}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"permissions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"canEditCore"}},{"kind":"Field","name":{"kind":"Name","value":"canEditDetails"}},{"kind":"Field","name":{"kind":"Name","value":"allowedStatuses"}},{"kind":"Field","name":{"kind":"Name","value":"canManageDirecteurs"}},{"kind":"Field","name":{"kind":"Name","value":"canManageSteeringGroup"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RevivalDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Revival"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RevivalSummary"}},{"kind":"Field","name":{"kind":"Name","value":"showDates"}},{"kind":"Field","name":{"kind":"Name","value":"venues"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"createdBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastModifiedBy"}},{"kind":"Field","name":{"kind":"Name","value":"lastModifiedAt"}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"capabilities"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"version"}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusHistory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"changedBy"}},{"kind":"Field","name":{"kind":"Name","value":"changedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"guideVersion"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]}}]} as unknown as DocumentNode<RevivalUpdateMutation, RevivalUpdateMutationVariables>;
export const RevivalStatusChangeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RevivalStatusChange"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RevivalStatusChangeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"revivalStatusChange"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RevivalSummary"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RevivalSummary"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Revival"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"workingTitle"}},{"kind":"Field","name":{"kind":"Name","value":"premiereDate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"spex"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"available"}}]}},{"kind":"Field","name":{"kind":"Name","value":"members"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"permissions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"canEditCore"}},{"kind":"Field","name":{"kind":"Name","value":"canEditDetails"}},{"kind":"Field","name":{"kind":"Name","value":"allowedStatuses"}},{"kind":"Field","name":{"kind":"Name","value":"canManageDirecteurs"}},{"kind":"Field","name":{"kind":"Name","value":"canManageSteeringGroup"}}]}}]}}]} as unknown as DocumentNode<RevivalStatusChangeMutation, RevivalStatusChangeMutationVariables>;
export const SpexSearchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SpexSearch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spexSearch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"available"}}]}}]}}]} as unknown as DocumentNode<SpexSearchQuery, SpexSearchQueryVariables>;