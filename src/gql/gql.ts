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
    "\n    query Capabilities($includeRetired: Boolean) {\n        capabilities(includeRetired: $includeRetired) { ...CapabilityFields position inUse version }\n    }\n": typeof types.CapabilitiesDocument,
    "\n    mutation CapabilityCreate($input: CapabilityCreateInput!) {\n        capabilityCreate(input: $input) { id }\n    }\n": typeof types.CapabilityCreateDocument,
    "\n    mutation CapabilityUpdate($input: CapabilityUpdateInput!) {\n        capabilityUpdate(input: $input) { id }\n    }\n": typeof types.CapabilityUpdateDocument,
    "\n    mutation CapabilityMove($id: ID!, $version: Int!, $position: Int!) {\n        capabilityMove(id: $id, version: $version, position: $position) { id }\n    }\n": typeof types.CapabilityMoveDocument,
    "\n    mutation CapabilityRetire($id: ID!, $version: Int!) {\n        capabilityRetire(id: $id, version: $version) { id }\n    }\n": typeof types.CapabilityRetireDocument,
    "\n    mutation CapabilityRestore($id: ID!, $version: Int!) {\n        capabilityRestore(id: $id, version: $version) { id }\n    }\n": typeof types.CapabilityRestoreDocument,
    "\n    mutation CapabilityDelete($id: ID!, $version: Int!) {\n        capabilityDelete(id: $id, version: $version)\n    }\n": typeof types.CapabilityDeleteDocument,
    "\n    query GuideItemTypes($includeRetired: Boolean) {\n        guideItemTypes(includeRetired: $includeRetired) { ...GuideItemTypeFields position inUse version }\n    }\n": typeof types.GuideItemTypesDocument,
    "\n    mutation GuideItemTypeCreate($input: GuideItemTypeCreateInput!) {\n        guideItemTypeCreate(input: $input) { id }\n    }\n": typeof types.GuideItemTypeCreateDocument,
    "\n    mutation GuideItemTypeUpdate($input: GuideItemTypeUpdateInput!) {\n        guideItemTypeUpdate(input: $input) { id }\n    }\n": typeof types.GuideItemTypeUpdateDocument,
    "\n    mutation GuideItemTypeMove($id: ID!, $version: Int!, $position: Int!) {\n        guideItemTypeMove(id: $id, version: $version, position: $position) { id }\n    }\n": typeof types.GuideItemTypeMoveDocument,
    "\n    mutation GuideItemTypeRetire($id: ID!, $version: Int!) {\n        guideItemTypeRetire(id: $id, version: $version) { id }\n    }\n": typeof types.GuideItemTypeRetireDocument,
    "\n    mutation GuideItemTypeRestore($id: ID!, $version: Int!) {\n        guideItemTypeRestore(id: $id, version: $version) { id }\n    }\n": typeof types.GuideItemTypeRestoreDocument,
    "\n    mutation GuideItemTypeDelete($id: ID!, $version: Int!) {\n        guideItemTypeDelete(id: $id, version: $version)\n    }\n": typeof types.GuideItemTypeDeleteDocument,
    "\n    fragment CapabilityFields on Capability {\n        id\n        name { sv en }\n        retired\n    }\n": typeof types.CapabilityFieldsFragmentDoc,
    "\n    fragment GuideItemTypeFields on GuideItemType {\n        id\n        kind\n        name { sv en }\n        retired\n    }\n": typeof types.GuideItemTypeFieldsFragmentDoc,
    "\n    query RevivalChecklists($id: ID!, $filter: ChecklistItemFilter, $filtered: Boolean!, $includeCancelled: Boolean!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            permissions { canWriteLog }\n            ownerCandidates { id displayName }\n        }\n        checklists(revivalId: $id, includeCancelled: $includeCancelled) { id kind chapterKey chapterTitle { sv en } name date cancelled openCount overdueCount totalCount }\n        checklistItems(revivalId: $id, filter: $filter) @include(if: $filtered) { ...ChecklistItemFields }\n    }\n": typeof types.RevivalChecklistsDocument,
    "\n    query Checklist($id: ID!, $revivalId: ID!) {\n        revival(id: $revivalId) {\n            id\n            title\n            permissions { canWriteLog canWaiveRequirement }\n            ownerCandidates { id displayName }\n        }\n        checklist(id: $id) {\n            id\n            revivalId\n            kind\n            chapterKey\n            chapterTitle { sv en }\n            name\n            date\n            cancelled\n            version\n            template { id name { sv en } }\n            templatesAvailable { id kind chapterKey chapterTitle { sv en } name { sv en } }\n            tips { ...GuideItemFields }\n            items { ...ChecklistItemFields }\n        }\n    }\n": typeof types.ChecklistDocument,
    "\n    mutation EventChecklistCreate($input: EventChecklistCreateInput!) {\n        eventChecklistCreate(input: $input) { id }\n    }\n": typeof types.EventChecklistCreateDocument,
    "\n    mutation EventChecklistUpdate($input: EventChecklistUpdateInput!) {\n        eventChecklistUpdate(input: $input) { id }\n    }\n": typeof types.EventChecklistUpdateDocument,
    "\n    mutation EventChecklistCancel($id: ID!, $version: Int!) {\n        eventChecklistCancel(id: $id, version: $version) { id }\n    }\n": typeof types.EventChecklistCancelDocument,
    "\n    mutation ChecklistAddFromTemplate($input: ChecklistAddFromTemplateInput!) {\n        checklistAddFromTemplate(input: $input) { id }\n    }\n": typeof types.ChecklistAddFromTemplateDocument,
    "\n    mutation ChecklistItemCreate($input: ChecklistItemCreateInput!) {\n        checklistItemCreate(input: $input) { id }\n    }\n": typeof types.ChecklistItemCreateDocument,
    "\n    mutation ChecklistItemUpdate($input: ChecklistItemUpdateInput!) {\n        checklistItemUpdate(input: $input) { id }\n    }\n": typeof types.ChecklistItemUpdateDocument,
    "\n    mutation ChecklistItemSetState($input: ChecklistItemSetStateInput!) {\n        checklistItemSetState(input: $input) { id state }\n    }\n": typeof types.ChecklistItemSetStateDocument,
    "\n    fragment ChecklistItemFields on ChecklistItem {\n        id\n        required\n        text { sv en }\n        state\n        stateChangedBy { displayName }\n        stateChangedAt\n        reason\n        owner { ...OwnerFields }\n        deadline\n        deadlineManual\n        overdue\n        comment\n        guideItem { id key type { ...GuideItemTypeFields } text { sv en } version }\n        defaultCapability { ...CapabilityFields }\n        logEntries { id number type status }\n        checklist { id kind chapterKey chapterTitle { sv en } name }\n        version\n    }\n": typeof types.ChecklistItemFieldsFragmentDoc,
    "\n    query ChecklistTemplates($includeRetired: Boolean) {\n        checklistTemplates(includeRetired: $includeRetired) { id kind chapterKey chapterTitle { sv en } name { sv en } retired version items { id } }\n    }\n": typeof types.ChecklistTemplatesDocument,
    "\n    query ChecklistTemplate($id: ID!) {\n        checklistTemplate(id: $id) {\n            id\n            kind\n            chapterKey\n            chapterTitle { sv en }\n            name { sv en }\n            retired\n            version\n            items {\n                id\n                position\n                text { sv en }\n                guideItemKey\n                guideItem { ...GuideItemFields }\n                defaultCapability { ...CapabilityFields }\n                deadline { kind amount weekday }\n                version\n            }\n            retiredItems {\n                id\n                position\n                text { sv en }\n                guideItemKey\n                guideItem { ...GuideItemFields }\n                defaultCapability { ...CapabilityFields }\n                deadline { kind amount weekday }\n                version\n            }\n        }\n    }\n": typeof types.ChecklistTemplateDocument,
    "\n    query EventChecklistTemplates {\n        checklistTemplates { id kind name { sv en } }\n    }\n": typeof types.EventChecklistTemplatesDocument,
    "\n    mutation ChecklistTemplateCreate($input: ChecklistTemplateCreateInput!) {\n        checklistTemplateCreate(input: $input) { id }\n    }\n": typeof types.ChecklistTemplateCreateDocument,
    "\n    mutation ChecklistTemplateUpdate($input: ChecklistTemplateUpdateInput!) {\n        checklistTemplateUpdate(input: $input) { id }\n    }\n": typeof types.ChecklistTemplateUpdateDocument,
    "\n    mutation ChecklistTemplateRetire($id: ID!, $version: Int!) {\n        checklistTemplateRetire(id: $id, version: $version) { id }\n    }\n": typeof types.ChecklistTemplateRetireDocument,
    "\n    mutation ChecklistTemplateItemCreate($input: ChecklistTemplateItemCreateInput!) {\n        checklistTemplateItemCreate(input: $input) { id }\n    }\n": typeof types.ChecklistTemplateItemCreateDocument,
    "\n    mutation ChecklistTemplateItemUpdate($input: ChecklistTemplateItemUpdateInput!) {\n        checklistTemplateItemUpdate(input: $input) { id }\n    }\n": typeof types.ChecklistTemplateItemUpdateDocument,
    "\n    mutation ChecklistTemplateItemMove($id: ID!, $version: Int!, $position: Int!) {\n        checklistTemplateItemMove(id: $id, version: $version, position: $position) { id }\n    }\n": typeof types.ChecklistTemplateItemMoveDocument,
    "\n    mutation ChecklistTemplateItemRetire($id: ID!, $version: Int!) {\n        checklistTemplateItemRetire(id: $id, version: $version) { id }\n    }\n": typeof types.ChecklistTemplateItemRetireDocument,
    "\n    mutation ChecklistTemplateRestore($id: ID!, $version: Int!) {\n        checklistTemplateRestore(id: $id, version: $version) { id }\n    }\n": typeof types.ChecklistTemplateRestoreDocument,
    "\n    mutation ChecklistTemplateItemRestore($id: ID!, $version: Int!) {\n        checklistTemplateItemRestore(id: $id, version: $version) { id }\n    }\n": typeof types.ChecklistTemplateItemRestoreDocument,
    "\n    fragment OwnerFields on Owner {\n        name\n        person { id displayName active }\n    }\n": typeof types.OwnerFieldsFragmentDoc,
    "\n    fragment LogEntryFields on LogEntry {\n        id\n        number\n        date\n        type\n        text\n        status\n        owner { ...OwnerFields }\n        deadline\n        overdue\n        comment\n        tags\n        meeting { id date title status }\n        guideItemKey\n        guideItem { id key type { ...GuideItemTypeFields } text { sv en } version }\n        checklistItem { id checklistId state text { sv en } }\n        answers { id number type status }\n        answeredBy { id number type status }\n        origin\n        createdBy\n        createdAt\n        version\n    }\n": typeof types.LogEntryFieldsFragmentDoc,
    "\n    query RevivalLog($id: ID!, $filter: LogEntryFilter) {\n        revival(id: $id) {\n            id\n            title\n            year\n            status\n            permissions { canWriteLog canImportLog canWaiveRequirement }\n            ownerCandidates { id displayName }\n        }\n        logEntries(revivalId: $id, filter: $filter) { ...LogEntryFields }\n        logTags(revivalId: $id)\n        meetings(revivalId: $id) { id date title }\n    }\n": typeof types.RevivalLogDocument,
    "\n    query RevivalLogImport($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            permissions { canImportLog canWaiveRequirement }\n        }\n        logImport(revivalId: $id) { fileName layout rowCount importedAt importedBy { displayName } }\n    }\n": typeof types.RevivalLogImportDocument,
    "\n    mutation LogEntryCreate($input: LogEntryCreateInput!) {\n        logEntryCreate(input: $input) { ...LogEntryFields }\n    }\n": typeof types.LogEntryCreateDocument,
    "\n    mutation LogEntryUpdate($input: LogEntryUpdateInput!) {\n        logEntryUpdate(input: $input) { ...LogEntryFields }\n    }\n": typeof types.LogEntryUpdateDocument,
    "\n    mutation LogEntryAnswer($input: LogEntryAnswerInput!) {\n        logEntryAnswer(input: $input) {\n            question { ...LogEntryFields }\n            decision { ...LogEntryFields }\n        }\n    }\n": typeof types.LogEntryAnswerDocument,
    "\n    fragment GuideItemFields on GuideItem {\n        id\n        key\n        type { ...GuideItemTypeFields }\n        text { sv en }\n        version\n    }\n": typeof types.GuideItemFieldsFragmentDoc,
    "\n    fragment GuideVersionFields on GuideVersion {\n        id\n        status\n        label\n        note\n        publishedAt\n        publishedBy\n        version\n        basedOn { id label publishedAt }\n        introduction { sv en }\n        chapters {\n            id\n            key\n            title { sv en }\n            version\n            items { ...GuideItemFields }\n            sections {\n                id\n                key\n                title { sv en }\n                version\n                items { ...GuideItemFields }\n            }\n        }\n    }\n": typeof types.GuideVersionFieldsFragmentDoc,
    "\n    query GuideVersions {\n        guideVersions { id label publishedAt }\n    }\n": typeof types.GuideVersionsDocument,
    "\n    query GuideVersionsAdmin {\n        guideVersions { id label note publishedAt publishedBy revivalCount suggestionCount deletable version }\n    }\n": typeof types.GuideVersionsAdminDocument,
    "\n    mutation GuideVersionDelete($id: ID!, $version: Int!) {\n        guideVersionDelete(id: $id, version: $version)\n    }\n": typeof types.GuideVersionDeleteDocument,
    "\n    query GuideLatestVersion {\n        guideLatestVersion { ...GuideVersionFields }\n    }\n": typeof types.GuideLatestVersionDocument,
    "\n    query GuideVersion($id: ID!) {\n        guideVersion(id: $id) { ...GuideVersionFields }\n    }\n": typeof types.GuideVersionDocument,
    "\n    query RevivalGuide($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            year\n            status\n            guideVersion { id label publishedAt }\n            newerGuideVersion { id label publishedAt }\n            guideVersionHistory { fromLabel toLabel changedBy changedAt }\n            permissions { canSuggestGuideChange guideVersionsAllowed { id label publishedAt } }\n        }\n    }\n": typeof types.RevivalGuideDocument,
    "\n    query GuideChanges($fromId: ID!, $toId: ID!) {\n        guideChanges(fromId: $fromId, toId: $toId) {\n            from { id label publishedAt }\n            to { id label publishedAt }\n            introductionChanged\n            chapters { key kind renamed moved before { sv en } after { sv en } }\n            sections {\n                key\n                kind\n                chapterBefore { key title { sv en } }\n                chapterAfter { key title { sv en } }\n                renamed\n                moved\n                reordered\n                before { sv en }\n                after { sv en }\n            }\n            items {\n                key\n                kind\n                reworded\n                retyped\n                moved\n                before { chapter { key title { sv en } } sectionKey sectionTitle { sv en } type { ...GuideItemTypeFields } text { sv en } }\n                after { chapter { key title { sv en } } sectionKey sectionTitle { sv en } type { ...GuideItemTypeFields } text { sv en } }\n            }\n        }\n    }\n": typeof types.GuideChangesDocument,
    "\n    mutation RevivalGuideVersionChange($input: RevivalGuideVersionChangeInput!) {\n        revivalGuideVersionChange(input: $input) { id guideVersion { id label } }\n    }\n": typeof types.RevivalGuideVersionChangeDocument,
    "\n    mutation GuideDraftStart {\n        guideDraftStart { draft { id } }\n    }\n": typeof types.GuideDraftStartDocument,
    "\n    mutation GuideIntroductionUpdate($input: GuideIntroductionInput!) {\n        guideIntroductionUpdate(input: $input) { id version }\n    }\n": typeof types.GuideIntroductionUpdateDocument,
    "\n    mutation GuideChapterCreate($input: GuideChapterCreateInput!) {\n        guideChapterCreate(input: $input) { id key }\n    }\n": typeof types.GuideChapterCreateDocument,
    "\n    mutation GuideChapterMove($input: GuideChapterMoveInput!) {\n        guideChapterMove(input: $input) { id }\n    }\n": typeof types.GuideChapterMoveDocument,
    "\n    mutation GuideChapterRemove($id: ID!, $version: Int!) {\n        guideChapterRemove(id: $id, version: $version)\n    }\n": typeof types.GuideChapterRemoveDocument,
    "\n    query GuideChapterRemovalImpact($chapterKey: ID!) {\n        guideChapterRemovalImpact(chapterKey: $chapterKey) { chapterKey revivalCount itemCount doneCount }\n    }\n": typeof types.GuideChapterRemovalImpactDocument,
    "\n    query RevivalGuideVersionChangeImpact($id: ID!, $toId: ID!) {\n        revival(id: $id) {\n            id\n            guideVersionChangeImpact(toId: $toId) { checklistId chapterKey chapterTitle { sv en } itemCount doneCount linkedLogEntryCount }\n        }\n    }\n": typeof types.RevivalGuideVersionChangeImpactDocument,
    "\n    mutation GuideChapterUpdate($input: GuideChapterInput!) {\n        guideChapterUpdate(input: $input) { id version }\n    }\n": typeof types.GuideChapterUpdateDocument,
    "\n    mutation GuideSectionCreate($input: GuideSectionCreateInput!) {\n        guideSectionCreate(input: $input) { id key }\n    }\n": typeof types.GuideSectionCreateDocument,
    "\n    mutation GuideSectionUpdate($input: GuideSectionUpdateInput!) {\n        guideSectionUpdate(input: $input) { id version }\n    }\n": typeof types.GuideSectionUpdateDocument,
    "\n    mutation GuideSectionMove($input: GuideSectionMoveInput!) {\n        guideSectionMove(input: $input) { id }\n    }\n": typeof types.GuideSectionMoveDocument,
    "\n    mutation GuideSectionRemove($id: ID!, $version: Int!) {\n        guideSectionRemove(id: $id, version: $version)\n    }\n": typeof types.GuideSectionRemoveDocument,
    "\n    mutation GuideItemCreate($input: GuideItemCreateInput!) {\n        guideItemCreate(input: $input) { id key }\n    }\n": typeof types.GuideItemCreateDocument,
    "\n    mutation GuideItemUpdate($input: GuideItemUpdateInput!) {\n        guideItemUpdate(input: $input) { id version }\n    }\n": typeof types.GuideItemUpdateDocument,
    "\n    mutation GuideItemMove($input: GuideItemMoveInput!) {\n        guideItemMove(input: $input) { id }\n    }\n": typeof types.GuideItemMoveDocument,
    "\n    mutation GuideItemRemove($id: ID!, $version: Int!) {\n        guideItemRemove(id: $id, version: $version)\n    }\n": typeof types.GuideItemRemoveDocument,
    "\n    query GuideSearch($versionId: ID, $query: String!) {\n        guideSearch(versionId: $versionId, query: $query) {\n            kind\n            chapterKey\n            chapterTitle { sv en }\n            sectionKey\n            sectionTitle { sv en }\n            itemKey\n            itemType { ...GuideItemTypeFields }\n            snippet\n            matchedLanguage\n        }\n    }\n": typeof types.GuideSearchDocument,
    "\n    query GuideDraft {\n        guideDraft {\n            draft { ...GuideVersionFields }\n            acceptedSuggestionCount\n            untranslatedCount\n        }\n    }\n": typeof types.GuideDraftDocument,
    "\n    mutation GuideDraftPublish($input: GuideDraftPublishInput!) {\n        guideDraftPublish(input: $input) { id label }\n    }\n": typeof types.GuideDraftPublishDocument,
    "\n    mutation GuideDraftDiscard($id: ID!, $version: Int!) {\n        guideDraftDiscard(id: $id, version: $version)\n    }\n": typeof types.GuideDraftDiscardDocument,
    "\n    fragment GuideSuggestionFields on GuideSuggestion {\n        id\n        kind\n        status\n        version\n        mine\n        author\n        chapterKey\n        chapterTitle { sv en }\n        sectionKey\n        itemKey\n        reason\n        decidedBy\n        decidedAt\n        decisionReason\n        reopenedAt\n        createdAt\n        proposedType { ...GuideItemTypeFields }\n        proposedText { sv en }\n        revival { id title year }\n        madeOn { id label }\n        publishedIn { id label }\n        item { chapter { key title { sv en } } sectionKey sectionTitle { sv en } type { ...GuideItemTypeFields } text { sv en } }\n    }\n": typeof types.GuideSuggestionFieldsFragmentDoc,
    "\n    query GuideSuggestions($status: [GuideSuggestionStatus!], $revivalId: ID) {\n        guideSuggestions(status: $status, revivalId: $revivalId) { ...GuideSuggestionFields }\n    }\n": typeof types.GuideSuggestionsDocument,
    "\n    mutation GuideSuggestionCreate($input: GuideSuggestionCreateInput!) {\n        guideSuggestionCreate(input: $input) { id }\n    }\n": typeof types.GuideSuggestionCreateDocument,
    "\n    mutation GuideSuggestionAccept($input: GuideSuggestionAcceptInput!) {\n        guideSuggestionAccept(input: $input) { id status }\n    }\n": typeof types.GuideSuggestionAcceptDocument,
    "\n    mutation GuideSuggestionReject($input: GuideSuggestionRejectInput!) {\n        guideSuggestionReject(input: $input) { id status }\n    }\n": typeof types.GuideSuggestionRejectDocument,
    "\n    mutation GuideSuggestionWithdraw($id: ID!, $version: Int!) {\n        guideSuggestionWithdraw(id: $id, version: $version) { id status }\n    }\n": typeof types.GuideSuggestionWithdrawDocument,
    "\n    query RevivalMeetings($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            permissions { canWriteLog }\n            ownerCandidates { id displayName }\n        }\n        meetings(revivalId: $id) { id date title status }\n    }\n": typeof types.RevivalMeetingsDocument,
    "\n    query Meeting($id: ID!, $revivalId: ID!) {\n        revival(id: $revivalId) {\n            id\n            title\n            permissions { canWriteLog }\n            ownerCandidates { id displayName }\n        }\n        logTags(revivalId: $revivalId)\n        meeting(id: $id) {\n            id\n            revivalId\n            date\n            title\n            status\n            attendees { id displayName }\n            othersPresent\n            agendaPoints\n            recorder { id displayName }\n            startedAt\n            closedAt\n            canEmailMinutes\n            version\n            openEntries { ...LogEntryFields }\n            entries { ...LogEntryFields }\n            blockingEntries { id number type status }\n            minutes {\n                decisions { ...MinutesRowFields }\n                todos { ...MinutesRowFields }\n                questions { ...MinutesRowFields }\n                closed { ...MinutesRowFields }\n                agendaPoints\n                attendees { id displayName }\n                othersPresent\n                recorder { id displayName }\n            }\n            emails {\n                id\n                language\n                sentAt\n                sentBy { displayName }\n                waitingLeftOut\n                recipients { person { id displayName } status }\n            }\n        }\n    }\n": typeof types.MeetingDocument,
    "\n    fragment MinutesRowFields on MinutesRow {\n        entryId\n        number\n        type\n        text\n        owner { ...OwnerFields }\n        deadline\n        status\n    }\n": typeof types.MinutesRowFieldsFragmentDoc,
    "\n    mutation MeetingCreate($input: MeetingCreateInput!) {\n        meetingCreate(input: $input) { id }\n    }\n": typeof types.MeetingCreateDocument,
    "\n    mutation MeetingUpdate($input: MeetingUpdateInput!) {\n        meetingUpdate(input: $input) { id }\n    }\n": typeof types.MeetingUpdateDocument,
    "\n    mutation MeetingStart($id: ID!, $version: Int!) {\n        meetingStart(id: $id, version: $version) { id status }\n    }\n": typeof types.MeetingStartDocument,
    "\n    mutation MeetingClose($id: ID!, $version: Int!) {\n        meetingClose(id: $id, version: $version) { id status }\n    }\n": typeof types.MeetingCloseDocument,
    "\n    mutation MeetingCancel($id: ID!, $version: Int!) {\n        meetingCancel(id: $id, version: $version) { id status }\n    }\n": typeof types.MeetingCancelDocument,
    "\n    mutation MinutesEmailSend($input: MinutesEmailSendInput!) {\n        minutesEmailSend(input: $input) { id waitingLeftOut recipients { person { id displayName } status } }\n    }\n": typeof types.MinutesEmailSendDocument,
    "\n    mutation MinutesEmailRetry($emailId: ID!) {\n        minutesEmailRetry(emailId: $emailId) { id waitingLeftOut recipients { person { id displayName } status } }\n    }\n": typeof types.MinutesEmailRetryDocument,
    "\n    query RevivalMemberCandidates($revivalId: ID!, $query: String!) {\n        revivalMemberCandidates(revivalId: $revivalId, query: $query) { email displayName hasAccess }\n    }\n": typeof types.RevivalMemberCandidatesDocument,
    "\n    mutation RevivalMemberAdd($input: RevivalMemberAddInput!) {\n        revivalMemberAdd(input: $input) { id role capabilities { ...CapabilityFields } state displayName email invitedAt version }\n    }\n": typeof types.RevivalMemberAddDocument,
    "\n    mutation RevivalMemberCapabilitiesSet($input: RevivalMemberCapabilitiesInput!) {\n        revivalMemberCapabilitiesSet(input: $input) { id capabilities { ...CapabilityFields } version }\n    }\n": typeof types.RevivalMemberCapabilitiesSetDocument,
    "\n    mutation RevivalMemberRemove($id: ID!) {\n        revivalMemberRemove(id: $id)\n    }\n": typeof types.RevivalMemberRemoveDocument,
    "\n    fragment RevivalSummary on Revival {\n        id\n        year\n        title\n        premiereDate\n        status\n        version\n        spex { id title year available }\n        members { id role state displayName email invitedAt }\n        permissions { canEditCore canEditDetails allowedStatuses canManageDirecteurs canManageSteeringGroup canDelete }\n    }\n": typeof types.RevivalSummaryFragmentDoc,
    "\n    fragment RevivalDetail on Revival {\n        ...RevivalSummary\n        shows { date time venue }\n        createdBy\n        createdAt\n        lastModifiedBy\n        lastModifiedAt\n        members { id role capabilities { ...CapabilityFields } state displayName email version }\n        statusHistory { from to changedBy changedAt }\n        guideVersion { id label }\n    }\n": typeof types.RevivalDetailFragmentDoc,
    "\n    query Me {\n        me {\n            id\n            displayName\n            email\n            globalRoles\n            revivalRoles { role capabilities { id } revival { id } }\n        }\n    }\n": typeof types.MeDocument,
    "\n    query Revivals($status: [RevivalStatus!]) {\n        revivals(status: $status) { ...RevivalSummary }\n    }\n": typeof types.RevivalsDocument,
    "\n    query Revival($id: ID!) {\n        revival(id: $id) { ...RevivalDetail }\n    }\n": typeof types.RevivalDocument,
    "\n    query RevivalWorkSummary($id: ID!) {\n        revival(id: $id) {\n            id\n            workSummary { openEntries overdueEntries overdueChecklistItems openRequiredItems meetingInProgress { id title date } }\n        }\n    }\n": typeof types.RevivalWorkSummaryDocument,
    "\n    mutation RevivalCreate($input: RevivalCreateInput!) {\n        revivalCreate(input: $input) { ...RevivalSummary }\n    }\n": typeof types.RevivalCreateDocument,
    "\n    mutation RevivalUpdate($input: RevivalUpdateInput!) {\n        revivalUpdate(input: $input) { ...RevivalDetail }\n    }\n": typeof types.RevivalUpdateDocument,
    "\n    mutation RevivalStatusChange($input: RevivalStatusChangeInput!) {\n        revivalStatusChange(input: $input) { ...RevivalSummary }\n    }\n": typeof types.RevivalStatusChangeDocument,
    "\n    mutation RevivalDelete($id: ID!, $version: Int!) {\n        revivalDelete(id: $id, version: $version)\n    }\n": typeof types.RevivalDeleteDocument,
    "\n    query SpexSearch($query: String!, $first: Int) {\n        spexSearch(query: $query, first: $first) { id title year available }\n    }\n": typeof types.SpexSearchDocument,
};
const documents: Documents = {
    "\n    query Capabilities($includeRetired: Boolean) {\n        capabilities(includeRetired: $includeRetired) { ...CapabilityFields position inUse version }\n    }\n": types.CapabilitiesDocument,
    "\n    mutation CapabilityCreate($input: CapabilityCreateInput!) {\n        capabilityCreate(input: $input) { id }\n    }\n": types.CapabilityCreateDocument,
    "\n    mutation CapabilityUpdate($input: CapabilityUpdateInput!) {\n        capabilityUpdate(input: $input) { id }\n    }\n": types.CapabilityUpdateDocument,
    "\n    mutation CapabilityMove($id: ID!, $version: Int!, $position: Int!) {\n        capabilityMove(id: $id, version: $version, position: $position) { id }\n    }\n": types.CapabilityMoveDocument,
    "\n    mutation CapabilityRetire($id: ID!, $version: Int!) {\n        capabilityRetire(id: $id, version: $version) { id }\n    }\n": types.CapabilityRetireDocument,
    "\n    mutation CapabilityRestore($id: ID!, $version: Int!) {\n        capabilityRestore(id: $id, version: $version) { id }\n    }\n": types.CapabilityRestoreDocument,
    "\n    mutation CapabilityDelete($id: ID!, $version: Int!) {\n        capabilityDelete(id: $id, version: $version)\n    }\n": types.CapabilityDeleteDocument,
    "\n    query GuideItemTypes($includeRetired: Boolean) {\n        guideItemTypes(includeRetired: $includeRetired) { ...GuideItemTypeFields position inUse version }\n    }\n": types.GuideItemTypesDocument,
    "\n    mutation GuideItemTypeCreate($input: GuideItemTypeCreateInput!) {\n        guideItemTypeCreate(input: $input) { id }\n    }\n": types.GuideItemTypeCreateDocument,
    "\n    mutation GuideItemTypeUpdate($input: GuideItemTypeUpdateInput!) {\n        guideItemTypeUpdate(input: $input) { id }\n    }\n": types.GuideItemTypeUpdateDocument,
    "\n    mutation GuideItemTypeMove($id: ID!, $version: Int!, $position: Int!) {\n        guideItemTypeMove(id: $id, version: $version, position: $position) { id }\n    }\n": types.GuideItemTypeMoveDocument,
    "\n    mutation GuideItemTypeRetire($id: ID!, $version: Int!) {\n        guideItemTypeRetire(id: $id, version: $version) { id }\n    }\n": types.GuideItemTypeRetireDocument,
    "\n    mutation GuideItemTypeRestore($id: ID!, $version: Int!) {\n        guideItemTypeRestore(id: $id, version: $version) { id }\n    }\n": types.GuideItemTypeRestoreDocument,
    "\n    mutation GuideItemTypeDelete($id: ID!, $version: Int!) {\n        guideItemTypeDelete(id: $id, version: $version)\n    }\n": types.GuideItemTypeDeleteDocument,
    "\n    fragment CapabilityFields on Capability {\n        id\n        name { sv en }\n        retired\n    }\n": types.CapabilityFieldsFragmentDoc,
    "\n    fragment GuideItemTypeFields on GuideItemType {\n        id\n        kind\n        name { sv en }\n        retired\n    }\n": types.GuideItemTypeFieldsFragmentDoc,
    "\n    query RevivalChecklists($id: ID!, $filter: ChecklistItemFilter, $filtered: Boolean!, $includeCancelled: Boolean!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            permissions { canWriteLog }\n            ownerCandidates { id displayName }\n        }\n        checklists(revivalId: $id, includeCancelled: $includeCancelled) { id kind chapterKey chapterTitle { sv en } name date cancelled openCount overdueCount totalCount }\n        checklistItems(revivalId: $id, filter: $filter) @include(if: $filtered) { ...ChecklistItemFields }\n    }\n": types.RevivalChecklistsDocument,
    "\n    query Checklist($id: ID!, $revivalId: ID!) {\n        revival(id: $revivalId) {\n            id\n            title\n            permissions { canWriteLog canWaiveRequirement }\n            ownerCandidates { id displayName }\n        }\n        checklist(id: $id) {\n            id\n            revivalId\n            kind\n            chapterKey\n            chapterTitle { sv en }\n            name\n            date\n            cancelled\n            version\n            template { id name { sv en } }\n            templatesAvailable { id kind chapterKey chapterTitle { sv en } name { sv en } }\n            tips { ...GuideItemFields }\n            items { ...ChecklistItemFields }\n        }\n    }\n": types.ChecklistDocument,
    "\n    mutation EventChecklistCreate($input: EventChecklistCreateInput!) {\n        eventChecklistCreate(input: $input) { id }\n    }\n": types.EventChecklistCreateDocument,
    "\n    mutation EventChecklistUpdate($input: EventChecklistUpdateInput!) {\n        eventChecklistUpdate(input: $input) { id }\n    }\n": types.EventChecklistUpdateDocument,
    "\n    mutation EventChecklistCancel($id: ID!, $version: Int!) {\n        eventChecklistCancel(id: $id, version: $version) { id }\n    }\n": types.EventChecklistCancelDocument,
    "\n    mutation ChecklistAddFromTemplate($input: ChecklistAddFromTemplateInput!) {\n        checklistAddFromTemplate(input: $input) { id }\n    }\n": types.ChecklistAddFromTemplateDocument,
    "\n    mutation ChecklistItemCreate($input: ChecklistItemCreateInput!) {\n        checklistItemCreate(input: $input) { id }\n    }\n": types.ChecklistItemCreateDocument,
    "\n    mutation ChecklistItemUpdate($input: ChecklistItemUpdateInput!) {\n        checklistItemUpdate(input: $input) { id }\n    }\n": types.ChecklistItemUpdateDocument,
    "\n    mutation ChecklistItemSetState($input: ChecklistItemSetStateInput!) {\n        checklistItemSetState(input: $input) { id state }\n    }\n": types.ChecklistItemSetStateDocument,
    "\n    fragment ChecklistItemFields on ChecklistItem {\n        id\n        required\n        text { sv en }\n        state\n        stateChangedBy { displayName }\n        stateChangedAt\n        reason\n        owner { ...OwnerFields }\n        deadline\n        deadlineManual\n        overdue\n        comment\n        guideItem { id key type { ...GuideItemTypeFields } text { sv en } version }\n        defaultCapability { ...CapabilityFields }\n        logEntries { id number type status }\n        checklist { id kind chapterKey chapterTitle { sv en } name }\n        version\n    }\n": types.ChecklistItemFieldsFragmentDoc,
    "\n    query ChecklistTemplates($includeRetired: Boolean) {\n        checklistTemplates(includeRetired: $includeRetired) { id kind chapterKey chapterTitle { sv en } name { sv en } retired version items { id } }\n    }\n": types.ChecklistTemplatesDocument,
    "\n    query ChecklistTemplate($id: ID!) {\n        checklistTemplate(id: $id) {\n            id\n            kind\n            chapterKey\n            chapterTitle { sv en }\n            name { sv en }\n            retired\n            version\n            items {\n                id\n                position\n                text { sv en }\n                guideItemKey\n                guideItem { ...GuideItemFields }\n                defaultCapability { ...CapabilityFields }\n                deadline { kind amount weekday }\n                version\n            }\n            retiredItems {\n                id\n                position\n                text { sv en }\n                guideItemKey\n                guideItem { ...GuideItemFields }\n                defaultCapability { ...CapabilityFields }\n                deadline { kind amount weekday }\n                version\n            }\n        }\n    }\n": types.ChecklistTemplateDocument,
    "\n    query EventChecklistTemplates {\n        checklistTemplates { id kind name { sv en } }\n    }\n": types.EventChecklistTemplatesDocument,
    "\n    mutation ChecklistTemplateCreate($input: ChecklistTemplateCreateInput!) {\n        checklistTemplateCreate(input: $input) { id }\n    }\n": types.ChecklistTemplateCreateDocument,
    "\n    mutation ChecklistTemplateUpdate($input: ChecklistTemplateUpdateInput!) {\n        checklistTemplateUpdate(input: $input) { id }\n    }\n": types.ChecklistTemplateUpdateDocument,
    "\n    mutation ChecklistTemplateRetire($id: ID!, $version: Int!) {\n        checklistTemplateRetire(id: $id, version: $version) { id }\n    }\n": types.ChecklistTemplateRetireDocument,
    "\n    mutation ChecklistTemplateItemCreate($input: ChecklistTemplateItemCreateInput!) {\n        checklistTemplateItemCreate(input: $input) { id }\n    }\n": types.ChecklistTemplateItemCreateDocument,
    "\n    mutation ChecklistTemplateItemUpdate($input: ChecklistTemplateItemUpdateInput!) {\n        checklistTemplateItemUpdate(input: $input) { id }\n    }\n": types.ChecklistTemplateItemUpdateDocument,
    "\n    mutation ChecklistTemplateItemMove($id: ID!, $version: Int!, $position: Int!) {\n        checklistTemplateItemMove(id: $id, version: $version, position: $position) { id }\n    }\n": types.ChecklistTemplateItemMoveDocument,
    "\n    mutation ChecklistTemplateItemRetire($id: ID!, $version: Int!) {\n        checklistTemplateItemRetire(id: $id, version: $version) { id }\n    }\n": types.ChecklistTemplateItemRetireDocument,
    "\n    mutation ChecklistTemplateRestore($id: ID!, $version: Int!) {\n        checklistTemplateRestore(id: $id, version: $version) { id }\n    }\n": types.ChecklistTemplateRestoreDocument,
    "\n    mutation ChecklistTemplateItemRestore($id: ID!, $version: Int!) {\n        checklistTemplateItemRestore(id: $id, version: $version) { id }\n    }\n": types.ChecklistTemplateItemRestoreDocument,
    "\n    fragment OwnerFields on Owner {\n        name\n        person { id displayName active }\n    }\n": types.OwnerFieldsFragmentDoc,
    "\n    fragment LogEntryFields on LogEntry {\n        id\n        number\n        date\n        type\n        text\n        status\n        owner { ...OwnerFields }\n        deadline\n        overdue\n        comment\n        tags\n        meeting { id date title status }\n        guideItemKey\n        guideItem { id key type { ...GuideItemTypeFields } text { sv en } version }\n        checklistItem { id checklistId state text { sv en } }\n        answers { id number type status }\n        answeredBy { id number type status }\n        origin\n        createdBy\n        createdAt\n        version\n    }\n": types.LogEntryFieldsFragmentDoc,
    "\n    query RevivalLog($id: ID!, $filter: LogEntryFilter) {\n        revival(id: $id) {\n            id\n            title\n            year\n            status\n            permissions { canWriteLog canImportLog canWaiveRequirement }\n            ownerCandidates { id displayName }\n        }\n        logEntries(revivalId: $id, filter: $filter) { ...LogEntryFields }\n        logTags(revivalId: $id)\n        meetings(revivalId: $id) { id date title }\n    }\n": types.RevivalLogDocument,
    "\n    query RevivalLogImport($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            permissions { canImportLog canWaiveRequirement }\n        }\n        logImport(revivalId: $id) { fileName layout rowCount importedAt importedBy { displayName } }\n    }\n": types.RevivalLogImportDocument,
    "\n    mutation LogEntryCreate($input: LogEntryCreateInput!) {\n        logEntryCreate(input: $input) { ...LogEntryFields }\n    }\n": types.LogEntryCreateDocument,
    "\n    mutation LogEntryUpdate($input: LogEntryUpdateInput!) {\n        logEntryUpdate(input: $input) { ...LogEntryFields }\n    }\n": types.LogEntryUpdateDocument,
    "\n    mutation LogEntryAnswer($input: LogEntryAnswerInput!) {\n        logEntryAnswer(input: $input) {\n            question { ...LogEntryFields }\n            decision { ...LogEntryFields }\n        }\n    }\n": types.LogEntryAnswerDocument,
    "\n    fragment GuideItemFields on GuideItem {\n        id\n        key\n        type { ...GuideItemTypeFields }\n        text { sv en }\n        version\n    }\n": types.GuideItemFieldsFragmentDoc,
    "\n    fragment GuideVersionFields on GuideVersion {\n        id\n        status\n        label\n        note\n        publishedAt\n        publishedBy\n        version\n        basedOn { id label publishedAt }\n        introduction { sv en }\n        chapters {\n            id\n            key\n            title { sv en }\n            version\n            items { ...GuideItemFields }\n            sections {\n                id\n                key\n                title { sv en }\n                version\n                items { ...GuideItemFields }\n            }\n        }\n    }\n": types.GuideVersionFieldsFragmentDoc,
    "\n    query GuideVersions {\n        guideVersions { id label publishedAt }\n    }\n": types.GuideVersionsDocument,
    "\n    query GuideVersionsAdmin {\n        guideVersions { id label note publishedAt publishedBy revivalCount suggestionCount deletable version }\n    }\n": types.GuideVersionsAdminDocument,
    "\n    mutation GuideVersionDelete($id: ID!, $version: Int!) {\n        guideVersionDelete(id: $id, version: $version)\n    }\n": types.GuideVersionDeleteDocument,
    "\n    query GuideLatestVersion {\n        guideLatestVersion { ...GuideVersionFields }\n    }\n": types.GuideLatestVersionDocument,
    "\n    query GuideVersion($id: ID!) {\n        guideVersion(id: $id) { ...GuideVersionFields }\n    }\n": types.GuideVersionDocument,
    "\n    query RevivalGuide($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            year\n            status\n            guideVersion { id label publishedAt }\n            newerGuideVersion { id label publishedAt }\n            guideVersionHistory { fromLabel toLabel changedBy changedAt }\n            permissions { canSuggestGuideChange guideVersionsAllowed { id label publishedAt } }\n        }\n    }\n": types.RevivalGuideDocument,
    "\n    query GuideChanges($fromId: ID!, $toId: ID!) {\n        guideChanges(fromId: $fromId, toId: $toId) {\n            from { id label publishedAt }\n            to { id label publishedAt }\n            introductionChanged\n            chapters { key kind renamed moved before { sv en } after { sv en } }\n            sections {\n                key\n                kind\n                chapterBefore { key title { sv en } }\n                chapterAfter { key title { sv en } }\n                renamed\n                moved\n                reordered\n                before { sv en }\n                after { sv en }\n            }\n            items {\n                key\n                kind\n                reworded\n                retyped\n                moved\n                before { chapter { key title { sv en } } sectionKey sectionTitle { sv en } type { ...GuideItemTypeFields } text { sv en } }\n                after { chapter { key title { sv en } } sectionKey sectionTitle { sv en } type { ...GuideItemTypeFields } text { sv en } }\n            }\n        }\n    }\n": types.GuideChangesDocument,
    "\n    mutation RevivalGuideVersionChange($input: RevivalGuideVersionChangeInput!) {\n        revivalGuideVersionChange(input: $input) { id guideVersion { id label } }\n    }\n": types.RevivalGuideVersionChangeDocument,
    "\n    mutation GuideDraftStart {\n        guideDraftStart { draft { id } }\n    }\n": types.GuideDraftStartDocument,
    "\n    mutation GuideIntroductionUpdate($input: GuideIntroductionInput!) {\n        guideIntroductionUpdate(input: $input) { id version }\n    }\n": types.GuideIntroductionUpdateDocument,
    "\n    mutation GuideChapterCreate($input: GuideChapterCreateInput!) {\n        guideChapterCreate(input: $input) { id key }\n    }\n": types.GuideChapterCreateDocument,
    "\n    mutation GuideChapterMove($input: GuideChapterMoveInput!) {\n        guideChapterMove(input: $input) { id }\n    }\n": types.GuideChapterMoveDocument,
    "\n    mutation GuideChapterRemove($id: ID!, $version: Int!) {\n        guideChapterRemove(id: $id, version: $version)\n    }\n": types.GuideChapterRemoveDocument,
    "\n    query GuideChapterRemovalImpact($chapterKey: ID!) {\n        guideChapterRemovalImpact(chapterKey: $chapterKey) { chapterKey revivalCount itemCount doneCount }\n    }\n": types.GuideChapterRemovalImpactDocument,
    "\n    query RevivalGuideVersionChangeImpact($id: ID!, $toId: ID!) {\n        revival(id: $id) {\n            id\n            guideVersionChangeImpact(toId: $toId) { checklistId chapterKey chapterTitle { sv en } itemCount doneCount linkedLogEntryCount }\n        }\n    }\n": types.RevivalGuideVersionChangeImpactDocument,
    "\n    mutation GuideChapterUpdate($input: GuideChapterInput!) {\n        guideChapterUpdate(input: $input) { id version }\n    }\n": types.GuideChapterUpdateDocument,
    "\n    mutation GuideSectionCreate($input: GuideSectionCreateInput!) {\n        guideSectionCreate(input: $input) { id key }\n    }\n": types.GuideSectionCreateDocument,
    "\n    mutation GuideSectionUpdate($input: GuideSectionUpdateInput!) {\n        guideSectionUpdate(input: $input) { id version }\n    }\n": types.GuideSectionUpdateDocument,
    "\n    mutation GuideSectionMove($input: GuideSectionMoveInput!) {\n        guideSectionMove(input: $input) { id }\n    }\n": types.GuideSectionMoveDocument,
    "\n    mutation GuideSectionRemove($id: ID!, $version: Int!) {\n        guideSectionRemove(id: $id, version: $version)\n    }\n": types.GuideSectionRemoveDocument,
    "\n    mutation GuideItemCreate($input: GuideItemCreateInput!) {\n        guideItemCreate(input: $input) { id key }\n    }\n": types.GuideItemCreateDocument,
    "\n    mutation GuideItemUpdate($input: GuideItemUpdateInput!) {\n        guideItemUpdate(input: $input) { id version }\n    }\n": types.GuideItemUpdateDocument,
    "\n    mutation GuideItemMove($input: GuideItemMoveInput!) {\n        guideItemMove(input: $input) { id }\n    }\n": types.GuideItemMoveDocument,
    "\n    mutation GuideItemRemove($id: ID!, $version: Int!) {\n        guideItemRemove(id: $id, version: $version)\n    }\n": types.GuideItemRemoveDocument,
    "\n    query GuideSearch($versionId: ID, $query: String!) {\n        guideSearch(versionId: $versionId, query: $query) {\n            kind\n            chapterKey\n            chapterTitle { sv en }\n            sectionKey\n            sectionTitle { sv en }\n            itemKey\n            itemType { ...GuideItemTypeFields }\n            snippet\n            matchedLanguage\n        }\n    }\n": types.GuideSearchDocument,
    "\n    query GuideDraft {\n        guideDraft {\n            draft { ...GuideVersionFields }\n            acceptedSuggestionCount\n            untranslatedCount\n        }\n    }\n": types.GuideDraftDocument,
    "\n    mutation GuideDraftPublish($input: GuideDraftPublishInput!) {\n        guideDraftPublish(input: $input) { id label }\n    }\n": types.GuideDraftPublishDocument,
    "\n    mutation GuideDraftDiscard($id: ID!, $version: Int!) {\n        guideDraftDiscard(id: $id, version: $version)\n    }\n": types.GuideDraftDiscardDocument,
    "\n    fragment GuideSuggestionFields on GuideSuggestion {\n        id\n        kind\n        status\n        version\n        mine\n        author\n        chapterKey\n        chapterTitle { sv en }\n        sectionKey\n        itemKey\n        reason\n        decidedBy\n        decidedAt\n        decisionReason\n        reopenedAt\n        createdAt\n        proposedType { ...GuideItemTypeFields }\n        proposedText { sv en }\n        revival { id title year }\n        madeOn { id label }\n        publishedIn { id label }\n        item { chapter { key title { sv en } } sectionKey sectionTitle { sv en } type { ...GuideItemTypeFields } text { sv en } }\n    }\n": types.GuideSuggestionFieldsFragmentDoc,
    "\n    query GuideSuggestions($status: [GuideSuggestionStatus!], $revivalId: ID) {\n        guideSuggestions(status: $status, revivalId: $revivalId) { ...GuideSuggestionFields }\n    }\n": types.GuideSuggestionsDocument,
    "\n    mutation GuideSuggestionCreate($input: GuideSuggestionCreateInput!) {\n        guideSuggestionCreate(input: $input) { id }\n    }\n": types.GuideSuggestionCreateDocument,
    "\n    mutation GuideSuggestionAccept($input: GuideSuggestionAcceptInput!) {\n        guideSuggestionAccept(input: $input) { id status }\n    }\n": types.GuideSuggestionAcceptDocument,
    "\n    mutation GuideSuggestionReject($input: GuideSuggestionRejectInput!) {\n        guideSuggestionReject(input: $input) { id status }\n    }\n": types.GuideSuggestionRejectDocument,
    "\n    mutation GuideSuggestionWithdraw($id: ID!, $version: Int!) {\n        guideSuggestionWithdraw(id: $id, version: $version) { id status }\n    }\n": types.GuideSuggestionWithdrawDocument,
    "\n    query RevivalMeetings($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            permissions { canWriteLog }\n            ownerCandidates { id displayName }\n        }\n        meetings(revivalId: $id) { id date title status }\n    }\n": types.RevivalMeetingsDocument,
    "\n    query Meeting($id: ID!, $revivalId: ID!) {\n        revival(id: $revivalId) {\n            id\n            title\n            permissions { canWriteLog }\n            ownerCandidates { id displayName }\n        }\n        logTags(revivalId: $revivalId)\n        meeting(id: $id) {\n            id\n            revivalId\n            date\n            title\n            status\n            attendees { id displayName }\n            othersPresent\n            agendaPoints\n            recorder { id displayName }\n            startedAt\n            closedAt\n            canEmailMinutes\n            version\n            openEntries { ...LogEntryFields }\n            entries { ...LogEntryFields }\n            blockingEntries { id number type status }\n            minutes {\n                decisions { ...MinutesRowFields }\n                todos { ...MinutesRowFields }\n                questions { ...MinutesRowFields }\n                closed { ...MinutesRowFields }\n                agendaPoints\n                attendees { id displayName }\n                othersPresent\n                recorder { id displayName }\n            }\n            emails {\n                id\n                language\n                sentAt\n                sentBy { displayName }\n                waitingLeftOut\n                recipients { person { id displayName } status }\n            }\n        }\n    }\n": types.MeetingDocument,
    "\n    fragment MinutesRowFields on MinutesRow {\n        entryId\n        number\n        type\n        text\n        owner { ...OwnerFields }\n        deadline\n        status\n    }\n": types.MinutesRowFieldsFragmentDoc,
    "\n    mutation MeetingCreate($input: MeetingCreateInput!) {\n        meetingCreate(input: $input) { id }\n    }\n": types.MeetingCreateDocument,
    "\n    mutation MeetingUpdate($input: MeetingUpdateInput!) {\n        meetingUpdate(input: $input) { id }\n    }\n": types.MeetingUpdateDocument,
    "\n    mutation MeetingStart($id: ID!, $version: Int!) {\n        meetingStart(id: $id, version: $version) { id status }\n    }\n": types.MeetingStartDocument,
    "\n    mutation MeetingClose($id: ID!, $version: Int!) {\n        meetingClose(id: $id, version: $version) { id status }\n    }\n": types.MeetingCloseDocument,
    "\n    mutation MeetingCancel($id: ID!, $version: Int!) {\n        meetingCancel(id: $id, version: $version) { id status }\n    }\n": types.MeetingCancelDocument,
    "\n    mutation MinutesEmailSend($input: MinutesEmailSendInput!) {\n        minutesEmailSend(input: $input) { id waitingLeftOut recipients { person { id displayName } status } }\n    }\n": types.MinutesEmailSendDocument,
    "\n    mutation MinutesEmailRetry($emailId: ID!) {\n        minutesEmailRetry(emailId: $emailId) { id waitingLeftOut recipients { person { id displayName } status } }\n    }\n": types.MinutesEmailRetryDocument,
    "\n    query RevivalMemberCandidates($revivalId: ID!, $query: String!) {\n        revivalMemberCandidates(revivalId: $revivalId, query: $query) { email displayName hasAccess }\n    }\n": types.RevivalMemberCandidatesDocument,
    "\n    mutation RevivalMemberAdd($input: RevivalMemberAddInput!) {\n        revivalMemberAdd(input: $input) { id role capabilities { ...CapabilityFields } state displayName email invitedAt version }\n    }\n": types.RevivalMemberAddDocument,
    "\n    mutation RevivalMemberCapabilitiesSet($input: RevivalMemberCapabilitiesInput!) {\n        revivalMemberCapabilitiesSet(input: $input) { id capabilities { ...CapabilityFields } version }\n    }\n": types.RevivalMemberCapabilitiesSetDocument,
    "\n    mutation RevivalMemberRemove($id: ID!) {\n        revivalMemberRemove(id: $id)\n    }\n": types.RevivalMemberRemoveDocument,
    "\n    fragment RevivalSummary on Revival {\n        id\n        year\n        title\n        premiereDate\n        status\n        version\n        spex { id title year available }\n        members { id role state displayName email invitedAt }\n        permissions { canEditCore canEditDetails allowedStatuses canManageDirecteurs canManageSteeringGroup canDelete }\n    }\n": types.RevivalSummaryFragmentDoc,
    "\n    fragment RevivalDetail on Revival {\n        ...RevivalSummary\n        shows { date time venue }\n        createdBy\n        createdAt\n        lastModifiedBy\n        lastModifiedAt\n        members { id role capabilities { ...CapabilityFields } state displayName email version }\n        statusHistory { from to changedBy changedAt }\n        guideVersion { id label }\n    }\n": types.RevivalDetailFragmentDoc,
    "\n    query Me {\n        me {\n            id\n            displayName\n            email\n            globalRoles\n            revivalRoles { role capabilities { id } revival { id } }\n        }\n    }\n": types.MeDocument,
    "\n    query Revivals($status: [RevivalStatus!]) {\n        revivals(status: $status) { ...RevivalSummary }\n    }\n": types.RevivalsDocument,
    "\n    query Revival($id: ID!) {\n        revival(id: $id) { ...RevivalDetail }\n    }\n": types.RevivalDocument,
    "\n    query RevivalWorkSummary($id: ID!) {\n        revival(id: $id) {\n            id\n            workSummary { openEntries overdueEntries overdueChecklistItems openRequiredItems meetingInProgress { id title date } }\n        }\n    }\n": types.RevivalWorkSummaryDocument,
    "\n    mutation RevivalCreate($input: RevivalCreateInput!) {\n        revivalCreate(input: $input) { ...RevivalSummary }\n    }\n": types.RevivalCreateDocument,
    "\n    mutation RevivalUpdate($input: RevivalUpdateInput!) {\n        revivalUpdate(input: $input) { ...RevivalDetail }\n    }\n": types.RevivalUpdateDocument,
    "\n    mutation RevivalStatusChange($input: RevivalStatusChangeInput!) {\n        revivalStatusChange(input: $input) { ...RevivalSummary }\n    }\n": types.RevivalStatusChangeDocument,
    "\n    mutation RevivalDelete($id: ID!, $version: Int!) {\n        revivalDelete(id: $id, version: $version)\n    }\n": types.RevivalDeleteDocument,
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
export function graphql(source: "\n    query Capabilities($includeRetired: Boolean) {\n        capabilities(includeRetired: $includeRetired) { ...CapabilityFields position inUse version }\n    }\n"): (typeof documents)["\n    query Capabilities($includeRetired: Boolean) {\n        capabilities(includeRetired: $includeRetired) { ...CapabilityFields position inUse version }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation CapabilityCreate($input: CapabilityCreateInput!) {\n        capabilityCreate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation CapabilityCreate($input: CapabilityCreateInput!) {\n        capabilityCreate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation CapabilityUpdate($input: CapabilityUpdateInput!) {\n        capabilityUpdate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation CapabilityUpdate($input: CapabilityUpdateInput!) {\n        capabilityUpdate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation CapabilityMove($id: ID!, $version: Int!, $position: Int!) {\n        capabilityMove(id: $id, version: $version, position: $position) { id }\n    }\n"): (typeof documents)["\n    mutation CapabilityMove($id: ID!, $version: Int!, $position: Int!) {\n        capabilityMove(id: $id, version: $version, position: $position) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation CapabilityRetire($id: ID!, $version: Int!) {\n        capabilityRetire(id: $id, version: $version) { id }\n    }\n"): (typeof documents)["\n    mutation CapabilityRetire($id: ID!, $version: Int!) {\n        capabilityRetire(id: $id, version: $version) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation CapabilityRestore($id: ID!, $version: Int!) {\n        capabilityRestore(id: $id, version: $version) { id }\n    }\n"): (typeof documents)["\n    mutation CapabilityRestore($id: ID!, $version: Int!) {\n        capabilityRestore(id: $id, version: $version) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation CapabilityDelete($id: ID!, $version: Int!) {\n        capabilityDelete(id: $id, version: $version)\n    }\n"): (typeof documents)["\n    mutation CapabilityDelete($id: ID!, $version: Int!) {\n        capabilityDelete(id: $id, version: $version)\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GuideItemTypes($includeRetired: Boolean) {\n        guideItemTypes(includeRetired: $includeRetired) { ...GuideItemTypeFields position inUse version }\n    }\n"): (typeof documents)["\n    query GuideItemTypes($includeRetired: Boolean) {\n        guideItemTypes(includeRetired: $includeRetired) { ...GuideItemTypeFields position inUse version }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation GuideItemTypeCreate($input: GuideItemTypeCreateInput!) {\n        guideItemTypeCreate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation GuideItemTypeCreate($input: GuideItemTypeCreateInput!) {\n        guideItemTypeCreate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation GuideItemTypeUpdate($input: GuideItemTypeUpdateInput!) {\n        guideItemTypeUpdate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation GuideItemTypeUpdate($input: GuideItemTypeUpdateInput!) {\n        guideItemTypeUpdate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation GuideItemTypeMove($id: ID!, $version: Int!, $position: Int!) {\n        guideItemTypeMove(id: $id, version: $version, position: $position) { id }\n    }\n"): (typeof documents)["\n    mutation GuideItemTypeMove($id: ID!, $version: Int!, $position: Int!) {\n        guideItemTypeMove(id: $id, version: $version, position: $position) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation GuideItemTypeRetire($id: ID!, $version: Int!) {\n        guideItemTypeRetire(id: $id, version: $version) { id }\n    }\n"): (typeof documents)["\n    mutation GuideItemTypeRetire($id: ID!, $version: Int!) {\n        guideItemTypeRetire(id: $id, version: $version) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation GuideItemTypeRestore($id: ID!, $version: Int!) {\n        guideItemTypeRestore(id: $id, version: $version) { id }\n    }\n"): (typeof documents)["\n    mutation GuideItemTypeRestore($id: ID!, $version: Int!) {\n        guideItemTypeRestore(id: $id, version: $version) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation GuideItemTypeDelete($id: ID!, $version: Int!) {\n        guideItemTypeDelete(id: $id, version: $version)\n    }\n"): (typeof documents)["\n    mutation GuideItemTypeDelete($id: ID!, $version: Int!) {\n        guideItemTypeDelete(id: $id, version: $version)\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment CapabilityFields on Capability {\n        id\n        name { sv en }\n        retired\n    }\n"): (typeof documents)["\n    fragment CapabilityFields on Capability {\n        id\n        name { sv en }\n        retired\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment GuideItemTypeFields on GuideItemType {\n        id\n        kind\n        name { sv en }\n        retired\n    }\n"): (typeof documents)["\n    fragment GuideItemTypeFields on GuideItemType {\n        id\n        kind\n        name { sv en }\n        retired\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query RevivalChecklists($id: ID!, $filter: ChecklistItemFilter, $filtered: Boolean!, $includeCancelled: Boolean!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            permissions { canWriteLog }\n            ownerCandidates { id displayName }\n        }\n        checklists(revivalId: $id, includeCancelled: $includeCancelled) { id kind chapterKey chapterTitle { sv en } name date cancelled openCount overdueCount totalCount }\n        checklistItems(revivalId: $id, filter: $filter) @include(if: $filtered) { ...ChecklistItemFields }\n    }\n"): (typeof documents)["\n    query RevivalChecklists($id: ID!, $filter: ChecklistItemFilter, $filtered: Boolean!, $includeCancelled: Boolean!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            permissions { canWriteLog }\n            ownerCandidates { id displayName }\n        }\n        checklists(revivalId: $id, includeCancelled: $includeCancelled) { id kind chapterKey chapterTitle { sv en } name date cancelled openCount overdueCount totalCount }\n        checklistItems(revivalId: $id, filter: $filter) @include(if: $filtered) { ...ChecklistItemFields }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Checklist($id: ID!, $revivalId: ID!) {\n        revival(id: $revivalId) {\n            id\n            title\n            permissions { canWriteLog canWaiveRequirement }\n            ownerCandidates { id displayName }\n        }\n        checklist(id: $id) {\n            id\n            revivalId\n            kind\n            chapterKey\n            chapterTitle { sv en }\n            name\n            date\n            cancelled\n            version\n            template { id name { sv en } }\n            templatesAvailable { id kind chapterKey chapterTitle { sv en } name { sv en } }\n            tips { ...GuideItemFields }\n            items { ...ChecklistItemFields }\n        }\n    }\n"): (typeof documents)["\n    query Checklist($id: ID!, $revivalId: ID!) {\n        revival(id: $revivalId) {\n            id\n            title\n            permissions { canWriteLog canWaiveRequirement }\n            ownerCandidates { id displayName }\n        }\n        checklist(id: $id) {\n            id\n            revivalId\n            kind\n            chapterKey\n            chapterTitle { sv en }\n            name\n            date\n            cancelled\n            version\n            template { id name { sv en } }\n            templatesAvailable { id kind chapterKey chapterTitle { sv en } name { sv en } }\n            tips { ...GuideItemFields }\n            items { ...ChecklistItemFields }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation EventChecklistCreate($input: EventChecklistCreateInput!) {\n        eventChecklistCreate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation EventChecklistCreate($input: EventChecklistCreateInput!) {\n        eventChecklistCreate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation EventChecklistUpdate($input: EventChecklistUpdateInput!) {\n        eventChecklistUpdate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation EventChecklistUpdate($input: EventChecklistUpdateInput!) {\n        eventChecklistUpdate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation EventChecklistCancel($id: ID!, $version: Int!) {\n        eventChecklistCancel(id: $id, version: $version) { id }\n    }\n"): (typeof documents)["\n    mutation EventChecklistCancel($id: ID!, $version: Int!) {\n        eventChecklistCancel(id: $id, version: $version) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ChecklistAddFromTemplate($input: ChecklistAddFromTemplateInput!) {\n        checklistAddFromTemplate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation ChecklistAddFromTemplate($input: ChecklistAddFromTemplateInput!) {\n        checklistAddFromTemplate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ChecklistItemCreate($input: ChecklistItemCreateInput!) {\n        checklistItemCreate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation ChecklistItemCreate($input: ChecklistItemCreateInput!) {\n        checklistItemCreate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ChecklistItemUpdate($input: ChecklistItemUpdateInput!) {\n        checklistItemUpdate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation ChecklistItemUpdate($input: ChecklistItemUpdateInput!) {\n        checklistItemUpdate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ChecklistItemSetState($input: ChecklistItemSetStateInput!) {\n        checklistItemSetState(input: $input) { id state }\n    }\n"): (typeof documents)["\n    mutation ChecklistItemSetState($input: ChecklistItemSetStateInput!) {\n        checklistItemSetState(input: $input) { id state }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment ChecklistItemFields on ChecklistItem {\n        id\n        required\n        text { sv en }\n        state\n        stateChangedBy { displayName }\n        stateChangedAt\n        reason\n        owner { ...OwnerFields }\n        deadline\n        deadlineManual\n        overdue\n        comment\n        guideItem { id key type { ...GuideItemTypeFields } text { sv en } version }\n        defaultCapability { ...CapabilityFields }\n        logEntries { id number type status }\n        checklist { id kind chapterKey chapterTitle { sv en } name }\n        version\n    }\n"): (typeof documents)["\n    fragment ChecklistItemFields on ChecklistItem {\n        id\n        required\n        text { sv en }\n        state\n        stateChangedBy { displayName }\n        stateChangedAt\n        reason\n        owner { ...OwnerFields }\n        deadline\n        deadlineManual\n        overdue\n        comment\n        guideItem { id key type { ...GuideItemTypeFields } text { sv en } version }\n        defaultCapability { ...CapabilityFields }\n        logEntries { id number type status }\n        checklist { id kind chapterKey chapterTitle { sv en } name }\n        version\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query ChecklistTemplates($includeRetired: Boolean) {\n        checklistTemplates(includeRetired: $includeRetired) { id kind chapterKey chapterTitle { sv en } name { sv en } retired version items { id } }\n    }\n"): (typeof documents)["\n    query ChecklistTemplates($includeRetired: Boolean) {\n        checklistTemplates(includeRetired: $includeRetired) { id kind chapterKey chapterTitle { sv en } name { sv en } retired version items { id } }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query ChecklistTemplate($id: ID!) {\n        checklistTemplate(id: $id) {\n            id\n            kind\n            chapterKey\n            chapterTitle { sv en }\n            name { sv en }\n            retired\n            version\n            items {\n                id\n                position\n                text { sv en }\n                guideItemKey\n                guideItem { ...GuideItemFields }\n                defaultCapability { ...CapabilityFields }\n                deadline { kind amount weekday }\n                version\n            }\n            retiredItems {\n                id\n                position\n                text { sv en }\n                guideItemKey\n                guideItem { ...GuideItemFields }\n                defaultCapability { ...CapabilityFields }\n                deadline { kind amount weekday }\n                version\n            }\n        }\n    }\n"): (typeof documents)["\n    query ChecklistTemplate($id: ID!) {\n        checklistTemplate(id: $id) {\n            id\n            kind\n            chapterKey\n            chapterTitle { sv en }\n            name { sv en }\n            retired\n            version\n            items {\n                id\n                position\n                text { sv en }\n                guideItemKey\n                guideItem { ...GuideItemFields }\n                defaultCapability { ...CapabilityFields }\n                deadline { kind amount weekday }\n                version\n            }\n            retiredItems {\n                id\n                position\n                text { sv en }\n                guideItemKey\n                guideItem { ...GuideItemFields }\n                defaultCapability { ...CapabilityFields }\n                deadline { kind amount weekday }\n                version\n            }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query EventChecklistTemplates {\n        checklistTemplates { id kind name { sv en } }\n    }\n"): (typeof documents)["\n    query EventChecklistTemplates {\n        checklistTemplates { id kind name { sv en } }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ChecklistTemplateCreate($input: ChecklistTemplateCreateInput!) {\n        checklistTemplateCreate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation ChecklistTemplateCreate($input: ChecklistTemplateCreateInput!) {\n        checklistTemplateCreate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ChecklistTemplateUpdate($input: ChecklistTemplateUpdateInput!) {\n        checklistTemplateUpdate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation ChecklistTemplateUpdate($input: ChecklistTemplateUpdateInput!) {\n        checklistTemplateUpdate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ChecklistTemplateRetire($id: ID!, $version: Int!) {\n        checklistTemplateRetire(id: $id, version: $version) { id }\n    }\n"): (typeof documents)["\n    mutation ChecklistTemplateRetire($id: ID!, $version: Int!) {\n        checklistTemplateRetire(id: $id, version: $version) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ChecklistTemplateItemCreate($input: ChecklistTemplateItemCreateInput!) {\n        checklistTemplateItemCreate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation ChecklistTemplateItemCreate($input: ChecklistTemplateItemCreateInput!) {\n        checklistTemplateItemCreate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ChecklistTemplateItemUpdate($input: ChecklistTemplateItemUpdateInput!) {\n        checklistTemplateItemUpdate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation ChecklistTemplateItemUpdate($input: ChecklistTemplateItemUpdateInput!) {\n        checklistTemplateItemUpdate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ChecklistTemplateItemMove($id: ID!, $version: Int!, $position: Int!) {\n        checklistTemplateItemMove(id: $id, version: $version, position: $position) { id }\n    }\n"): (typeof documents)["\n    mutation ChecklistTemplateItemMove($id: ID!, $version: Int!, $position: Int!) {\n        checklistTemplateItemMove(id: $id, version: $version, position: $position) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ChecklistTemplateItemRetire($id: ID!, $version: Int!) {\n        checklistTemplateItemRetire(id: $id, version: $version) { id }\n    }\n"): (typeof documents)["\n    mutation ChecklistTemplateItemRetire($id: ID!, $version: Int!) {\n        checklistTemplateItemRetire(id: $id, version: $version) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ChecklistTemplateRestore($id: ID!, $version: Int!) {\n        checklistTemplateRestore(id: $id, version: $version) { id }\n    }\n"): (typeof documents)["\n    mutation ChecklistTemplateRestore($id: ID!, $version: Int!) {\n        checklistTemplateRestore(id: $id, version: $version) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ChecklistTemplateItemRestore($id: ID!, $version: Int!) {\n        checklistTemplateItemRestore(id: $id, version: $version) { id }\n    }\n"): (typeof documents)["\n    mutation ChecklistTemplateItemRestore($id: ID!, $version: Int!) {\n        checklistTemplateItemRestore(id: $id, version: $version) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment OwnerFields on Owner {\n        name\n        person { id displayName active }\n    }\n"): (typeof documents)["\n    fragment OwnerFields on Owner {\n        name\n        person { id displayName active }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment LogEntryFields on LogEntry {\n        id\n        number\n        date\n        type\n        text\n        status\n        owner { ...OwnerFields }\n        deadline\n        overdue\n        comment\n        tags\n        meeting { id date title status }\n        guideItemKey\n        guideItem { id key type { ...GuideItemTypeFields } text { sv en } version }\n        checklistItem { id checklistId state text { sv en } }\n        answers { id number type status }\n        answeredBy { id number type status }\n        origin\n        createdBy\n        createdAt\n        version\n    }\n"): (typeof documents)["\n    fragment LogEntryFields on LogEntry {\n        id\n        number\n        date\n        type\n        text\n        status\n        owner { ...OwnerFields }\n        deadline\n        overdue\n        comment\n        tags\n        meeting { id date title status }\n        guideItemKey\n        guideItem { id key type { ...GuideItemTypeFields } text { sv en } version }\n        checklistItem { id checklistId state text { sv en } }\n        answers { id number type status }\n        answeredBy { id number type status }\n        origin\n        createdBy\n        createdAt\n        version\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query RevivalLog($id: ID!, $filter: LogEntryFilter) {\n        revival(id: $id) {\n            id\n            title\n            year\n            status\n            permissions { canWriteLog canImportLog canWaiveRequirement }\n            ownerCandidates { id displayName }\n        }\n        logEntries(revivalId: $id, filter: $filter) { ...LogEntryFields }\n        logTags(revivalId: $id)\n        meetings(revivalId: $id) { id date title }\n    }\n"): (typeof documents)["\n    query RevivalLog($id: ID!, $filter: LogEntryFilter) {\n        revival(id: $id) {\n            id\n            title\n            year\n            status\n            permissions { canWriteLog canImportLog canWaiveRequirement }\n            ownerCandidates { id displayName }\n        }\n        logEntries(revivalId: $id, filter: $filter) { ...LogEntryFields }\n        logTags(revivalId: $id)\n        meetings(revivalId: $id) { id date title }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query RevivalLogImport($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            permissions { canImportLog canWaiveRequirement }\n        }\n        logImport(revivalId: $id) { fileName layout rowCount importedAt importedBy { displayName } }\n    }\n"): (typeof documents)["\n    query RevivalLogImport($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            permissions { canImportLog canWaiveRequirement }\n        }\n        logImport(revivalId: $id) { fileName layout rowCount importedAt importedBy { displayName } }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation LogEntryCreate($input: LogEntryCreateInput!) {\n        logEntryCreate(input: $input) { ...LogEntryFields }\n    }\n"): (typeof documents)["\n    mutation LogEntryCreate($input: LogEntryCreateInput!) {\n        logEntryCreate(input: $input) { ...LogEntryFields }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation LogEntryUpdate($input: LogEntryUpdateInput!) {\n        logEntryUpdate(input: $input) { ...LogEntryFields }\n    }\n"): (typeof documents)["\n    mutation LogEntryUpdate($input: LogEntryUpdateInput!) {\n        logEntryUpdate(input: $input) { ...LogEntryFields }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation LogEntryAnswer($input: LogEntryAnswerInput!) {\n        logEntryAnswer(input: $input) {\n            question { ...LogEntryFields }\n            decision { ...LogEntryFields }\n        }\n    }\n"): (typeof documents)["\n    mutation LogEntryAnswer($input: LogEntryAnswerInput!) {\n        logEntryAnswer(input: $input) {\n            question { ...LogEntryFields }\n            decision { ...LogEntryFields }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment GuideItemFields on GuideItem {\n        id\n        key\n        type { ...GuideItemTypeFields }\n        text { sv en }\n        version\n    }\n"): (typeof documents)["\n    fragment GuideItemFields on GuideItem {\n        id\n        key\n        type { ...GuideItemTypeFields }\n        text { sv en }\n        version\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment GuideVersionFields on GuideVersion {\n        id\n        status\n        label\n        note\n        publishedAt\n        publishedBy\n        version\n        basedOn { id label publishedAt }\n        introduction { sv en }\n        chapters {\n            id\n            key\n            title { sv en }\n            version\n            items { ...GuideItemFields }\n            sections {\n                id\n                key\n                title { sv en }\n                version\n                items { ...GuideItemFields }\n            }\n        }\n    }\n"): (typeof documents)["\n    fragment GuideVersionFields on GuideVersion {\n        id\n        status\n        label\n        note\n        publishedAt\n        publishedBy\n        version\n        basedOn { id label publishedAt }\n        introduction { sv en }\n        chapters {\n            id\n            key\n            title { sv en }\n            version\n            items { ...GuideItemFields }\n            sections {\n                id\n                key\n                title { sv en }\n                version\n                items { ...GuideItemFields }\n            }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GuideVersions {\n        guideVersions { id label publishedAt }\n    }\n"): (typeof documents)["\n    query GuideVersions {\n        guideVersions { id label publishedAt }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GuideVersionsAdmin {\n        guideVersions { id label note publishedAt publishedBy revivalCount suggestionCount deletable version }\n    }\n"): (typeof documents)["\n    query GuideVersionsAdmin {\n        guideVersions { id label note publishedAt publishedBy revivalCount suggestionCount deletable version }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation GuideVersionDelete($id: ID!, $version: Int!) {\n        guideVersionDelete(id: $id, version: $version)\n    }\n"): (typeof documents)["\n    mutation GuideVersionDelete($id: ID!, $version: Int!) {\n        guideVersionDelete(id: $id, version: $version)\n    }\n"];
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
export function graphql(source: "\n    query RevivalGuide($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            year\n            status\n            guideVersion { id label publishedAt }\n            newerGuideVersion { id label publishedAt }\n            guideVersionHistory { fromLabel toLabel changedBy changedAt }\n            permissions { canSuggestGuideChange guideVersionsAllowed { id label publishedAt } }\n        }\n    }\n"): (typeof documents)["\n    query RevivalGuide($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            year\n            status\n            guideVersion { id label publishedAt }\n            newerGuideVersion { id label publishedAt }\n            guideVersionHistory { fromLabel toLabel changedBy changedAt }\n            permissions { canSuggestGuideChange guideVersionsAllowed { id label publishedAt } }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GuideChanges($fromId: ID!, $toId: ID!) {\n        guideChanges(fromId: $fromId, toId: $toId) {\n            from { id label publishedAt }\n            to { id label publishedAt }\n            introductionChanged\n            chapters { key kind renamed moved before { sv en } after { sv en } }\n            sections {\n                key\n                kind\n                chapterBefore { key title { sv en } }\n                chapterAfter { key title { sv en } }\n                renamed\n                moved\n                reordered\n                before { sv en }\n                after { sv en }\n            }\n            items {\n                key\n                kind\n                reworded\n                retyped\n                moved\n                before { chapter { key title { sv en } } sectionKey sectionTitle { sv en } type { ...GuideItemTypeFields } text { sv en } }\n                after { chapter { key title { sv en } } sectionKey sectionTitle { sv en } type { ...GuideItemTypeFields } text { sv en } }\n            }\n        }\n    }\n"): (typeof documents)["\n    query GuideChanges($fromId: ID!, $toId: ID!) {\n        guideChanges(fromId: $fromId, toId: $toId) {\n            from { id label publishedAt }\n            to { id label publishedAt }\n            introductionChanged\n            chapters { key kind renamed moved before { sv en } after { sv en } }\n            sections {\n                key\n                kind\n                chapterBefore { key title { sv en } }\n                chapterAfter { key title { sv en } }\n                renamed\n                moved\n                reordered\n                before { sv en }\n                after { sv en }\n            }\n            items {\n                key\n                kind\n                reworded\n                retyped\n                moved\n                before { chapter { key title { sv en } } sectionKey sectionTitle { sv en } type { ...GuideItemTypeFields } text { sv en } }\n                after { chapter { key title { sv en } } sectionKey sectionTitle { sv en } type { ...GuideItemTypeFields } text { sv en } }\n            }\n        }\n    }\n"];
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
export function graphql(source: "\n    mutation GuideChapterCreate($input: GuideChapterCreateInput!) {\n        guideChapterCreate(input: $input) { id key }\n    }\n"): (typeof documents)["\n    mutation GuideChapterCreate($input: GuideChapterCreateInput!) {\n        guideChapterCreate(input: $input) { id key }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation GuideChapterMove($input: GuideChapterMoveInput!) {\n        guideChapterMove(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation GuideChapterMove($input: GuideChapterMoveInput!) {\n        guideChapterMove(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation GuideChapterRemove($id: ID!, $version: Int!) {\n        guideChapterRemove(id: $id, version: $version)\n    }\n"): (typeof documents)["\n    mutation GuideChapterRemove($id: ID!, $version: Int!) {\n        guideChapterRemove(id: $id, version: $version)\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GuideChapterRemovalImpact($chapterKey: ID!) {\n        guideChapterRemovalImpact(chapterKey: $chapterKey) { chapterKey revivalCount itemCount doneCount }\n    }\n"): (typeof documents)["\n    query GuideChapterRemovalImpact($chapterKey: ID!) {\n        guideChapterRemovalImpact(chapterKey: $chapterKey) { chapterKey revivalCount itemCount doneCount }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query RevivalGuideVersionChangeImpact($id: ID!, $toId: ID!) {\n        revival(id: $id) {\n            id\n            guideVersionChangeImpact(toId: $toId) { checklistId chapterKey chapterTitle { sv en } itemCount doneCount linkedLogEntryCount }\n        }\n    }\n"): (typeof documents)["\n    query RevivalGuideVersionChangeImpact($id: ID!, $toId: ID!) {\n        revival(id: $id) {\n            id\n            guideVersionChangeImpact(toId: $toId) { checklistId chapterKey chapterTitle { sv en } itemCount doneCount linkedLogEntryCount }\n        }\n    }\n"];
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
export function graphql(source: "\n    query GuideSearch($versionId: ID, $query: String!) {\n        guideSearch(versionId: $versionId, query: $query) {\n            kind\n            chapterKey\n            chapterTitle { sv en }\n            sectionKey\n            sectionTitle { sv en }\n            itemKey\n            itemType { ...GuideItemTypeFields }\n            snippet\n            matchedLanguage\n        }\n    }\n"): (typeof documents)["\n    query GuideSearch($versionId: ID, $query: String!) {\n        guideSearch(versionId: $versionId, query: $query) {\n            kind\n            chapterKey\n            chapterTitle { sv en }\n            sectionKey\n            sectionTitle { sv en }\n            itemKey\n            itemType { ...GuideItemTypeFields }\n            snippet\n            matchedLanguage\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GuideDraft {\n        guideDraft {\n            draft { ...GuideVersionFields }\n            acceptedSuggestionCount\n            untranslatedCount\n        }\n    }\n"): (typeof documents)["\n    query GuideDraft {\n        guideDraft {\n            draft { ...GuideVersionFields }\n            acceptedSuggestionCount\n            untranslatedCount\n        }\n    }\n"];
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
export function graphql(source: "\n    fragment GuideSuggestionFields on GuideSuggestion {\n        id\n        kind\n        status\n        version\n        mine\n        author\n        chapterKey\n        chapterTitle { sv en }\n        sectionKey\n        itemKey\n        reason\n        decidedBy\n        decidedAt\n        decisionReason\n        reopenedAt\n        createdAt\n        proposedType { ...GuideItemTypeFields }\n        proposedText { sv en }\n        revival { id title year }\n        madeOn { id label }\n        publishedIn { id label }\n        item { chapter { key title { sv en } } sectionKey sectionTitle { sv en } type { ...GuideItemTypeFields } text { sv en } }\n    }\n"): (typeof documents)["\n    fragment GuideSuggestionFields on GuideSuggestion {\n        id\n        kind\n        status\n        version\n        mine\n        author\n        chapterKey\n        chapterTitle { sv en }\n        sectionKey\n        itemKey\n        reason\n        decidedBy\n        decidedAt\n        decisionReason\n        reopenedAt\n        createdAt\n        proposedType { ...GuideItemTypeFields }\n        proposedText { sv en }\n        revival { id title year }\n        madeOn { id label }\n        publishedIn { id label }\n        item { chapter { key title { sv en } } sectionKey sectionTitle { sv en } type { ...GuideItemTypeFields } text { sv en } }\n    }\n"];
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
export function graphql(source: "\n    query RevivalMeetings($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            permissions { canWriteLog }\n            ownerCandidates { id displayName }\n        }\n        meetings(revivalId: $id) { id date title status }\n    }\n"): (typeof documents)["\n    query RevivalMeetings($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            permissions { canWriteLog }\n            ownerCandidates { id displayName }\n        }\n        meetings(revivalId: $id) { id date title status }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Meeting($id: ID!, $revivalId: ID!) {\n        revival(id: $revivalId) {\n            id\n            title\n            permissions { canWriteLog }\n            ownerCandidates { id displayName }\n        }\n        logTags(revivalId: $revivalId)\n        meeting(id: $id) {\n            id\n            revivalId\n            date\n            title\n            status\n            attendees { id displayName }\n            othersPresent\n            agendaPoints\n            recorder { id displayName }\n            startedAt\n            closedAt\n            canEmailMinutes\n            version\n            openEntries { ...LogEntryFields }\n            entries { ...LogEntryFields }\n            blockingEntries { id number type status }\n            minutes {\n                decisions { ...MinutesRowFields }\n                todos { ...MinutesRowFields }\n                questions { ...MinutesRowFields }\n                closed { ...MinutesRowFields }\n                agendaPoints\n                attendees { id displayName }\n                othersPresent\n                recorder { id displayName }\n            }\n            emails {\n                id\n                language\n                sentAt\n                sentBy { displayName }\n                waitingLeftOut\n                recipients { person { id displayName } status }\n            }\n        }\n    }\n"): (typeof documents)["\n    query Meeting($id: ID!, $revivalId: ID!) {\n        revival(id: $revivalId) {\n            id\n            title\n            permissions { canWriteLog }\n            ownerCandidates { id displayName }\n        }\n        logTags(revivalId: $revivalId)\n        meeting(id: $id) {\n            id\n            revivalId\n            date\n            title\n            status\n            attendees { id displayName }\n            othersPresent\n            agendaPoints\n            recorder { id displayName }\n            startedAt\n            closedAt\n            canEmailMinutes\n            version\n            openEntries { ...LogEntryFields }\n            entries { ...LogEntryFields }\n            blockingEntries { id number type status }\n            minutes {\n                decisions { ...MinutesRowFields }\n                todos { ...MinutesRowFields }\n                questions { ...MinutesRowFields }\n                closed { ...MinutesRowFields }\n                agendaPoints\n                attendees { id displayName }\n                othersPresent\n                recorder { id displayName }\n            }\n            emails {\n                id\n                language\n                sentAt\n                sentBy { displayName }\n                waitingLeftOut\n                recipients { person { id displayName } status }\n            }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment MinutesRowFields on MinutesRow {\n        entryId\n        number\n        type\n        text\n        owner { ...OwnerFields }\n        deadline\n        status\n    }\n"): (typeof documents)["\n    fragment MinutesRowFields on MinutesRow {\n        entryId\n        number\n        type\n        text\n        owner { ...OwnerFields }\n        deadline\n        status\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation MeetingCreate($input: MeetingCreateInput!) {\n        meetingCreate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation MeetingCreate($input: MeetingCreateInput!) {\n        meetingCreate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation MeetingUpdate($input: MeetingUpdateInput!) {\n        meetingUpdate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation MeetingUpdate($input: MeetingUpdateInput!) {\n        meetingUpdate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation MeetingStart($id: ID!, $version: Int!) {\n        meetingStart(id: $id, version: $version) { id status }\n    }\n"): (typeof documents)["\n    mutation MeetingStart($id: ID!, $version: Int!) {\n        meetingStart(id: $id, version: $version) { id status }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation MeetingClose($id: ID!, $version: Int!) {\n        meetingClose(id: $id, version: $version) { id status }\n    }\n"): (typeof documents)["\n    mutation MeetingClose($id: ID!, $version: Int!) {\n        meetingClose(id: $id, version: $version) { id status }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation MeetingCancel($id: ID!, $version: Int!) {\n        meetingCancel(id: $id, version: $version) { id status }\n    }\n"): (typeof documents)["\n    mutation MeetingCancel($id: ID!, $version: Int!) {\n        meetingCancel(id: $id, version: $version) { id status }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation MinutesEmailSend($input: MinutesEmailSendInput!) {\n        minutesEmailSend(input: $input) { id waitingLeftOut recipients { person { id displayName } status } }\n    }\n"): (typeof documents)["\n    mutation MinutesEmailSend($input: MinutesEmailSendInput!) {\n        minutesEmailSend(input: $input) { id waitingLeftOut recipients { person { id displayName } status } }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation MinutesEmailRetry($emailId: ID!) {\n        minutesEmailRetry(emailId: $emailId) { id waitingLeftOut recipients { person { id displayName } status } }\n    }\n"): (typeof documents)["\n    mutation MinutesEmailRetry($emailId: ID!) {\n        minutesEmailRetry(emailId: $emailId) { id waitingLeftOut recipients { person { id displayName } status } }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query RevivalMemberCandidates($revivalId: ID!, $query: String!) {\n        revivalMemberCandidates(revivalId: $revivalId, query: $query) { email displayName hasAccess }\n    }\n"): (typeof documents)["\n    query RevivalMemberCandidates($revivalId: ID!, $query: String!) {\n        revivalMemberCandidates(revivalId: $revivalId, query: $query) { email displayName hasAccess }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation RevivalMemberAdd($input: RevivalMemberAddInput!) {\n        revivalMemberAdd(input: $input) { id role capabilities { ...CapabilityFields } state displayName email invitedAt version }\n    }\n"): (typeof documents)["\n    mutation RevivalMemberAdd($input: RevivalMemberAddInput!) {\n        revivalMemberAdd(input: $input) { id role capabilities { ...CapabilityFields } state displayName email invitedAt version }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation RevivalMemberCapabilitiesSet($input: RevivalMemberCapabilitiesInput!) {\n        revivalMemberCapabilitiesSet(input: $input) { id capabilities { ...CapabilityFields } version }\n    }\n"): (typeof documents)["\n    mutation RevivalMemberCapabilitiesSet($input: RevivalMemberCapabilitiesInput!) {\n        revivalMemberCapabilitiesSet(input: $input) { id capabilities { ...CapabilityFields } version }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation RevivalMemberRemove($id: ID!) {\n        revivalMemberRemove(id: $id)\n    }\n"): (typeof documents)["\n    mutation RevivalMemberRemove($id: ID!) {\n        revivalMemberRemove(id: $id)\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment RevivalSummary on Revival {\n        id\n        year\n        title\n        premiereDate\n        status\n        version\n        spex { id title year available }\n        members { id role state displayName email invitedAt }\n        permissions { canEditCore canEditDetails allowedStatuses canManageDirecteurs canManageSteeringGroup canDelete }\n    }\n"): (typeof documents)["\n    fragment RevivalSummary on Revival {\n        id\n        year\n        title\n        premiereDate\n        status\n        version\n        spex { id title year available }\n        members { id role state displayName email invitedAt }\n        permissions { canEditCore canEditDetails allowedStatuses canManageDirecteurs canManageSteeringGroup canDelete }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment RevivalDetail on Revival {\n        ...RevivalSummary\n        shows { date time venue }\n        createdBy\n        createdAt\n        lastModifiedBy\n        lastModifiedAt\n        members { id role capabilities { ...CapabilityFields } state displayName email version }\n        statusHistory { from to changedBy changedAt }\n        guideVersion { id label }\n    }\n"): (typeof documents)["\n    fragment RevivalDetail on Revival {\n        ...RevivalSummary\n        shows { date time venue }\n        createdBy\n        createdAt\n        lastModifiedBy\n        lastModifiedAt\n        members { id role capabilities { ...CapabilityFields } state displayName email version }\n        statusHistory { from to changedBy changedAt }\n        guideVersion { id label }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Me {\n        me {\n            id\n            displayName\n            email\n            globalRoles\n            revivalRoles { role capabilities { id } revival { id } }\n        }\n    }\n"): (typeof documents)["\n    query Me {\n        me {\n            id\n            displayName\n            email\n            globalRoles\n            revivalRoles { role capabilities { id } revival { id } }\n        }\n    }\n"];
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
export function graphql(source: "\n    query RevivalWorkSummary($id: ID!) {\n        revival(id: $id) {\n            id\n            workSummary { openEntries overdueEntries overdueChecklistItems openRequiredItems meetingInProgress { id title date } }\n        }\n    }\n"): (typeof documents)["\n    query RevivalWorkSummary($id: ID!) {\n        revival(id: $id) {\n            id\n            workSummary { openEntries overdueEntries overdueChecklistItems openRequiredItems meetingInProgress { id title date } }\n        }\n    }\n"];
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
export function graphql(source: "\n    mutation RevivalDelete($id: ID!, $version: Int!) {\n        revivalDelete(id: $id, version: $version)\n    }\n"): (typeof documents)["\n    mutation RevivalDelete($id: ID!, $version: Int!) {\n        revivalDelete(id: $id, version: $version)\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query SpexSearch($query: String!, $first: Int) {\n        spexSearch(query: $query, first: $first) { id title year available }\n    }\n"): (typeof documents)["\n    query SpexSearch($query: String!, $first: Int) {\n        spexSearch(query: $query, first: $first) { id title year available }\n    }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;