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
    "\n    query Revisions($type: AuditedType!, $id: ID!) {\n        revisions(type: $type, id: $id) {\n            revision\n            revisionType\n            modifiedAt\n            modifiedBy\n            source\n            comment\n            changes { field kind oldValue newValue }\n        }\n    }\n": typeof types.RevisionsDocument,
    "\n    query BudgetAccess($id: ID!) {\n        revival(id: $id) {\n            id\n            status\n            permissions { canReadBudget canWriteBudget }\n        }\n    }\n": typeof types.BudgetAccessDocument,
    "\n    query BudgetOverview($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            permissions { canReadBudget canWriteBudget }\n            budget {\n                revivalId\n                settings { participantsPlanned participationFee loanAmount loanReceivedOn loanRepaidOn version }\n                totals {\n                    budgetedIncome budgetedCost budgetedResult actualIncome actualCost actualResult\n                    unreimbursed unreimbursedCount missingReceipts\n                }\n                categories {\n                    category { ...BudgetCategoryFields }\n                    budgeted\n                    actual\n                    references { label year participants budgeted actual budgetedPerParticipant actualPerParticipant }\n                }\n            }\n        }\n    }\n": typeof types.BudgetOverviewDocument,
    "\n    query BudgetLines($id: ID!, $includeRemoved: Boolean!) {\n        revival(id: $id) {\n            id\n            status\n            permissions { canReadBudget canWriteBudget }\n            budget {\n                revivalId\n                settings { participantsPlanned version }\n                lines(includeRemoved: $includeRemoved) { ...BudgetLineFields }\n                proposals {\n                    event { id title startDate endDate }\n                    line { ...EventTypeBudgetLineFields }\n                    quantity\n                    amount\n                }\n            }\n        }\n        events(revivalId: $id) { id title startDate endDate }\n        logEntries(revivalId: $id, filter: {types: [DECISION]}) { id number text date }\n        budgetCategories { ...BudgetCategoryFields }\n    }\n": typeof types.BudgetLinesDocument,
    "\n    query BudgetTransactions($id: ID!, $includeCancelled: Boolean!) {\n        revival(id: $id) {\n            id\n            status\n            permissions { canReadBudget canWriteBudget }\n            ownerCandidates { id displayName }\n            budget {\n                revivalId\n                transactions(includeCancelled: $includeCancelled) { ...TransactionFields }\n                lines { id description category { id } }\n            }\n        }\n        budgetCategories { ...BudgetCategoryFields }\n    }\n": typeof types.BudgetTransactionsDocument,
    "\n    query BudgetScenarios($id: ID!) {\n        revival(id: $id) {\n            id\n            status\n            permissions { canReadBudget canWriteBudget }\n            budget {\n                revivalId\n                scenarios {\n                    id\n                    name\n                    parameters { ...BudgetScenarioParametersFields }\n                    result { ...BudgetScenarioResultFields }\n                    version\n                }\n            }\n        }\n        budgetScenarioCalculate(revivalId: $id, input: {}) { ...BudgetScenarioResultFields }\n    }\n": typeof types.BudgetScenariosDocument,
    "\n    query RevivalBudgetSummary($id: ID!) {\n        revival(id: $id) {\n            id\n            budget {\n                revivalId\n                totals { budgetedIncome budgetedCost budgetedResult actualIncome actualCost actualResult }\n            }\n        }\n    }\n": typeof types.RevivalBudgetSummaryDocument,
    "\n    query BudgetScenarioCalculate($revivalId: ID!, $input: BudgetScenarioInput!) {\n        budgetScenarioCalculate(revivalId: $revivalId, input: $input) { ...BudgetScenarioResultFields }\n    }\n": typeof types.BudgetScenarioCalculateDocument,
    "\n    mutation BudgetSettingsUpdate($input: BudgetSettingsInput!) {\n        budgetSettingsUpdate(input: $input) { revivalId }\n    }\n": typeof types.BudgetSettingsUpdateDocument,
    "\n    mutation BudgetLineCreate($input: BudgetLineCreateInput!) {\n        budgetLineCreate(input: $input) { id }\n    }\n": typeof types.BudgetLineCreateDocument,
    "\n    mutation BudgetLineUpdate($input: BudgetLineUpdateInput!) {\n        budgetLineUpdate(input: $input) { id }\n    }\n": typeof types.BudgetLineUpdateDocument,
    "\n    mutation BudgetLineRemove($id: ID!, $version: Int!) {\n        budgetLineRemove(id: $id, version: $version) { id }\n    }\n": typeof types.BudgetLineRemoveDocument,
    "\n    mutation BudgetLineRestore($id: ID!, $version: Int!) {\n        budgetLineRestore(id: $id, version: $version) { id }\n    }\n": typeof types.BudgetLineRestoreDocument,
    "\n    mutation TransactionCreate($input: TransactionCreateInput!) {\n        transactionCreate(input: $input) { id }\n    }\n": typeof types.TransactionCreateDocument,
    "\n    mutation TransactionUpdate($input: TransactionUpdateInput!) {\n        transactionUpdate(input: $input) { id }\n    }\n": typeof types.TransactionUpdateDocument,
    "\n    mutation TransactionCancel($id: ID!, $version: Int!) {\n        transactionCancel(id: $id, version: $version) { id }\n    }\n": typeof types.TransactionCancelDocument,
    "\n    mutation TransactionSetReimbursed($id: ID!, $version: Int!, $reimbursed: Boolean!) {\n        transactionSetReimbursed(id: $id, version: $version, reimbursed: $reimbursed) { id }\n    }\n": typeof types.TransactionSetReimbursedDocument,
    "\n    mutation BudgetScenarioSave($input: BudgetScenarioSaveInput!) {\n        budgetScenarioSave(input: $input) { id }\n    }\n": typeof types.BudgetScenarioSaveDocument,
    "\n    mutation BudgetScenarioUpdate($id: ID!, $version: Int!, $input: BudgetScenarioSaveInput!) {\n        budgetScenarioUpdate(id: $id, version: $version, input: $input) { id }\n    }\n": typeof types.BudgetScenarioUpdateDocument,
    "\n    mutation BudgetScenarioRemove($id: ID!, $version: Int!) {\n        budgetScenarioRemove(id: $id, version: $version)\n    }\n": typeof types.BudgetScenarioRemoveDocument,
    "\n    fragment BudgetCategoryFields on BudgetCategory {\n        id\n        kind\n        role\n        name { sv en }\n        retired\n    }\n": typeof types.BudgetCategoryFieldsFragmentDoc,
    "\n    fragment BudgetLineFields on BudgetLine {\n        id\n        category { ...BudgetCategoryFields }\n        description\n        quantity\n        unitAmount\n        amount\n        event { id title startDate endDate cancelled }\n        logEntry { id number type status }\n        comment\n        removed\n        version\n    }\n": typeof types.BudgetLineFieldsFragmentDoc,
    "\n    fragment TransactionFields on Transaction {\n        id\n        date\n        amount\n        category { ...BudgetCategoryFields }\n        description\n        budgetLine { id description removed }\n        paidBy { ...OwnerFields }\n        reimbursed\n        reimbursedAt\n        receipt { filename contentType size uploadedAt }\n        cancelled\n        version\n    }\n": typeof types.TransactionFieldsFragmentDoc,
    "\n    fragment BudgetScenarioParametersFields on BudgetScenarioParameters {\n        participants\n        participationFee\n        showTicketPrice\n        showTickets\n        partyTicketPrice\n        partyTickets\n        venueCost\n        partyCost\n    }\n": typeof types.BudgetScenarioParametersFieldsFragmentDoc,
    "\n    fragment BudgetScenarioResultFields on BudgetScenarioResult {\n        baseline { ...BudgetScenarioParametersFields }\n        used { ...BudgetScenarioParametersFields }\n        income\n        cost\n        result\n        breakEvenShowTickets\n        partySubsidy\n    }\n": typeof types.BudgetScenarioResultFieldsFragmentDoc,
    "\n    fragment EventTypeBudgetLineFields on EventTypeBudgetLine {\n        id\n        category { ...BudgetCategoryFields }\n        description { sv en }\n        quantityRule\n        quantity\n        unitAmount\n        version\n    }\n": typeof types.EventTypeBudgetLineFieldsFragmentDoc,
    "\n    fragment ReferenceRevivalFields on ReferenceRevival {\n        id\n        label\n        year\n        participants\n        comment\n        automatic\n        figures { category { ...BudgetCategoryFields } budgeted actual }\n        version\n    }\n": typeof types.ReferenceRevivalFieldsFragmentDoc,
    "\n    query BudgetCategories($includeRetired: Boolean) {\n        budgetCategories(includeRetired: $includeRetired) { ...BudgetCategoryFields position inUse version }\n    }\n": typeof types.BudgetCategoriesDocument,
    "\n    mutation BudgetCategoryCreate($input: BudgetCategoryCreateInput!) {\n        budgetCategoryCreate(input: $input) { id }\n    }\n": typeof types.BudgetCategoryCreateDocument,
    "\n    mutation BudgetCategoryUpdate($input: BudgetCategoryUpdateInput!) {\n        budgetCategoryUpdate(input: $input) { id }\n    }\n": typeof types.BudgetCategoryUpdateDocument,
    "\n    mutation BudgetCategoryMove($id: ID!, $version: Int!, $position: Int!) {\n        budgetCategoryMove(id: $id, version: $version, position: $position) { id }\n    }\n": typeof types.BudgetCategoryMoveDocument,
    "\n    mutation BudgetCategoryRetire($id: ID!, $version: Int!) {\n        budgetCategoryRetire(id: $id, version: $version) { id }\n    }\n": typeof types.BudgetCategoryRetireDocument,
    "\n    mutation BudgetCategoryRestore($id: ID!, $version: Int!) {\n        budgetCategoryRestore(id: $id, version: $version) { id }\n    }\n": typeof types.BudgetCategoryRestoreDocument,
    "\n    mutation BudgetCategoryDelete($id: ID!, $version: Int!) {\n        budgetCategoryDelete(id: $id, version: $version)\n    }\n": typeof types.BudgetCategoryDeleteDocument,
    "\n    query ReferenceRevivals {\n        referenceRevivals { ...ReferenceRevivalFields }\n    }\n": typeof types.ReferenceRevivalsDocument,
    "\n    mutation ReferenceRevivalCreate($input: ReferenceRevivalInput!) {\n        referenceRevivalCreate(input: $input) { id }\n    }\n": typeof types.ReferenceRevivalCreateDocument,
    "\n    mutation ReferenceRevivalUpdate($id: ID!, $version: Int!, $input: ReferenceRevivalInput!) {\n        referenceRevivalUpdate(id: $id, version: $version, input: $input) { id }\n    }\n": typeof types.ReferenceRevivalUpdateDocument,
    "\n    mutation ReferenceRevivalDelete($id: ID!, $version: Int!) {\n        referenceRevivalDelete(id: $id, version: $version)\n    }\n": typeof types.ReferenceRevivalDeleteDocument,
    "\n    mutation EventTypeBudgetLineCreate($input: EventTypeBudgetLineInput!) {\n        eventTypeBudgetLineCreate(input: $input) { id }\n    }\n": typeof types.EventTypeBudgetLineCreateDocument,
    "\n    mutation EventTypeBudgetLineUpdate($id: ID!, $version: Int!, $input: EventTypeBudgetLineInput!) {\n        eventTypeBudgetLineUpdate(id: $id, version: $version, input: $input) { id }\n    }\n": typeof types.EventTypeBudgetLineUpdateDocument,
    "\n    mutation EventTypeBudgetLineRemove($id: ID!, $version: Int!) {\n        eventTypeBudgetLineRemove(id: $id, version: $version) { id }\n    }\n": typeof types.EventTypeBudgetLineRemoveDocument,
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
    "\n    query RevivalChecklists($id: ID!, $filter: ChecklistItemFilter, $filtered: Boolean!, $includeCancelled: Boolean!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            permissions { canWriteLog }\n            ownerCandidates(includeParticipants: true) { id displayName }\n        }\n        checklists(revivalId: $id, includeCancelled: $includeCancelled) { id kind chapterKey chapterTitle { sv en } name date cancelled openCount overdueCount totalCount }\n        checklistItems(revivalId: $id, filter: $filter) @include(if: $filtered) { ...ChecklistItemFields }\n    }\n": typeof types.RevivalChecklistsDocument,
    "\n    query Checklist($id: ID!, $revivalId: ID!) {\n        revival(id: $revivalId) {\n            id\n            title\n            permissions { canWriteLog canWaiveRequirement }\n            ownerCandidates(includeParticipants: true) { id displayName }\n        }\n        checklist(id: $id) {\n            id\n            revivalId\n            kind\n            chapterKey\n            chapterTitle { sv en }\n            name\n            date\n            cancelled\n            version\n            template { id name { sv en } }\n            event { id title }\n            templatesAvailable { id kind chapterKey chapterTitle { sv en } name { sv en } }\n            tips { ...GuideItemFields }\n            items { ...ChecklistItemFields }\n        }\n    }\n": typeof types.ChecklistDocument,
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
    "\n    fragment SyncRunFields on SyncRun {\n        id\n        status\n        startedBy { id displayName }\n        startedAt\n        finishedAt\n        total\n        done\n        failed\n        failures { participant { id displayName } operation reason }\n    }\n": typeof types.SyncRunFieldsFragmentDoc,
    "\n    query RevivalClosing($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            year\n            status\n            version\n            anonymizedAt\n            permissions { canReadWork canReadParticipants canReadBudget canWriteLog canSync canAnonymize canSetMembership }\n            ownerCandidates { id displayName }\n            closing {\n                actualResult\n                loanAmount\n                loanRepaid\n                surplusDecision { id number type status }\n                membershipYear\n                membershipsPaid\n                suggestions\n                lastSync { ...SyncRunFields }\n                anonymizedAt\n                autoAnonymizeOn\n            }\n        }\n    }\n": typeof types.RevivalClosingDocument,
    "\n    query RevivalSyncSignal($id: ID!) {\n        revival(id: $id) {\n            id\n            closing { lastSync { id status failed } }\n        }\n    }\n": typeof types.RevivalSyncSignalDocument,
    "\n    query MembershipParticipants($revivalId: ID!) {\n        participants(revivalId: $revivalId, includeRemoved: false) {\n            id\n            kind\n            firstName\n            lastName\n            nickName\n            response\n            membershipPaid\n            removed\n        }\n    }\n": typeof types.MembershipParticipantsDocument,
    "\n    query SyncPreview($revivalId: ID!) {\n        syncPreview(revivalId: $revivalId) {\n            revivalId\n            hash\n            spexregisterRevivalExists\n            participants {\n                participant { id displayName position { id name } }\n                operations { operation detail exists }\n            }\n            excluded { id displayName }\n            membershipYear\n            lastRun { ...SyncRunFields }\n        }\n    }\n": typeof types.SyncPreviewDocument,
    "\n    query SyncRun($id: ID!) {\n        syncRun(id: $id) { ...SyncRunFields }\n    }\n": typeof types.SyncRunDocument,
    "\n    mutation SyncStart($revivalId: ID!, $previewHash: String!) {\n        syncStart(revivalId: $revivalId, previewHash: $previewHash) { ...SyncRunFields }\n    }\n": typeof types.SyncStartDocument,
    "\n    mutation MembershipSet($input: MembershipSetInput!) {\n        membershipSet(input: $input) { id membershipPaid }\n    }\n": typeof types.MembershipSetDocument,
    "\n    mutation RevivalAnonymize($id: ID!, $version: Int!, $confirmation: String!) {\n        revivalAnonymize(id: $id, version: $version, confirmation: $confirmation) { id anonymizedAt version }\n    }\n": typeof types.RevivalAnonymizeDocument,
    "\n    fragment OwnerFields on Owner {\n        name\n        person { id displayName active }\n    }\n": typeof types.OwnerFieldsFragmentDoc,
    "\n    fragment LogEntryFields on LogEntry {\n        id\n        number\n        date\n        type\n        text\n        status\n        owner { ...OwnerFields }\n        deadline\n        overdue\n        comment\n        tags\n        meeting { id date title status }\n        guideItemKey\n        guideItem { id key type { ...GuideItemTypeFields } text { sv en } version }\n        checklistItem { id checklistId state text { sv en } }\n        event { id title startDate cancelled }\n        budgetLines { id description amount }\n        answers { id number type status }\n        answeredBy { id number type status }\n        origin\n        createdBy\n        createdAt\n        version\n    }\n": typeof types.LogEntryFieldsFragmentDoc,
    "\n    query RevivalLog($id: ID!, $filter: LogEntryFilter) {\n        revival(id: $id) {\n            id\n            title\n            year\n            status\n            permissions { canWriteLog }\n            ownerCandidates { id displayName }\n        }\n        logEntries(revivalId: $id, filter: $filter) { ...LogEntryFields }\n        logTags(revivalId: $id)\n        meetings(revivalId: $id) { id date title }\n        events(revivalId: $id, includeCancelled: true) { id title startDate cancelled }\n    }\n": typeof types.RevivalLogDocument,
    "\n    mutation LogEntryCreate($input: LogEntryCreateInput!) {\n        logEntryCreate(input: $input) { ...LogEntryFields }\n    }\n": typeof types.LogEntryCreateDocument,
    "\n    mutation LogEntryUpdate($input: LogEntryUpdateInput!) {\n        logEntryUpdate(input: $input) { ...LogEntryFields }\n    }\n": typeof types.LogEntryUpdateDocument,
    "\n    mutation LogEntryAnswer($input: LogEntryAnswerInput!) {\n        logEntryAnswer(input: $input) {\n            question { ...LogEntryFields }\n            decision { ...LogEntryFields }\n        }\n    }\n": typeof types.LogEntryAnswerDocument,
    "\n    query RevivalEvents($id: ID!, $includeCancelled: Boolean!, $withMeetings: Boolean!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            premiereDate\n            shows { date time venue }\n            permissions { canWriteLog canSubscribeCalendar }\n            eventProposals { type { ...EventTypeFields } startDate endDate earliest latest }\n            calendarFeed { createdAt }\n        }\n        events(revivalId: $id, includeCancelled: $includeCancelled) { ...EventFields }\n        eventTypes { ...EventTypeFields }\n        meetings(revivalId: $id) @include(if: $withMeetings) { id date title status }\n    }\n": typeof types.RevivalEventsDocument,
    "\n    query EventTypes($includeRetired: Boolean) {\n        eventTypes(includeRetired: $includeRetired) { ...EventTypeFields budgetLines { ...EventTypeBudgetLineFields } }\n    }\n": typeof types.EventTypesDocument,
    "\n    mutation EventCreate($input: EventCreateInput!) {\n        eventCreate(input: $input) { id }\n    }\n": typeof types.EventCreateDocument,
    "\n    mutation EventUpdate($input: EventUpdateInput!) {\n        eventUpdate(input: $input) { id }\n    }\n": typeof types.EventUpdateDocument,
    "\n    mutation EventCancel($id: ID!, $version: Int!) {\n        eventCancel(id: $id, version: $version) { id }\n    }\n": typeof types.EventCancelDocument,
    "\n    mutation EventRestore($id: ID!, $version: Int!) {\n        eventRestore(id: $id, version: $version) { id }\n    }\n": typeof types.EventRestoreDocument,
    "\n    mutation EventTypeCreate($input: EventTypeInput!) {\n        eventTypeCreate(input: $input) { id }\n    }\n": typeof types.EventTypeCreateDocument,
    "\n    mutation EventTypeUpdate($id: ID!, $version: Int!, $input: EventTypeInput!) {\n        eventTypeUpdate(id: $id, version: $version, input: $input) { id }\n    }\n": typeof types.EventTypeUpdateDocument,
    "\n    mutation EventTypeMove($id: ID!, $version: Int!, $position: Int!) {\n        eventTypeMove(id: $id, version: $version, position: $position) { id }\n    }\n": typeof types.EventTypeMoveDocument,
    "\n    mutation EventTypeRetire($id: ID!, $version: Int!) {\n        eventTypeRetire(id: $id, version: $version) { id }\n    }\n": typeof types.EventTypeRetireDocument,
    "\n    mutation EventTypeRestore($id: ID!, $version: Int!) {\n        eventTypeRestore(id: $id, version: $version) { id }\n    }\n": typeof types.EventTypeRestoreDocument,
    "\n    mutation CalendarFeedCreate($revivalId: ID!) {\n        calendarFeedCreate(revivalId: $revivalId) { url createdAt }\n    }\n": typeof types.CalendarFeedCreateDocument,
    "\n    mutation CalendarFeedRevoke($revivalId: ID!) {\n        calendarFeedRevoke(revivalId: $revivalId)\n    }\n": typeof types.CalendarFeedRevokeDocument,
    "\n    fragment EventTypeFields on EventType {\n        id\n        name { sv en }\n        description { sv en }\n        rooms { sv en }\n        catering { sv en }\n        offsetMinDays\n        offsetMaxDays\n        days\n        revivalPays\n        checklistTemplate { id name { sv en } retired }\n        position\n        retired\n        version\n    }\n": typeof types.EventTypeFieldsFragmentDoc,
    "\n    fragment EventFields on Event {\n        id\n        revivalId\n        type { id name { sv en } days revivalPays retired }\n        title\n        startDate\n        endDate\n        startTime\n        endTime\n        location\n        description\n        revivalPays\n        daysFromPremiere\n        checklist { id openCount totalCount cancelled }\n        cancelled\n        version\n    }\n": typeof types.EventFieldsFragmentDoc,
    "\n    fragment GuideItemFields on GuideItem {\n        id\n        key\n        type { ...GuideItemTypeFields }\n        text { sv en }\n        libraryEntries { id kind name { sv en } retired }\n        version\n    }\n": typeof types.GuideItemFieldsFragmentDoc,
    "\n    fragment GuideVersionFields on GuideVersion {\n        id\n        status\n        label\n        note\n        publishedAt\n        publishedBy\n        version\n        basedOn { id label publishedAt }\n        introduction { sv en }\n        chapters {\n            id\n            key\n            title { sv en }\n            version\n            items { ...GuideItemFields }\n            sections {\n                id\n                key\n                title { sv en }\n                version\n                items { ...GuideItemFields }\n            }\n        }\n    }\n": typeof types.GuideVersionFieldsFragmentDoc,
    "\n    query GuideReadable {\n        guideReadable\n    }\n": typeof types.GuideReadableDocument,
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
    "\n    fragment LibraryEntryFields on LibraryEntry {\n        id\n        kind\n        name { sv en }\n        description { sv en }\n        pros { sv en }\n        cons { sv en }\n        booking { sv en }\n        prices { sv en }\n        contact { sv en }\n        url\n        retired\n        version\n    }\n": typeof types.LibraryEntryFieldsFragmentDoc,
    "\n    query LibraryEntries($includeRetired: Boolean) {\n        libraryEntries(includeRetired: $includeRetired) { ...LibraryEntryFields }\n    }\n": typeof types.LibraryEntriesDocument,
    "\n    mutation LibraryEntryCreate($input: LibraryEntryInput!) {\n        libraryEntryCreate(input: $input) { id }\n    }\n": typeof types.LibraryEntryCreateDocument,
    "\n    mutation LibraryEntryUpdate($id: ID!, $version: Int!, $input: LibraryEntryInput!) {\n        libraryEntryUpdate(id: $id, version: $version, input: $input) { id }\n    }\n": typeof types.LibraryEntryUpdateDocument,
    "\n    mutation LibraryEntryRetire($id: ID!, $version: Int!) {\n        libraryEntryRetire(id: $id, version: $version) { id }\n    }\n": typeof types.LibraryEntryRetireDocument,
    "\n    mutation LibraryEntryRestore($id: ID!, $version: Int!) {\n        libraryEntryRestore(id: $id, version: $version) { id }\n    }\n": typeof types.LibraryEntryRestoreDocument,
    "\n    fragment MailingTemplateFields on MailingTemplate {\n        id\n        name { sv en }\n        subject { sv en }\n        body { sv en }\n        audience\n        eventType { id name { sv en } retired }\n        due { kind amount weekday }\n        position\n        retired\n        version\n    }\n": typeof types.MailingTemplateFieldsFragmentDoc,
    "\n    fragment MailingFields on Mailing {\n        id\n        revivalId\n        audience { kind position { id name } event { id title startDate } }\n        subject\n        body\n        status\n        plannedFor { template { id name { sv en } } event { id title } dueDate }\n        createdBy { id displayName }\n        createdAt\n        sentBy { id displayName }\n        sentAt\n        recipients { displayName status }\n        canSend\n        version\n    }\n": typeof types.MailingFieldsFragmentDoc,
    "\n    query Mailings($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            permissions { canReadMailings canDraftMailings canSendMailings }\n            mailingPlan {\n                template { ...MailingTemplateFields }\n                event { id title startDate }\n                dueDate\n                mailing { id status subject sentAt }\n                due\n            }\n        }\n        mailings(revivalId: $id) { ...MailingFields }\n    }\n": typeof types.MailingsDocument,
    "\n    query Mailing($id: ID!, $revivalId: ID!) {\n        revival(id: $revivalId) {\n            id\n            title\n            status\n            permissions { canReadMailings canDraftMailings canSendMailings }\n        }\n        mailing(id: $id) { ...MailingFields }\n    }\n": typeof types.MailingDocument,
    "\n    query MailingEditorOptions($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            permissions { canReadMailings canDraftMailings canSendMailings }\n            mailingPlan { template { ...MailingTemplateFields } event { id title startDate } dueDate due }\n        }\n        events(revivalId: $id, includeCancelled: false) { id title startDate }\n    }\n": typeof types.MailingEditorOptionsDocument,
    "\n    query MailingPositions {\n        positions { id name category hasRole }\n    }\n": typeof types.MailingPositionsDocument,
    "\n    query MailingAudiencePreview($revivalId: ID!, $audience: MailingAudienceInput!) {\n        mailingAudiencePreview(revivalId: $revivalId, audience: $audience) { displayName hasAddress }\n    }\n": typeof types.MailingAudiencePreviewDocument,
    "\n    query MailingTemplates($includeRetired: Boolean) {\n        mailingTemplates(includeRetired: $includeRetired) { ...MailingTemplateFields }\n    }\n": typeof types.MailingTemplatesDocument,
    "\n    mutation MailingCreate($input: MailingInput!) {\n        mailingCreate(input: $input) { id }\n    }\n": typeof types.MailingCreateDocument,
    "\n    mutation MailingUpdate($id: ID!, $version: Int!, $input: MailingInput!) {\n        mailingUpdate(id: $id, version: $version, input: $input) { id }\n    }\n": typeof types.MailingUpdateDocument,
    "\n    mutation MailingCancel($id: ID!, $version: Int!) {\n        mailingCancel(id: $id, version: $version) { id }\n    }\n": typeof types.MailingCancelDocument,
    "\n    mutation MailingSend($id: ID!, $version: Int!) {\n        mailingSend(id: $id, version: $version) { id recipients { status } }\n    }\n": typeof types.MailingSendDocument,
    "\n    mutation MailingRetry($id: ID!) {\n        mailingRetry(id: $id) { id recipients { status } }\n    }\n": typeof types.MailingRetryDocument,
    "\n    mutation MailingTemplateCreate($input: MailingTemplateInput!) {\n        mailingTemplateCreate(input: $input) { id }\n    }\n": typeof types.MailingTemplateCreateDocument,
    "\n    mutation MailingTemplateUpdate($id: ID!, $version: Int!, $input: MailingTemplateInput!) {\n        mailingTemplateUpdate(id: $id, version: $version, input: $input) { id }\n    }\n": typeof types.MailingTemplateUpdateDocument,
    "\n    mutation MailingTemplateMove($id: ID!, $version: Int!, $position: Int!) {\n        mailingTemplateMove(id: $id, version: $version, position: $position) { id }\n    }\n": typeof types.MailingTemplateMoveDocument,
    "\n    mutation MailingTemplateRetire($id: ID!, $version: Int!) {\n        mailingTemplateRetire(id: $id, version: $version) { id }\n    }\n": typeof types.MailingTemplateRetireDocument,
    "\n    mutation MailingTemplateRestore($id: ID!, $version: Int!) {\n        mailingTemplateRestore(id: $id, version: $version) { id }\n    }\n": typeof types.MailingTemplateRestoreDocument,
    "\n    fragment LinkServiceFields on LinkService {\n        id\n        name { sv en }\n        hosts\n        homeUrl\n        retired\n    }\n": typeof types.LinkServiceFieldsFragmentDoc,
    "\n    fragment MaterialFields on Material {\n        id\n        title\n        url\n        service { ...LinkServiceFields }\n        serviceChosen\n        category\n        visibility\n        positions { ...PositionFields }\n        comment\n        removed\n        version\n    }\n": typeof types.MaterialFieldsFragmentDoc,
    "\n    fragment InventoryItemFields on InventoryItem {\n        id\n        name\n        kind\n        quantity\n        status\n        location\n        locationNote\n        owner { name person { id displayName active } }\n        comment\n        material { id title url removed }\n        removed\n        version\n    }\n": typeof types.InventoryItemFieldsFragmentDoc,
    "\n    query MaterialsAccess($id: ID!) {\n        revival(id: $id) {\n            id\n            status\n            permissions { canReadMaterials canWriteMaterials }\n        }\n    }\n": typeof types.MaterialsAccessDocument,
    "\n    query RevivalMaterials($id: ID!, $includeRemoved: Boolean!) {\n        revival(id: $id) {\n            id\n            status\n            permissions { canWriteMaterials }\n        }\n        materials(revivalId: $id, includeRemoved: $includeRemoved) { ...MaterialFields }\n        linkServices { ...LinkServiceFields }\n    }\n": typeof types.RevivalMaterialsDocument,
    "\n    query RevivalInventory($id: ID!, $includeRemoved: Boolean!) {\n        revival(id: $id) {\n            id\n            status\n            permissions { canWriteMaterials }\n            ownerCandidates { id displayName }\n        }\n        inventory(revivalId: $id, includeRemoved: $includeRemoved) { ...InventoryItemFields }\n        materials(revivalId: $id) { id title url removed }\n    }\n": typeof types.RevivalInventoryDocument,
    "\n    query LinkServices($includeRetired: Boolean) {\n        linkServices(includeRetired: $includeRetired) { ...LinkServiceFields position inUse version }\n    }\n": typeof types.LinkServicesDocument,
    "\n    mutation MaterialCreate($input: MaterialInput!) {\n        materialCreate(input: $input) { id service { id } }\n    }\n": typeof types.MaterialCreateDocument,
    "\n    mutation MaterialUpdate($id: ID!, $version: Int!, $input: MaterialInput!) {\n        materialUpdate(id: $id, version: $version, input: $input) { id }\n    }\n": typeof types.MaterialUpdateDocument,
    "\n    mutation MaterialRemove($id: ID!, $version: Int!) {\n        materialRemove(id: $id, version: $version) { id }\n    }\n": typeof types.MaterialRemoveDocument,
    "\n    mutation MaterialRestore($id: ID!, $version: Int!) {\n        materialRestore(id: $id, version: $version) { id }\n    }\n": typeof types.MaterialRestoreDocument,
    "\n    mutation InventoryItemCreate($input: InventoryItemInput!) {\n        inventoryItemCreate(input: $input) { id }\n    }\n": typeof types.InventoryItemCreateDocument,
    "\n    mutation InventoryItemUpdate($id: ID!, $version: Int!, $input: InventoryItemInput!) {\n        inventoryItemUpdate(id: $id, version: $version, input: $input) { id }\n    }\n": typeof types.InventoryItemUpdateDocument,
    "\n    mutation InventoryItemRemove($id: ID!, $version: Int!) {\n        inventoryItemRemove(id: $id, version: $version) { id }\n    }\n": typeof types.InventoryItemRemoveDocument,
    "\n    mutation InventoryItemRestore($id: ID!, $version: Int!) {\n        inventoryItemRestore(id: $id, version: $version) { id }\n    }\n": typeof types.InventoryItemRestoreDocument,
    "\n    mutation LinkServiceCreate($input: LinkServiceInput!) {\n        linkServiceCreate(input: $input) { id }\n    }\n": typeof types.LinkServiceCreateDocument,
    "\n    mutation LinkServiceUpdate($id: ID!, $version: Int!, $input: LinkServiceInput!) {\n        linkServiceUpdate(id: $id, version: $version, input: $input) { id }\n    }\n": typeof types.LinkServiceUpdateDocument,
    "\n    mutation LinkServiceMove($id: ID!, $version: Int!, $position: Int!) {\n        linkServiceMove(id: $id, version: $version, position: $position) { id }\n    }\n": typeof types.LinkServiceMoveDocument,
    "\n    mutation LinkServiceRetire($id: ID!, $version: Int!) {\n        linkServiceRetire(id: $id, version: $version) { id }\n    }\n": typeof types.LinkServiceRetireDocument,
    "\n    mutation LinkServiceRestore($id: ID!, $version: Int!) {\n        linkServiceRestore(id: $id, version: $version) { id }\n    }\n": typeof types.LinkServiceRestoreDocument,
    "\n    mutation LinkServiceDelete($id: ID!, $version: Int!) {\n        linkServiceDelete(id: $id, version: $version)\n    }\n": typeof types.LinkServiceDeleteDocument,
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
    "\n    query News($all: Boolean, $limit: Int) {\n        news(all: $all, limit: $limit) { id subject text visibleFrom visibleTo published createdAt lastModifiedAt version }\n    }\n": typeof types.NewsDocument,
    "\n    mutation NewsCreate($input: NewsInput!) {\n        newsCreate(input: $input) { id }\n    }\n": typeof types.NewsCreateDocument,
    "\n    mutation NewsUpdate($id: ID!, $version: Int!, $input: NewsInput!) {\n        newsUpdate(id: $id, version: $version, input: $input) { id }\n    }\n": typeof types.NewsUpdateDocument,
    "\n    mutation NewsDelete($id: ID!, $version: Int!) {\n        newsDelete(id: $id, version: $version)\n    }\n": typeof types.NewsDeleteDocument,
    "\n    fragment PositionFields on Position {\n        id\n        name\n        category\n        hasRole\n    }\n": typeof types.PositionFieldsFragmentDoc,
    "\n    fragment ParticipantFields on Participant {\n        id\n        revivalId\n        kind\n        spexareId\n        firstName\n        lastName\n        nickName\n        email\n        phone\n        pending\n        position { ...PositionFields }\n        roleName\n        vocalPart { id name }\n        preferredPosition { ...PositionFields }\n        response\n        respondedAt\n        comment\n        termsAcceptedAt\n        registerConsent\n        invitation\n        invitedAt\n        dietary\n        dietaryReadable\n        fee\n        feeOverride\n        feePaid\n        feePaidAt\n        compensationPerShift\n        removed\n        version\n    }\n": typeof types.ParticipantFieldsFragmentDoc,
    "\n    fragment SpexareCandidateFields on SpexareCandidate {\n        spexareId\n        firstName\n        lastName\n        nickName\n        graduation\n        history\n        added\n    }\n": typeof types.SpexareCandidateFieldsFragmentDoc,
    "\n    fragment ParticipationSettingsFields on ParticipationSettings {\n        swishNumber\n        whatsappLink\n        terms\n        version\n    }\n": typeof types.ParticipationSettingsFieldsFragmentDoc,
    "\n    query ParticipantsOverview($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            permissions { canReadParticipants canWriteParticipants canReadDietary canWriteBudget }\n            participantCounts {\n                total\n                byResponse { response count }\n                byPosition { position { ...PositionFields } yes maybe pending }\n                notInvited\n                waitingForAccess\n                feesPaid\n                feesUnpaid\n                helpers\n            }\n            participationSettings { ...ParticipationSettingsFields }\n            referrals { id name contact comment referredBy createdAt }\n        }\n    }\n": typeof types.ParticipantsOverviewDocument,
    "\n    query Participants($revivalId: ID!, $includeRemoved: Boolean!) {\n        participants(revivalId: $revivalId, includeRemoved: $includeRemoved) { ...ParticipantFields }\n    }\n": typeof types.ParticipantsDocument,
    "\n    query Positions {\n        positions { ...PositionFields }\n        vocalParts { id name }\n    }\n": typeof types.PositionsDocument,
    "\n    query ParticipantCandidates($revivalId: ID!) {\n        participantCandidates(revivalId: $revivalId) { ...SpexareCandidateFields }\n    }\n": typeof types.ParticipantCandidatesDocument,
    "\n    query SpexareSearch($revivalId: ID!, $query: String!) {\n        spexareSearch(revivalId: $revivalId, query: $query) { ...SpexareCandidateFields }\n    }\n": typeof types.SpexareSearchDocument,
    "\n    query MyParticipation($revivalId: ID!) {\n        myParticipation(revivalId: $revivalId) {\n            participant {\n                id\n                kind\n                firstName\n                lastName\n                nickName\n                pending\n                response\n                respondedAt\n                comment\n                termsAcceptedAt\n                registerConsent\n                preferredPosition { ...PositionFields }\n                fee\n                feePaid\n                feePaidAt\n                version\n            }\n            revival {\n                id\n                title\n                premiereDate\n                shows { date time venue }\n                calendarFeed { createdAt }\n                permissions { canSubscribeCalendar }\n            }\n            terms\n            checklistItems { id text { sv en } checklistName chapterTitle { sv en } checklistDate deadline overdue done comment version }\n            contact { email phone streetAddress postalCode city }\n            dietary\n            swish { number amount message qrAvailable }\n            whatsappLink\n            steeringGroup { id displayName }\n            events { id title startDate endDate startTime endTime location }\n            availability { ...AvailabilityDayFields }\n            shifts { ...ShiftSlotFields }\n            openShifts { ...ShiftSlotFields }\n            materials { ...MaterialFields }\n        }\n    }\n": typeof types.MyParticipationDocument,
    "\n    mutation ParticipantAdd($input: ParticipantAddInput!) {\n        participantAdd(input: $input) { id }\n    }\n": typeof types.ParticipantAddDocument,
    "\n    mutation ParticipantsAddSpexare($revivalId: ID!, $spexareIds: [ID!]!) {\n        participantsAddSpexare(revivalId: $revivalId, spexareIds: $spexareIds) { id }\n    }\n": typeof types.ParticipantsAddSpexareDocument,
    "\n    mutation ParticipantUpdate($input: ParticipantUpdateInput!) {\n        participantUpdate(input: $input) { id }\n    }\n": typeof types.ParticipantUpdateDocument,
    "\n    mutation ParticipantRemove($id: ID!, $version: Int!) {\n        participantRemove(id: $id, version: $version)\n    }\n": typeof types.ParticipantRemoveDocument,
    "\n    mutation ParticipantsInvite($input: ParticipantsInviteInput!) {\n        participantsInvite(input: $input) {\n            invited { id }\n            skipped { reason participant { id firstName lastName nickName removed } }\n        }\n    }\n": typeof types.ParticipantsInviteDocument,
    "\n    mutation ParticipantFeeSetPaid($id: ID!, $version: Int!, $paid: Boolean!) {\n        participantFeeSetPaid(id: $id, version: $version, paid: $paid) { id }\n    }\n": typeof types.ParticipantFeeSetPaidDocument,
    "\n    mutation ParticipationSettingsUpdate($input: ParticipationSettingsInput!) {\n        participationSettingsUpdate(input: $input) { version }\n    }\n": typeof types.ParticipationSettingsUpdateDocument,
    "\n    mutation ReferralHandle($id: ID!, $outcome: ReferralOutcome!) {\n        referralHandle(id: $id, outcome: $outcome) { id }\n    }\n": typeof types.ReferralHandleDocument,
    "\n    mutation ParticipationRespond($input: ParticipationRespondInput!) {\n        participationRespond(input: $input) { participant { id response } }\n    }\n": typeof types.ParticipationRespondDocument,
    "\n    mutation ParticipationContactUpdate($input: ContactInput!) {\n        participationContactUpdate(input: $input) { participant { id } }\n    }\n": typeof types.ParticipationContactUpdateDocument,
    "\n    mutation ParticipationDietarySet($revivalId: ID!, $text: String) {\n        participationDietarySet(revivalId: $revivalId, text: $text) { participant { id } }\n    }\n": typeof types.ParticipationDietarySetDocument,
    "\n    mutation ReferralCreate($input: ReferralInput!) {\n        referralCreate(input: $input)\n    }\n": typeof types.ReferralCreateDocument,
    "\n    mutation AssignedChecklistItemSetDone($id: ID!, $version: Int!, $done: Boolean!) {\n        assignedChecklistItemSetDone(id: $id, version: $version, done: $done) { id }\n    }\n": typeof types.AssignedChecklistItemSetDoneDocument,
    "\n    fragment RevivalSummary on Revival {\n        id\n        year\n        title\n        premiereDate\n        status\n        version\n        anonymizedAt\n        spex { id title year available }\n        members { id role state displayName email invitedAt }\n        permissions { canEditCore canEditDetails allowedStatuses canManageDirecteurs canManageSteeringGroup canDelete canReadBudget canWriteBudget }\n    }\n": typeof types.RevivalSummaryFragmentDoc,
    "\n    fragment RevivalDetail on Revival {\n        ...RevivalSummary\n        shows { date time venue }\n        createdBy\n        createdAt\n        lastModifiedBy\n        lastModifiedAt\n        members { id role capabilities { ...CapabilityFields } state displayName email version }\n        statusHistory { from to changedBy changedAt }\n        guideVersion { id label }\n    }\n": typeof types.RevivalDetailFragmentDoc,
    "\n    query UpcomingRevivals {\n        upcomingRevivals { id title year premiereDate shows { date time venue } }\n    }\n": typeof types.UpcomingRevivalsDocument,
    "\n    query Me {\n        me {\n            id\n            displayName\n            email\n            globalRoles\n            revivalRoles { role capabilities { id } revival { id title } }\n        }\n    }\n": typeof types.MeDocument,
    "\n    query Revivals($status: [RevivalStatus!]) {\n        revivals(status: $status) { ...RevivalSummary }\n    }\n": typeof types.RevivalsDocument,
    "\n    query Revival($id: ID!) {\n        revival(id: $id) { ...RevivalDetail }\n    }\n": typeof types.RevivalDocument,
    "\n    query RevivalShell($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            myRole\n            anonymizedAt\n            permissions { isParticipant canReadWork canReadParticipants canReadBudget canReadStaffing canReadMailings canReadMaterials }\n        }\n    }\n": typeof types.RevivalShellDocument,
    "\n    query RevivalWorkSummary($id: ID!) {\n        revival(id: $id) {\n            id\n            workSummary {\n                openEntries\n                overdueEntries\n                overdueChecklistItems\n                openRequiredItems\n                meetingInProgress { id title date }\n                upcomingEvents { id title startDate endDate startTime endTime }\n            }\n        }\n    }\n": typeof types.RevivalWorkSummaryDocument,
    "\n    mutation RevivalCreate($input: RevivalCreateInput!) {\n        revivalCreate(input: $input) { ...RevivalSummary }\n    }\n": typeof types.RevivalCreateDocument,
    "\n    mutation RevivalUpdate($input: RevivalUpdateInput!) {\n        revivalUpdate(input: $input) { ...RevivalDetail }\n    }\n": typeof types.RevivalUpdateDocument,
    "\n    mutation RevivalStatusChange($input: RevivalStatusChangeInput!) {\n        revivalStatusChange(input: $input) { ...RevivalSummary }\n    }\n": typeof types.RevivalStatusChangeDocument,
    "\n    mutation RevivalDelete($id: ID!, $version: Int!) {\n        revivalDelete(id: $id, version: $version)\n    }\n": typeof types.RevivalDeleteDocument,
    "\n    query ApplicationSettings {\n        applicationSettings { terms { sv en } defaultParticipationFee version }\n    }\n": typeof types.ApplicationSettingsDocument,
    "\n    mutation ApplicationSettingsUpdate($version: Int!, $input: ApplicationSettingsInput!) {\n        applicationSettingsUpdate(version: $version, input: $input) { version }\n    }\n": typeof types.ApplicationSettingsUpdateDocument,
    "\n    query SpexCalendarDates {\n        spexCalendarDates { id date label version }\n    }\n": typeof types.SpexCalendarDatesDocument,
    "\n    query RevivalTimeline {\n        revivals { id title status premiereDate shows { date time venue } }\n        spexCalendarDates { id date label version }\n    }\n": typeof types.RevivalTimelineDocument,
    "\n    mutation SpexCalendarDateCreate($input: SpexCalendarDateInput!) {\n        spexCalendarDateCreate(input: $input) { id }\n    }\n": typeof types.SpexCalendarDateCreateDocument,
    "\n    mutation SpexCalendarDateUpdate($id: ID!, $version: Int!, $input: SpexCalendarDateInput!) {\n        spexCalendarDateUpdate(id: $id, version: $version, input: $input) { id }\n    }\n": typeof types.SpexCalendarDateUpdateDocument,
    "\n    mutation SpexCalendarDateDelete($id: ID!, $version: Int!) {\n        spexCalendarDateDelete(id: $id, version: $version)\n    }\n": typeof types.SpexCalendarDateDeleteDocument,
    "\n    query SpexSearch($query: String!, $first: Int) {\n        spexSearch(query: $query, first: $first) { id title year available }\n    }\n": typeof types.SpexSearchDocument,
    "\n    fragment ParticipantRefFields on ParticipantRef {\n        id\n        displayName\n        kind\n        position { id name }\n    }\n": typeof types.ParticipantRefFieldsFragmentDoc,
    "\n    fragment ShiftSlotFields on ShiftSlot {\n        id\n        event { id title startDate endDate location }\n        date\n        startTime\n        endTime\n        task\n        needed\n        comment\n        assigned { participant { ...ParticipantRefFields } selfSignedUp }\n        open\n        version\n    }\n": typeof types.ShiftSlotFieldsFragmentDoc,
    "\n    fragment AvailabilityDayFields on AvailabilityDay {\n        eventId\n        date\n        answer\n        comment\n    }\n": typeof types.AvailabilityDayFieldsFragmentDoc,
    "\n    query Staffing($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            permissions { canReadStaffing canWriteStaffing }\n        }\n        events(revivalId: $id, includeCancelled: false) { id title startDate endDate startTime endTime location }\n        shiftSlots(revivalId: $id) { ...ShiftSlotFields }\n        availability(revivalId: $id) {\n            participant { ...ParticipantRefFields }\n            days { ...AvailabilityDayFields }\n        }\n    }\n": typeof types.StaffingDocument,
    "\n    query StaffingCandidates($revivalId: ID!) {\n        participants(revivalId: $revivalId) { id kind firstName lastName nickName response position { id name } removed }\n    }\n": typeof types.StaffingCandidatesDocument,
    "\n    mutation ShiftSlotCreate($input: ShiftSlotInput!) {\n        shiftSlotCreate(input: $input) { id }\n    }\n": typeof types.ShiftSlotCreateDocument,
    "\n    mutation ShiftSlotUpdate($id: ID!, $version: Int!, $input: ShiftSlotInput!) {\n        shiftSlotUpdate(id: $id, version: $version, input: $input) { id }\n    }\n": typeof types.ShiftSlotUpdateDocument,
    "\n    mutation ShiftSlotRemove($id: ID!, $version: Int!) {\n        shiftSlotRemove(id: $id, version: $version)\n    }\n": typeof types.ShiftSlotRemoveDocument,
    "\n    mutation ShiftAssign($slotId: ID!, $participantId: ID!) {\n        shiftAssign(slotId: $slotId, participantId: $participantId) { id }\n    }\n": typeof types.ShiftAssignDocument,
    "\n    mutation ShiftUnassign($slotId: ID!, $participantId: ID!) {\n        shiftUnassign(slotId: $slotId, participantId: $participantId) { id }\n    }\n": typeof types.ShiftUnassignDocument,
    "\n    mutation ShiftSignUp($slotId: ID!) {\n        shiftSignUp(slotId: $slotId) { id }\n    }\n": typeof types.ShiftSignUpDocument,
    "\n    mutation ShiftWithdraw($slotId: ID!) {\n        shiftWithdraw(slotId: $slotId) { id }\n    }\n": typeof types.ShiftWithdrawDocument,
    "\n    mutation AvailabilitySet($input: AvailabilityInput!) {\n        availabilitySet(input: $input) { participant { id } }\n    }\n": typeof types.AvailabilitySetDocument,
};
const documents: Documents = {
    "\n    query Revisions($type: AuditedType!, $id: ID!) {\n        revisions(type: $type, id: $id) {\n            revision\n            revisionType\n            modifiedAt\n            modifiedBy\n            source\n            comment\n            changes { field kind oldValue newValue }\n        }\n    }\n": types.RevisionsDocument,
    "\n    query BudgetAccess($id: ID!) {\n        revival(id: $id) {\n            id\n            status\n            permissions { canReadBudget canWriteBudget }\n        }\n    }\n": types.BudgetAccessDocument,
    "\n    query BudgetOverview($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            permissions { canReadBudget canWriteBudget }\n            budget {\n                revivalId\n                settings { participantsPlanned participationFee loanAmount loanReceivedOn loanRepaidOn version }\n                totals {\n                    budgetedIncome budgetedCost budgetedResult actualIncome actualCost actualResult\n                    unreimbursed unreimbursedCount missingReceipts\n                }\n                categories {\n                    category { ...BudgetCategoryFields }\n                    budgeted\n                    actual\n                    references { label year participants budgeted actual budgetedPerParticipant actualPerParticipant }\n                }\n            }\n        }\n    }\n": types.BudgetOverviewDocument,
    "\n    query BudgetLines($id: ID!, $includeRemoved: Boolean!) {\n        revival(id: $id) {\n            id\n            status\n            permissions { canReadBudget canWriteBudget }\n            budget {\n                revivalId\n                settings { participantsPlanned version }\n                lines(includeRemoved: $includeRemoved) { ...BudgetLineFields }\n                proposals {\n                    event { id title startDate endDate }\n                    line { ...EventTypeBudgetLineFields }\n                    quantity\n                    amount\n                }\n            }\n        }\n        events(revivalId: $id) { id title startDate endDate }\n        logEntries(revivalId: $id, filter: {types: [DECISION]}) { id number text date }\n        budgetCategories { ...BudgetCategoryFields }\n    }\n": types.BudgetLinesDocument,
    "\n    query BudgetTransactions($id: ID!, $includeCancelled: Boolean!) {\n        revival(id: $id) {\n            id\n            status\n            permissions { canReadBudget canWriteBudget }\n            ownerCandidates { id displayName }\n            budget {\n                revivalId\n                transactions(includeCancelled: $includeCancelled) { ...TransactionFields }\n                lines { id description category { id } }\n            }\n        }\n        budgetCategories { ...BudgetCategoryFields }\n    }\n": types.BudgetTransactionsDocument,
    "\n    query BudgetScenarios($id: ID!) {\n        revival(id: $id) {\n            id\n            status\n            permissions { canReadBudget canWriteBudget }\n            budget {\n                revivalId\n                scenarios {\n                    id\n                    name\n                    parameters { ...BudgetScenarioParametersFields }\n                    result { ...BudgetScenarioResultFields }\n                    version\n                }\n            }\n        }\n        budgetScenarioCalculate(revivalId: $id, input: {}) { ...BudgetScenarioResultFields }\n    }\n": types.BudgetScenariosDocument,
    "\n    query RevivalBudgetSummary($id: ID!) {\n        revival(id: $id) {\n            id\n            budget {\n                revivalId\n                totals { budgetedIncome budgetedCost budgetedResult actualIncome actualCost actualResult }\n            }\n        }\n    }\n": types.RevivalBudgetSummaryDocument,
    "\n    query BudgetScenarioCalculate($revivalId: ID!, $input: BudgetScenarioInput!) {\n        budgetScenarioCalculate(revivalId: $revivalId, input: $input) { ...BudgetScenarioResultFields }\n    }\n": types.BudgetScenarioCalculateDocument,
    "\n    mutation BudgetSettingsUpdate($input: BudgetSettingsInput!) {\n        budgetSettingsUpdate(input: $input) { revivalId }\n    }\n": types.BudgetSettingsUpdateDocument,
    "\n    mutation BudgetLineCreate($input: BudgetLineCreateInput!) {\n        budgetLineCreate(input: $input) { id }\n    }\n": types.BudgetLineCreateDocument,
    "\n    mutation BudgetLineUpdate($input: BudgetLineUpdateInput!) {\n        budgetLineUpdate(input: $input) { id }\n    }\n": types.BudgetLineUpdateDocument,
    "\n    mutation BudgetLineRemove($id: ID!, $version: Int!) {\n        budgetLineRemove(id: $id, version: $version) { id }\n    }\n": types.BudgetLineRemoveDocument,
    "\n    mutation BudgetLineRestore($id: ID!, $version: Int!) {\n        budgetLineRestore(id: $id, version: $version) { id }\n    }\n": types.BudgetLineRestoreDocument,
    "\n    mutation TransactionCreate($input: TransactionCreateInput!) {\n        transactionCreate(input: $input) { id }\n    }\n": types.TransactionCreateDocument,
    "\n    mutation TransactionUpdate($input: TransactionUpdateInput!) {\n        transactionUpdate(input: $input) { id }\n    }\n": types.TransactionUpdateDocument,
    "\n    mutation TransactionCancel($id: ID!, $version: Int!) {\n        transactionCancel(id: $id, version: $version) { id }\n    }\n": types.TransactionCancelDocument,
    "\n    mutation TransactionSetReimbursed($id: ID!, $version: Int!, $reimbursed: Boolean!) {\n        transactionSetReimbursed(id: $id, version: $version, reimbursed: $reimbursed) { id }\n    }\n": types.TransactionSetReimbursedDocument,
    "\n    mutation BudgetScenarioSave($input: BudgetScenarioSaveInput!) {\n        budgetScenarioSave(input: $input) { id }\n    }\n": types.BudgetScenarioSaveDocument,
    "\n    mutation BudgetScenarioUpdate($id: ID!, $version: Int!, $input: BudgetScenarioSaveInput!) {\n        budgetScenarioUpdate(id: $id, version: $version, input: $input) { id }\n    }\n": types.BudgetScenarioUpdateDocument,
    "\n    mutation BudgetScenarioRemove($id: ID!, $version: Int!) {\n        budgetScenarioRemove(id: $id, version: $version)\n    }\n": types.BudgetScenarioRemoveDocument,
    "\n    fragment BudgetCategoryFields on BudgetCategory {\n        id\n        kind\n        role\n        name { sv en }\n        retired\n    }\n": types.BudgetCategoryFieldsFragmentDoc,
    "\n    fragment BudgetLineFields on BudgetLine {\n        id\n        category { ...BudgetCategoryFields }\n        description\n        quantity\n        unitAmount\n        amount\n        event { id title startDate endDate cancelled }\n        logEntry { id number type status }\n        comment\n        removed\n        version\n    }\n": types.BudgetLineFieldsFragmentDoc,
    "\n    fragment TransactionFields on Transaction {\n        id\n        date\n        amount\n        category { ...BudgetCategoryFields }\n        description\n        budgetLine { id description removed }\n        paidBy { ...OwnerFields }\n        reimbursed\n        reimbursedAt\n        receipt { filename contentType size uploadedAt }\n        cancelled\n        version\n    }\n": types.TransactionFieldsFragmentDoc,
    "\n    fragment BudgetScenarioParametersFields on BudgetScenarioParameters {\n        participants\n        participationFee\n        showTicketPrice\n        showTickets\n        partyTicketPrice\n        partyTickets\n        venueCost\n        partyCost\n    }\n": types.BudgetScenarioParametersFieldsFragmentDoc,
    "\n    fragment BudgetScenarioResultFields on BudgetScenarioResult {\n        baseline { ...BudgetScenarioParametersFields }\n        used { ...BudgetScenarioParametersFields }\n        income\n        cost\n        result\n        breakEvenShowTickets\n        partySubsidy\n    }\n": types.BudgetScenarioResultFieldsFragmentDoc,
    "\n    fragment EventTypeBudgetLineFields on EventTypeBudgetLine {\n        id\n        category { ...BudgetCategoryFields }\n        description { sv en }\n        quantityRule\n        quantity\n        unitAmount\n        version\n    }\n": types.EventTypeBudgetLineFieldsFragmentDoc,
    "\n    fragment ReferenceRevivalFields on ReferenceRevival {\n        id\n        label\n        year\n        participants\n        comment\n        automatic\n        figures { category { ...BudgetCategoryFields } budgeted actual }\n        version\n    }\n": types.ReferenceRevivalFieldsFragmentDoc,
    "\n    query BudgetCategories($includeRetired: Boolean) {\n        budgetCategories(includeRetired: $includeRetired) { ...BudgetCategoryFields position inUse version }\n    }\n": types.BudgetCategoriesDocument,
    "\n    mutation BudgetCategoryCreate($input: BudgetCategoryCreateInput!) {\n        budgetCategoryCreate(input: $input) { id }\n    }\n": types.BudgetCategoryCreateDocument,
    "\n    mutation BudgetCategoryUpdate($input: BudgetCategoryUpdateInput!) {\n        budgetCategoryUpdate(input: $input) { id }\n    }\n": types.BudgetCategoryUpdateDocument,
    "\n    mutation BudgetCategoryMove($id: ID!, $version: Int!, $position: Int!) {\n        budgetCategoryMove(id: $id, version: $version, position: $position) { id }\n    }\n": types.BudgetCategoryMoveDocument,
    "\n    mutation BudgetCategoryRetire($id: ID!, $version: Int!) {\n        budgetCategoryRetire(id: $id, version: $version) { id }\n    }\n": types.BudgetCategoryRetireDocument,
    "\n    mutation BudgetCategoryRestore($id: ID!, $version: Int!) {\n        budgetCategoryRestore(id: $id, version: $version) { id }\n    }\n": types.BudgetCategoryRestoreDocument,
    "\n    mutation BudgetCategoryDelete($id: ID!, $version: Int!) {\n        budgetCategoryDelete(id: $id, version: $version)\n    }\n": types.BudgetCategoryDeleteDocument,
    "\n    query ReferenceRevivals {\n        referenceRevivals { ...ReferenceRevivalFields }\n    }\n": types.ReferenceRevivalsDocument,
    "\n    mutation ReferenceRevivalCreate($input: ReferenceRevivalInput!) {\n        referenceRevivalCreate(input: $input) { id }\n    }\n": types.ReferenceRevivalCreateDocument,
    "\n    mutation ReferenceRevivalUpdate($id: ID!, $version: Int!, $input: ReferenceRevivalInput!) {\n        referenceRevivalUpdate(id: $id, version: $version, input: $input) { id }\n    }\n": types.ReferenceRevivalUpdateDocument,
    "\n    mutation ReferenceRevivalDelete($id: ID!, $version: Int!) {\n        referenceRevivalDelete(id: $id, version: $version)\n    }\n": types.ReferenceRevivalDeleteDocument,
    "\n    mutation EventTypeBudgetLineCreate($input: EventTypeBudgetLineInput!) {\n        eventTypeBudgetLineCreate(input: $input) { id }\n    }\n": types.EventTypeBudgetLineCreateDocument,
    "\n    mutation EventTypeBudgetLineUpdate($id: ID!, $version: Int!, $input: EventTypeBudgetLineInput!) {\n        eventTypeBudgetLineUpdate(id: $id, version: $version, input: $input) { id }\n    }\n": types.EventTypeBudgetLineUpdateDocument,
    "\n    mutation EventTypeBudgetLineRemove($id: ID!, $version: Int!) {\n        eventTypeBudgetLineRemove(id: $id, version: $version) { id }\n    }\n": types.EventTypeBudgetLineRemoveDocument,
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
    "\n    query RevivalChecklists($id: ID!, $filter: ChecklistItemFilter, $filtered: Boolean!, $includeCancelled: Boolean!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            permissions { canWriteLog }\n            ownerCandidates(includeParticipants: true) { id displayName }\n        }\n        checklists(revivalId: $id, includeCancelled: $includeCancelled) { id kind chapterKey chapterTitle { sv en } name date cancelled openCount overdueCount totalCount }\n        checklistItems(revivalId: $id, filter: $filter) @include(if: $filtered) { ...ChecklistItemFields }\n    }\n": types.RevivalChecklistsDocument,
    "\n    query Checklist($id: ID!, $revivalId: ID!) {\n        revival(id: $revivalId) {\n            id\n            title\n            permissions { canWriteLog canWaiveRequirement }\n            ownerCandidates(includeParticipants: true) { id displayName }\n        }\n        checklist(id: $id) {\n            id\n            revivalId\n            kind\n            chapterKey\n            chapterTitle { sv en }\n            name\n            date\n            cancelled\n            version\n            template { id name { sv en } }\n            event { id title }\n            templatesAvailable { id kind chapterKey chapterTitle { sv en } name { sv en } }\n            tips { ...GuideItemFields }\n            items { ...ChecklistItemFields }\n        }\n    }\n": types.ChecklistDocument,
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
    "\n    fragment SyncRunFields on SyncRun {\n        id\n        status\n        startedBy { id displayName }\n        startedAt\n        finishedAt\n        total\n        done\n        failed\n        failures { participant { id displayName } operation reason }\n    }\n": types.SyncRunFieldsFragmentDoc,
    "\n    query RevivalClosing($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            year\n            status\n            version\n            anonymizedAt\n            permissions { canReadWork canReadParticipants canReadBudget canWriteLog canSync canAnonymize canSetMembership }\n            ownerCandidates { id displayName }\n            closing {\n                actualResult\n                loanAmount\n                loanRepaid\n                surplusDecision { id number type status }\n                membershipYear\n                membershipsPaid\n                suggestions\n                lastSync { ...SyncRunFields }\n                anonymizedAt\n                autoAnonymizeOn\n            }\n        }\n    }\n": types.RevivalClosingDocument,
    "\n    query RevivalSyncSignal($id: ID!) {\n        revival(id: $id) {\n            id\n            closing { lastSync { id status failed } }\n        }\n    }\n": types.RevivalSyncSignalDocument,
    "\n    query MembershipParticipants($revivalId: ID!) {\n        participants(revivalId: $revivalId, includeRemoved: false) {\n            id\n            kind\n            firstName\n            lastName\n            nickName\n            response\n            membershipPaid\n            removed\n        }\n    }\n": types.MembershipParticipantsDocument,
    "\n    query SyncPreview($revivalId: ID!) {\n        syncPreview(revivalId: $revivalId) {\n            revivalId\n            hash\n            spexregisterRevivalExists\n            participants {\n                participant { id displayName position { id name } }\n                operations { operation detail exists }\n            }\n            excluded { id displayName }\n            membershipYear\n            lastRun { ...SyncRunFields }\n        }\n    }\n": types.SyncPreviewDocument,
    "\n    query SyncRun($id: ID!) {\n        syncRun(id: $id) { ...SyncRunFields }\n    }\n": types.SyncRunDocument,
    "\n    mutation SyncStart($revivalId: ID!, $previewHash: String!) {\n        syncStart(revivalId: $revivalId, previewHash: $previewHash) { ...SyncRunFields }\n    }\n": types.SyncStartDocument,
    "\n    mutation MembershipSet($input: MembershipSetInput!) {\n        membershipSet(input: $input) { id membershipPaid }\n    }\n": types.MembershipSetDocument,
    "\n    mutation RevivalAnonymize($id: ID!, $version: Int!, $confirmation: String!) {\n        revivalAnonymize(id: $id, version: $version, confirmation: $confirmation) { id anonymizedAt version }\n    }\n": types.RevivalAnonymizeDocument,
    "\n    fragment OwnerFields on Owner {\n        name\n        person { id displayName active }\n    }\n": types.OwnerFieldsFragmentDoc,
    "\n    fragment LogEntryFields on LogEntry {\n        id\n        number\n        date\n        type\n        text\n        status\n        owner { ...OwnerFields }\n        deadline\n        overdue\n        comment\n        tags\n        meeting { id date title status }\n        guideItemKey\n        guideItem { id key type { ...GuideItemTypeFields } text { sv en } version }\n        checklistItem { id checklistId state text { sv en } }\n        event { id title startDate cancelled }\n        budgetLines { id description amount }\n        answers { id number type status }\n        answeredBy { id number type status }\n        origin\n        createdBy\n        createdAt\n        version\n    }\n": types.LogEntryFieldsFragmentDoc,
    "\n    query RevivalLog($id: ID!, $filter: LogEntryFilter) {\n        revival(id: $id) {\n            id\n            title\n            year\n            status\n            permissions { canWriteLog }\n            ownerCandidates { id displayName }\n        }\n        logEntries(revivalId: $id, filter: $filter) { ...LogEntryFields }\n        logTags(revivalId: $id)\n        meetings(revivalId: $id) { id date title }\n        events(revivalId: $id, includeCancelled: true) { id title startDate cancelled }\n    }\n": types.RevivalLogDocument,
    "\n    mutation LogEntryCreate($input: LogEntryCreateInput!) {\n        logEntryCreate(input: $input) { ...LogEntryFields }\n    }\n": types.LogEntryCreateDocument,
    "\n    mutation LogEntryUpdate($input: LogEntryUpdateInput!) {\n        logEntryUpdate(input: $input) { ...LogEntryFields }\n    }\n": types.LogEntryUpdateDocument,
    "\n    mutation LogEntryAnswer($input: LogEntryAnswerInput!) {\n        logEntryAnswer(input: $input) {\n            question { ...LogEntryFields }\n            decision { ...LogEntryFields }\n        }\n    }\n": types.LogEntryAnswerDocument,
    "\n    query RevivalEvents($id: ID!, $includeCancelled: Boolean!, $withMeetings: Boolean!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            premiereDate\n            shows { date time venue }\n            permissions { canWriteLog canSubscribeCalendar }\n            eventProposals { type { ...EventTypeFields } startDate endDate earliest latest }\n            calendarFeed { createdAt }\n        }\n        events(revivalId: $id, includeCancelled: $includeCancelled) { ...EventFields }\n        eventTypes { ...EventTypeFields }\n        meetings(revivalId: $id) @include(if: $withMeetings) { id date title status }\n    }\n": types.RevivalEventsDocument,
    "\n    query EventTypes($includeRetired: Boolean) {\n        eventTypes(includeRetired: $includeRetired) { ...EventTypeFields budgetLines { ...EventTypeBudgetLineFields } }\n    }\n": types.EventTypesDocument,
    "\n    mutation EventCreate($input: EventCreateInput!) {\n        eventCreate(input: $input) { id }\n    }\n": types.EventCreateDocument,
    "\n    mutation EventUpdate($input: EventUpdateInput!) {\n        eventUpdate(input: $input) { id }\n    }\n": types.EventUpdateDocument,
    "\n    mutation EventCancel($id: ID!, $version: Int!) {\n        eventCancel(id: $id, version: $version) { id }\n    }\n": types.EventCancelDocument,
    "\n    mutation EventRestore($id: ID!, $version: Int!) {\n        eventRestore(id: $id, version: $version) { id }\n    }\n": types.EventRestoreDocument,
    "\n    mutation EventTypeCreate($input: EventTypeInput!) {\n        eventTypeCreate(input: $input) { id }\n    }\n": types.EventTypeCreateDocument,
    "\n    mutation EventTypeUpdate($id: ID!, $version: Int!, $input: EventTypeInput!) {\n        eventTypeUpdate(id: $id, version: $version, input: $input) { id }\n    }\n": types.EventTypeUpdateDocument,
    "\n    mutation EventTypeMove($id: ID!, $version: Int!, $position: Int!) {\n        eventTypeMove(id: $id, version: $version, position: $position) { id }\n    }\n": types.EventTypeMoveDocument,
    "\n    mutation EventTypeRetire($id: ID!, $version: Int!) {\n        eventTypeRetire(id: $id, version: $version) { id }\n    }\n": types.EventTypeRetireDocument,
    "\n    mutation EventTypeRestore($id: ID!, $version: Int!) {\n        eventTypeRestore(id: $id, version: $version) { id }\n    }\n": types.EventTypeRestoreDocument,
    "\n    mutation CalendarFeedCreate($revivalId: ID!) {\n        calendarFeedCreate(revivalId: $revivalId) { url createdAt }\n    }\n": types.CalendarFeedCreateDocument,
    "\n    mutation CalendarFeedRevoke($revivalId: ID!) {\n        calendarFeedRevoke(revivalId: $revivalId)\n    }\n": types.CalendarFeedRevokeDocument,
    "\n    fragment EventTypeFields on EventType {\n        id\n        name { sv en }\n        description { sv en }\n        rooms { sv en }\n        catering { sv en }\n        offsetMinDays\n        offsetMaxDays\n        days\n        revivalPays\n        checklistTemplate { id name { sv en } retired }\n        position\n        retired\n        version\n    }\n": types.EventTypeFieldsFragmentDoc,
    "\n    fragment EventFields on Event {\n        id\n        revivalId\n        type { id name { sv en } days revivalPays retired }\n        title\n        startDate\n        endDate\n        startTime\n        endTime\n        location\n        description\n        revivalPays\n        daysFromPremiere\n        checklist { id openCount totalCount cancelled }\n        cancelled\n        version\n    }\n": types.EventFieldsFragmentDoc,
    "\n    fragment GuideItemFields on GuideItem {\n        id\n        key\n        type { ...GuideItemTypeFields }\n        text { sv en }\n        libraryEntries { id kind name { sv en } retired }\n        version\n    }\n": types.GuideItemFieldsFragmentDoc,
    "\n    fragment GuideVersionFields on GuideVersion {\n        id\n        status\n        label\n        note\n        publishedAt\n        publishedBy\n        version\n        basedOn { id label publishedAt }\n        introduction { sv en }\n        chapters {\n            id\n            key\n            title { sv en }\n            version\n            items { ...GuideItemFields }\n            sections {\n                id\n                key\n                title { sv en }\n                version\n                items { ...GuideItemFields }\n            }\n        }\n    }\n": types.GuideVersionFieldsFragmentDoc,
    "\n    query GuideReadable {\n        guideReadable\n    }\n": types.GuideReadableDocument,
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
    "\n    fragment LibraryEntryFields on LibraryEntry {\n        id\n        kind\n        name { sv en }\n        description { sv en }\n        pros { sv en }\n        cons { sv en }\n        booking { sv en }\n        prices { sv en }\n        contact { sv en }\n        url\n        retired\n        version\n    }\n": types.LibraryEntryFieldsFragmentDoc,
    "\n    query LibraryEntries($includeRetired: Boolean) {\n        libraryEntries(includeRetired: $includeRetired) { ...LibraryEntryFields }\n    }\n": types.LibraryEntriesDocument,
    "\n    mutation LibraryEntryCreate($input: LibraryEntryInput!) {\n        libraryEntryCreate(input: $input) { id }\n    }\n": types.LibraryEntryCreateDocument,
    "\n    mutation LibraryEntryUpdate($id: ID!, $version: Int!, $input: LibraryEntryInput!) {\n        libraryEntryUpdate(id: $id, version: $version, input: $input) { id }\n    }\n": types.LibraryEntryUpdateDocument,
    "\n    mutation LibraryEntryRetire($id: ID!, $version: Int!) {\n        libraryEntryRetire(id: $id, version: $version) { id }\n    }\n": types.LibraryEntryRetireDocument,
    "\n    mutation LibraryEntryRestore($id: ID!, $version: Int!) {\n        libraryEntryRestore(id: $id, version: $version) { id }\n    }\n": types.LibraryEntryRestoreDocument,
    "\n    fragment MailingTemplateFields on MailingTemplate {\n        id\n        name { sv en }\n        subject { sv en }\n        body { sv en }\n        audience\n        eventType { id name { sv en } retired }\n        due { kind amount weekday }\n        position\n        retired\n        version\n    }\n": types.MailingTemplateFieldsFragmentDoc,
    "\n    fragment MailingFields on Mailing {\n        id\n        revivalId\n        audience { kind position { id name } event { id title startDate } }\n        subject\n        body\n        status\n        plannedFor { template { id name { sv en } } event { id title } dueDate }\n        createdBy { id displayName }\n        createdAt\n        sentBy { id displayName }\n        sentAt\n        recipients { displayName status }\n        canSend\n        version\n    }\n": types.MailingFieldsFragmentDoc,
    "\n    query Mailings($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            permissions { canReadMailings canDraftMailings canSendMailings }\n            mailingPlan {\n                template { ...MailingTemplateFields }\n                event { id title startDate }\n                dueDate\n                mailing { id status subject sentAt }\n                due\n            }\n        }\n        mailings(revivalId: $id) { ...MailingFields }\n    }\n": types.MailingsDocument,
    "\n    query Mailing($id: ID!, $revivalId: ID!) {\n        revival(id: $revivalId) {\n            id\n            title\n            status\n            permissions { canReadMailings canDraftMailings canSendMailings }\n        }\n        mailing(id: $id) { ...MailingFields }\n    }\n": types.MailingDocument,
    "\n    query MailingEditorOptions($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            permissions { canReadMailings canDraftMailings canSendMailings }\n            mailingPlan { template { ...MailingTemplateFields } event { id title startDate } dueDate due }\n        }\n        events(revivalId: $id, includeCancelled: false) { id title startDate }\n    }\n": types.MailingEditorOptionsDocument,
    "\n    query MailingPositions {\n        positions { id name category hasRole }\n    }\n": types.MailingPositionsDocument,
    "\n    query MailingAudiencePreview($revivalId: ID!, $audience: MailingAudienceInput!) {\n        mailingAudiencePreview(revivalId: $revivalId, audience: $audience) { displayName hasAddress }\n    }\n": types.MailingAudiencePreviewDocument,
    "\n    query MailingTemplates($includeRetired: Boolean) {\n        mailingTemplates(includeRetired: $includeRetired) { ...MailingTemplateFields }\n    }\n": types.MailingTemplatesDocument,
    "\n    mutation MailingCreate($input: MailingInput!) {\n        mailingCreate(input: $input) { id }\n    }\n": types.MailingCreateDocument,
    "\n    mutation MailingUpdate($id: ID!, $version: Int!, $input: MailingInput!) {\n        mailingUpdate(id: $id, version: $version, input: $input) { id }\n    }\n": types.MailingUpdateDocument,
    "\n    mutation MailingCancel($id: ID!, $version: Int!) {\n        mailingCancel(id: $id, version: $version) { id }\n    }\n": types.MailingCancelDocument,
    "\n    mutation MailingSend($id: ID!, $version: Int!) {\n        mailingSend(id: $id, version: $version) { id recipients { status } }\n    }\n": types.MailingSendDocument,
    "\n    mutation MailingRetry($id: ID!) {\n        mailingRetry(id: $id) { id recipients { status } }\n    }\n": types.MailingRetryDocument,
    "\n    mutation MailingTemplateCreate($input: MailingTemplateInput!) {\n        mailingTemplateCreate(input: $input) { id }\n    }\n": types.MailingTemplateCreateDocument,
    "\n    mutation MailingTemplateUpdate($id: ID!, $version: Int!, $input: MailingTemplateInput!) {\n        mailingTemplateUpdate(id: $id, version: $version, input: $input) { id }\n    }\n": types.MailingTemplateUpdateDocument,
    "\n    mutation MailingTemplateMove($id: ID!, $version: Int!, $position: Int!) {\n        mailingTemplateMove(id: $id, version: $version, position: $position) { id }\n    }\n": types.MailingTemplateMoveDocument,
    "\n    mutation MailingTemplateRetire($id: ID!, $version: Int!) {\n        mailingTemplateRetire(id: $id, version: $version) { id }\n    }\n": types.MailingTemplateRetireDocument,
    "\n    mutation MailingTemplateRestore($id: ID!, $version: Int!) {\n        mailingTemplateRestore(id: $id, version: $version) { id }\n    }\n": types.MailingTemplateRestoreDocument,
    "\n    fragment LinkServiceFields on LinkService {\n        id\n        name { sv en }\n        hosts\n        homeUrl\n        retired\n    }\n": types.LinkServiceFieldsFragmentDoc,
    "\n    fragment MaterialFields on Material {\n        id\n        title\n        url\n        service { ...LinkServiceFields }\n        serviceChosen\n        category\n        visibility\n        positions { ...PositionFields }\n        comment\n        removed\n        version\n    }\n": types.MaterialFieldsFragmentDoc,
    "\n    fragment InventoryItemFields on InventoryItem {\n        id\n        name\n        kind\n        quantity\n        status\n        location\n        locationNote\n        owner { name person { id displayName active } }\n        comment\n        material { id title url removed }\n        removed\n        version\n    }\n": types.InventoryItemFieldsFragmentDoc,
    "\n    query MaterialsAccess($id: ID!) {\n        revival(id: $id) {\n            id\n            status\n            permissions { canReadMaterials canWriteMaterials }\n        }\n    }\n": types.MaterialsAccessDocument,
    "\n    query RevivalMaterials($id: ID!, $includeRemoved: Boolean!) {\n        revival(id: $id) {\n            id\n            status\n            permissions { canWriteMaterials }\n        }\n        materials(revivalId: $id, includeRemoved: $includeRemoved) { ...MaterialFields }\n        linkServices { ...LinkServiceFields }\n    }\n": types.RevivalMaterialsDocument,
    "\n    query RevivalInventory($id: ID!, $includeRemoved: Boolean!) {\n        revival(id: $id) {\n            id\n            status\n            permissions { canWriteMaterials }\n            ownerCandidates { id displayName }\n        }\n        inventory(revivalId: $id, includeRemoved: $includeRemoved) { ...InventoryItemFields }\n        materials(revivalId: $id) { id title url removed }\n    }\n": types.RevivalInventoryDocument,
    "\n    query LinkServices($includeRetired: Boolean) {\n        linkServices(includeRetired: $includeRetired) { ...LinkServiceFields position inUse version }\n    }\n": types.LinkServicesDocument,
    "\n    mutation MaterialCreate($input: MaterialInput!) {\n        materialCreate(input: $input) { id service { id } }\n    }\n": types.MaterialCreateDocument,
    "\n    mutation MaterialUpdate($id: ID!, $version: Int!, $input: MaterialInput!) {\n        materialUpdate(id: $id, version: $version, input: $input) { id }\n    }\n": types.MaterialUpdateDocument,
    "\n    mutation MaterialRemove($id: ID!, $version: Int!) {\n        materialRemove(id: $id, version: $version) { id }\n    }\n": types.MaterialRemoveDocument,
    "\n    mutation MaterialRestore($id: ID!, $version: Int!) {\n        materialRestore(id: $id, version: $version) { id }\n    }\n": types.MaterialRestoreDocument,
    "\n    mutation InventoryItemCreate($input: InventoryItemInput!) {\n        inventoryItemCreate(input: $input) { id }\n    }\n": types.InventoryItemCreateDocument,
    "\n    mutation InventoryItemUpdate($id: ID!, $version: Int!, $input: InventoryItemInput!) {\n        inventoryItemUpdate(id: $id, version: $version, input: $input) { id }\n    }\n": types.InventoryItemUpdateDocument,
    "\n    mutation InventoryItemRemove($id: ID!, $version: Int!) {\n        inventoryItemRemove(id: $id, version: $version) { id }\n    }\n": types.InventoryItemRemoveDocument,
    "\n    mutation InventoryItemRestore($id: ID!, $version: Int!) {\n        inventoryItemRestore(id: $id, version: $version) { id }\n    }\n": types.InventoryItemRestoreDocument,
    "\n    mutation LinkServiceCreate($input: LinkServiceInput!) {\n        linkServiceCreate(input: $input) { id }\n    }\n": types.LinkServiceCreateDocument,
    "\n    mutation LinkServiceUpdate($id: ID!, $version: Int!, $input: LinkServiceInput!) {\n        linkServiceUpdate(id: $id, version: $version, input: $input) { id }\n    }\n": types.LinkServiceUpdateDocument,
    "\n    mutation LinkServiceMove($id: ID!, $version: Int!, $position: Int!) {\n        linkServiceMove(id: $id, version: $version, position: $position) { id }\n    }\n": types.LinkServiceMoveDocument,
    "\n    mutation LinkServiceRetire($id: ID!, $version: Int!) {\n        linkServiceRetire(id: $id, version: $version) { id }\n    }\n": types.LinkServiceRetireDocument,
    "\n    mutation LinkServiceRestore($id: ID!, $version: Int!) {\n        linkServiceRestore(id: $id, version: $version) { id }\n    }\n": types.LinkServiceRestoreDocument,
    "\n    mutation LinkServiceDelete($id: ID!, $version: Int!) {\n        linkServiceDelete(id: $id, version: $version)\n    }\n": types.LinkServiceDeleteDocument,
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
    "\n    query News($all: Boolean, $limit: Int) {\n        news(all: $all, limit: $limit) { id subject text visibleFrom visibleTo published createdAt lastModifiedAt version }\n    }\n": types.NewsDocument,
    "\n    mutation NewsCreate($input: NewsInput!) {\n        newsCreate(input: $input) { id }\n    }\n": types.NewsCreateDocument,
    "\n    mutation NewsUpdate($id: ID!, $version: Int!, $input: NewsInput!) {\n        newsUpdate(id: $id, version: $version, input: $input) { id }\n    }\n": types.NewsUpdateDocument,
    "\n    mutation NewsDelete($id: ID!, $version: Int!) {\n        newsDelete(id: $id, version: $version)\n    }\n": types.NewsDeleteDocument,
    "\n    fragment PositionFields on Position {\n        id\n        name\n        category\n        hasRole\n    }\n": types.PositionFieldsFragmentDoc,
    "\n    fragment ParticipantFields on Participant {\n        id\n        revivalId\n        kind\n        spexareId\n        firstName\n        lastName\n        nickName\n        email\n        phone\n        pending\n        position { ...PositionFields }\n        roleName\n        vocalPart { id name }\n        preferredPosition { ...PositionFields }\n        response\n        respondedAt\n        comment\n        termsAcceptedAt\n        registerConsent\n        invitation\n        invitedAt\n        dietary\n        dietaryReadable\n        fee\n        feeOverride\n        feePaid\n        feePaidAt\n        compensationPerShift\n        removed\n        version\n    }\n": types.ParticipantFieldsFragmentDoc,
    "\n    fragment SpexareCandidateFields on SpexareCandidate {\n        spexareId\n        firstName\n        lastName\n        nickName\n        graduation\n        history\n        added\n    }\n": types.SpexareCandidateFieldsFragmentDoc,
    "\n    fragment ParticipationSettingsFields on ParticipationSettings {\n        swishNumber\n        whatsappLink\n        terms\n        version\n    }\n": types.ParticipationSettingsFieldsFragmentDoc,
    "\n    query ParticipantsOverview($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            permissions { canReadParticipants canWriteParticipants canReadDietary canWriteBudget }\n            participantCounts {\n                total\n                byResponse { response count }\n                byPosition { position { ...PositionFields } yes maybe pending }\n                notInvited\n                waitingForAccess\n                feesPaid\n                feesUnpaid\n                helpers\n            }\n            participationSettings { ...ParticipationSettingsFields }\n            referrals { id name contact comment referredBy createdAt }\n        }\n    }\n": types.ParticipantsOverviewDocument,
    "\n    query Participants($revivalId: ID!, $includeRemoved: Boolean!) {\n        participants(revivalId: $revivalId, includeRemoved: $includeRemoved) { ...ParticipantFields }\n    }\n": types.ParticipantsDocument,
    "\n    query Positions {\n        positions { ...PositionFields }\n        vocalParts { id name }\n    }\n": types.PositionsDocument,
    "\n    query ParticipantCandidates($revivalId: ID!) {\n        participantCandidates(revivalId: $revivalId) { ...SpexareCandidateFields }\n    }\n": types.ParticipantCandidatesDocument,
    "\n    query SpexareSearch($revivalId: ID!, $query: String!) {\n        spexareSearch(revivalId: $revivalId, query: $query) { ...SpexareCandidateFields }\n    }\n": types.SpexareSearchDocument,
    "\n    query MyParticipation($revivalId: ID!) {\n        myParticipation(revivalId: $revivalId) {\n            participant {\n                id\n                kind\n                firstName\n                lastName\n                nickName\n                pending\n                response\n                respondedAt\n                comment\n                termsAcceptedAt\n                registerConsent\n                preferredPosition { ...PositionFields }\n                fee\n                feePaid\n                feePaidAt\n                version\n            }\n            revival {\n                id\n                title\n                premiereDate\n                shows { date time venue }\n                calendarFeed { createdAt }\n                permissions { canSubscribeCalendar }\n            }\n            terms\n            checklistItems { id text { sv en } checklistName chapterTitle { sv en } checklistDate deadline overdue done comment version }\n            contact { email phone streetAddress postalCode city }\n            dietary\n            swish { number amount message qrAvailable }\n            whatsappLink\n            steeringGroup { id displayName }\n            events { id title startDate endDate startTime endTime location }\n            availability { ...AvailabilityDayFields }\n            shifts { ...ShiftSlotFields }\n            openShifts { ...ShiftSlotFields }\n            materials { ...MaterialFields }\n        }\n    }\n": types.MyParticipationDocument,
    "\n    mutation ParticipantAdd($input: ParticipantAddInput!) {\n        participantAdd(input: $input) { id }\n    }\n": types.ParticipantAddDocument,
    "\n    mutation ParticipantsAddSpexare($revivalId: ID!, $spexareIds: [ID!]!) {\n        participantsAddSpexare(revivalId: $revivalId, spexareIds: $spexareIds) { id }\n    }\n": types.ParticipantsAddSpexareDocument,
    "\n    mutation ParticipantUpdate($input: ParticipantUpdateInput!) {\n        participantUpdate(input: $input) { id }\n    }\n": types.ParticipantUpdateDocument,
    "\n    mutation ParticipantRemove($id: ID!, $version: Int!) {\n        participantRemove(id: $id, version: $version)\n    }\n": types.ParticipantRemoveDocument,
    "\n    mutation ParticipantsInvite($input: ParticipantsInviteInput!) {\n        participantsInvite(input: $input) {\n            invited { id }\n            skipped { reason participant { id firstName lastName nickName removed } }\n        }\n    }\n": types.ParticipantsInviteDocument,
    "\n    mutation ParticipantFeeSetPaid($id: ID!, $version: Int!, $paid: Boolean!) {\n        participantFeeSetPaid(id: $id, version: $version, paid: $paid) { id }\n    }\n": types.ParticipantFeeSetPaidDocument,
    "\n    mutation ParticipationSettingsUpdate($input: ParticipationSettingsInput!) {\n        participationSettingsUpdate(input: $input) { version }\n    }\n": types.ParticipationSettingsUpdateDocument,
    "\n    mutation ReferralHandle($id: ID!, $outcome: ReferralOutcome!) {\n        referralHandle(id: $id, outcome: $outcome) { id }\n    }\n": types.ReferralHandleDocument,
    "\n    mutation ParticipationRespond($input: ParticipationRespondInput!) {\n        participationRespond(input: $input) { participant { id response } }\n    }\n": types.ParticipationRespondDocument,
    "\n    mutation ParticipationContactUpdate($input: ContactInput!) {\n        participationContactUpdate(input: $input) { participant { id } }\n    }\n": types.ParticipationContactUpdateDocument,
    "\n    mutation ParticipationDietarySet($revivalId: ID!, $text: String) {\n        participationDietarySet(revivalId: $revivalId, text: $text) { participant { id } }\n    }\n": types.ParticipationDietarySetDocument,
    "\n    mutation ReferralCreate($input: ReferralInput!) {\n        referralCreate(input: $input)\n    }\n": types.ReferralCreateDocument,
    "\n    mutation AssignedChecklistItemSetDone($id: ID!, $version: Int!, $done: Boolean!) {\n        assignedChecklistItemSetDone(id: $id, version: $version, done: $done) { id }\n    }\n": types.AssignedChecklistItemSetDoneDocument,
    "\n    fragment RevivalSummary on Revival {\n        id\n        year\n        title\n        premiereDate\n        status\n        version\n        anonymizedAt\n        spex { id title year available }\n        members { id role state displayName email invitedAt }\n        permissions { canEditCore canEditDetails allowedStatuses canManageDirecteurs canManageSteeringGroup canDelete canReadBudget canWriteBudget }\n    }\n": types.RevivalSummaryFragmentDoc,
    "\n    fragment RevivalDetail on Revival {\n        ...RevivalSummary\n        shows { date time venue }\n        createdBy\n        createdAt\n        lastModifiedBy\n        lastModifiedAt\n        members { id role capabilities { ...CapabilityFields } state displayName email version }\n        statusHistory { from to changedBy changedAt }\n        guideVersion { id label }\n    }\n": types.RevivalDetailFragmentDoc,
    "\n    query UpcomingRevivals {\n        upcomingRevivals { id title year premiereDate shows { date time venue } }\n    }\n": types.UpcomingRevivalsDocument,
    "\n    query Me {\n        me {\n            id\n            displayName\n            email\n            globalRoles\n            revivalRoles { role capabilities { id } revival { id title } }\n        }\n    }\n": types.MeDocument,
    "\n    query Revivals($status: [RevivalStatus!]) {\n        revivals(status: $status) { ...RevivalSummary }\n    }\n": types.RevivalsDocument,
    "\n    query Revival($id: ID!) {\n        revival(id: $id) { ...RevivalDetail }\n    }\n": types.RevivalDocument,
    "\n    query RevivalShell($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            myRole\n            anonymizedAt\n            permissions { isParticipant canReadWork canReadParticipants canReadBudget canReadStaffing canReadMailings canReadMaterials }\n        }\n    }\n": types.RevivalShellDocument,
    "\n    query RevivalWorkSummary($id: ID!) {\n        revival(id: $id) {\n            id\n            workSummary {\n                openEntries\n                overdueEntries\n                overdueChecklistItems\n                openRequiredItems\n                meetingInProgress { id title date }\n                upcomingEvents { id title startDate endDate startTime endTime }\n            }\n        }\n    }\n": types.RevivalWorkSummaryDocument,
    "\n    mutation RevivalCreate($input: RevivalCreateInput!) {\n        revivalCreate(input: $input) { ...RevivalSummary }\n    }\n": types.RevivalCreateDocument,
    "\n    mutation RevivalUpdate($input: RevivalUpdateInput!) {\n        revivalUpdate(input: $input) { ...RevivalDetail }\n    }\n": types.RevivalUpdateDocument,
    "\n    mutation RevivalStatusChange($input: RevivalStatusChangeInput!) {\n        revivalStatusChange(input: $input) { ...RevivalSummary }\n    }\n": types.RevivalStatusChangeDocument,
    "\n    mutation RevivalDelete($id: ID!, $version: Int!) {\n        revivalDelete(id: $id, version: $version)\n    }\n": types.RevivalDeleteDocument,
    "\n    query ApplicationSettings {\n        applicationSettings { terms { sv en } defaultParticipationFee version }\n    }\n": types.ApplicationSettingsDocument,
    "\n    mutation ApplicationSettingsUpdate($version: Int!, $input: ApplicationSettingsInput!) {\n        applicationSettingsUpdate(version: $version, input: $input) { version }\n    }\n": types.ApplicationSettingsUpdateDocument,
    "\n    query SpexCalendarDates {\n        spexCalendarDates { id date label version }\n    }\n": types.SpexCalendarDatesDocument,
    "\n    query RevivalTimeline {\n        revivals { id title status premiereDate shows { date time venue } }\n        spexCalendarDates { id date label version }\n    }\n": types.RevivalTimelineDocument,
    "\n    mutation SpexCalendarDateCreate($input: SpexCalendarDateInput!) {\n        spexCalendarDateCreate(input: $input) { id }\n    }\n": types.SpexCalendarDateCreateDocument,
    "\n    mutation SpexCalendarDateUpdate($id: ID!, $version: Int!, $input: SpexCalendarDateInput!) {\n        spexCalendarDateUpdate(id: $id, version: $version, input: $input) { id }\n    }\n": types.SpexCalendarDateUpdateDocument,
    "\n    mutation SpexCalendarDateDelete($id: ID!, $version: Int!) {\n        spexCalendarDateDelete(id: $id, version: $version)\n    }\n": types.SpexCalendarDateDeleteDocument,
    "\n    query SpexSearch($query: String!, $first: Int) {\n        spexSearch(query: $query, first: $first) { id title year available }\n    }\n": types.SpexSearchDocument,
    "\n    fragment ParticipantRefFields on ParticipantRef {\n        id\n        displayName\n        kind\n        position { id name }\n    }\n": types.ParticipantRefFieldsFragmentDoc,
    "\n    fragment ShiftSlotFields on ShiftSlot {\n        id\n        event { id title startDate endDate location }\n        date\n        startTime\n        endTime\n        task\n        needed\n        comment\n        assigned { participant { ...ParticipantRefFields } selfSignedUp }\n        open\n        version\n    }\n": types.ShiftSlotFieldsFragmentDoc,
    "\n    fragment AvailabilityDayFields on AvailabilityDay {\n        eventId\n        date\n        answer\n        comment\n    }\n": types.AvailabilityDayFieldsFragmentDoc,
    "\n    query Staffing($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            permissions { canReadStaffing canWriteStaffing }\n        }\n        events(revivalId: $id, includeCancelled: false) { id title startDate endDate startTime endTime location }\n        shiftSlots(revivalId: $id) { ...ShiftSlotFields }\n        availability(revivalId: $id) {\n            participant { ...ParticipantRefFields }\n            days { ...AvailabilityDayFields }\n        }\n    }\n": types.StaffingDocument,
    "\n    query StaffingCandidates($revivalId: ID!) {\n        participants(revivalId: $revivalId) { id kind firstName lastName nickName response position { id name } removed }\n    }\n": types.StaffingCandidatesDocument,
    "\n    mutation ShiftSlotCreate($input: ShiftSlotInput!) {\n        shiftSlotCreate(input: $input) { id }\n    }\n": types.ShiftSlotCreateDocument,
    "\n    mutation ShiftSlotUpdate($id: ID!, $version: Int!, $input: ShiftSlotInput!) {\n        shiftSlotUpdate(id: $id, version: $version, input: $input) { id }\n    }\n": types.ShiftSlotUpdateDocument,
    "\n    mutation ShiftSlotRemove($id: ID!, $version: Int!) {\n        shiftSlotRemove(id: $id, version: $version)\n    }\n": types.ShiftSlotRemoveDocument,
    "\n    mutation ShiftAssign($slotId: ID!, $participantId: ID!) {\n        shiftAssign(slotId: $slotId, participantId: $participantId) { id }\n    }\n": types.ShiftAssignDocument,
    "\n    mutation ShiftUnassign($slotId: ID!, $participantId: ID!) {\n        shiftUnassign(slotId: $slotId, participantId: $participantId) { id }\n    }\n": types.ShiftUnassignDocument,
    "\n    mutation ShiftSignUp($slotId: ID!) {\n        shiftSignUp(slotId: $slotId) { id }\n    }\n": types.ShiftSignUpDocument,
    "\n    mutation ShiftWithdraw($slotId: ID!) {\n        shiftWithdraw(slotId: $slotId) { id }\n    }\n": types.ShiftWithdrawDocument,
    "\n    mutation AvailabilitySet($input: AvailabilityInput!) {\n        availabilitySet(input: $input) { participant { id } }\n    }\n": types.AvailabilitySetDocument,
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
export function graphql(source: "\n    query Revisions($type: AuditedType!, $id: ID!) {\n        revisions(type: $type, id: $id) {\n            revision\n            revisionType\n            modifiedAt\n            modifiedBy\n            source\n            comment\n            changes { field kind oldValue newValue }\n        }\n    }\n"): (typeof documents)["\n    query Revisions($type: AuditedType!, $id: ID!) {\n        revisions(type: $type, id: $id) {\n            revision\n            revisionType\n            modifiedAt\n            modifiedBy\n            source\n            comment\n            changes { field kind oldValue newValue }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query BudgetAccess($id: ID!) {\n        revival(id: $id) {\n            id\n            status\n            permissions { canReadBudget canWriteBudget }\n        }\n    }\n"): (typeof documents)["\n    query BudgetAccess($id: ID!) {\n        revival(id: $id) {\n            id\n            status\n            permissions { canReadBudget canWriteBudget }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query BudgetOverview($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            permissions { canReadBudget canWriteBudget }\n            budget {\n                revivalId\n                settings { participantsPlanned participationFee loanAmount loanReceivedOn loanRepaidOn version }\n                totals {\n                    budgetedIncome budgetedCost budgetedResult actualIncome actualCost actualResult\n                    unreimbursed unreimbursedCount missingReceipts\n                }\n                categories {\n                    category { ...BudgetCategoryFields }\n                    budgeted\n                    actual\n                    references { label year participants budgeted actual budgetedPerParticipant actualPerParticipant }\n                }\n            }\n        }\n    }\n"): (typeof documents)["\n    query BudgetOverview($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            permissions { canReadBudget canWriteBudget }\n            budget {\n                revivalId\n                settings { participantsPlanned participationFee loanAmount loanReceivedOn loanRepaidOn version }\n                totals {\n                    budgetedIncome budgetedCost budgetedResult actualIncome actualCost actualResult\n                    unreimbursed unreimbursedCount missingReceipts\n                }\n                categories {\n                    category { ...BudgetCategoryFields }\n                    budgeted\n                    actual\n                    references { label year participants budgeted actual budgetedPerParticipant actualPerParticipant }\n                }\n            }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query BudgetLines($id: ID!, $includeRemoved: Boolean!) {\n        revival(id: $id) {\n            id\n            status\n            permissions { canReadBudget canWriteBudget }\n            budget {\n                revivalId\n                settings { participantsPlanned version }\n                lines(includeRemoved: $includeRemoved) { ...BudgetLineFields }\n                proposals {\n                    event { id title startDate endDate }\n                    line { ...EventTypeBudgetLineFields }\n                    quantity\n                    amount\n                }\n            }\n        }\n        events(revivalId: $id) { id title startDate endDate }\n        logEntries(revivalId: $id, filter: {types: [DECISION]}) { id number text date }\n        budgetCategories { ...BudgetCategoryFields }\n    }\n"): (typeof documents)["\n    query BudgetLines($id: ID!, $includeRemoved: Boolean!) {\n        revival(id: $id) {\n            id\n            status\n            permissions { canReadBudget canWriteBudget }\n            budget {\n                revivalId\n                settings { participantsPlanned version }\n                lines(includeRemoved: $includeRemoved) { ...BudgetLineFields }\n                proposals {\n                    event { id title startDate endDate }\n                    line { ...EventTypeBudgetLineFields }\n                    quantity\n                    amount\n                }\n            }\n        }\n        events(revivalId: $id) { id title startDate endDate }\n        logEntries(revivalId: $id, filter: {types: [DECISION]}) { id number text date }\n        budgetCategories { ...BudgetCategoryFields }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query BudgetTransactions($id: ID!, $includeCancelled: Boolean!) {\n        revival(id: $id) {\n            id\n            status\n            permissions { canReadBudget canWriteBudget }\n            ownerCandidates { id displayName }\n            budget {\n                revivalId\n                transactions(includeCancelled: $includeCancelled) { ...TransactionFields }\n                lines { id description category { id } }\n            }\n        }\n        budgetCategories { ...BudgetCategoryFields }\n    }\n"): (typeof documents)["\n    query BudgetTransactions($id: ID!, $includeCancelled: Boolean!) {\n        revival(id: $id) {\n            id\n            status\n            permissions { canReadBudget canWriteBudget }\n            ownerCandidates { id displayName }\n            budget {\n                revivalId\n                transactions(includeCancelled: $includeCancelled) { ...TransactionFields }\n                lines { id description category { id } }\n            }\n        }\n        budgetCategories { ...BudgetCategoryFields }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query BudgetScenarios($id: ID!) {\n        revival(id: $id) {\n            id\n            status\n            permissions { canReadBudget canWriteBudget }\n            budget {\n                revivalId\n                scenarios {\n                    id\n                    name\n                    parameters { ...BudgetScenarioParametersFields }\n                    result { ...BudgetScenarioResultFields }\n                    version\n                }\n            }\n        }\n        budgetScenarioCalculate(revivalId: $id, input: {}) { ...BudgetScenarioResultFields }\n    }\n"): (typeof documents)["\n    query BudgetScenarios($id: ID!) {\n        revival(id: $id) {\n            id\n            status\n            permissions { canReadBudget canWriteBudget }\n            budget {\n                revivalId\n                scenarios {\n                    id\n                    name\n                    parameters { ...BudgetScenarioParametersFields }\n                    result { ...BudgetScenarioResultFields }\n                    version\n                }\n            }\n        }\n        budgetScenarioCalculate(revivalId: $id, input: {}) { ...BudgetScenarioResultFields }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query RevivalBudgetSummary($id: ID!) {\n        revival(id: $id) {\n            id\n            budget {\n                revivalId\n                totals { budgetedIncome budgetedCost budgetedResult actualIncome actualCost actualResult }\n            }\n        }\n    }\n"): (typeof documents)["\n    query RevivalBudgetSummary($id: ID!) {\n        revival(id: $id) {\n            id\n            budget {\n                revivalId\n                totals { budgetedIncome budgetedCost budgetedResult actualIncome actualCost actualResult }\n            }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query BudgetScenarioCalculate($revivalId: ID!, $input: BudgetScenarioInput!) {\n        budgetScenarioCalculate(revivalId: $revivalId, input: $input) { ...BudgetScenarioResultFields }\n    }\n"): (typeof documents)["\n    query BudgetScenarioCalculate($revivalId: ID!, $input: BudgetScenarioInput!) {\n        budgetScenarioCalculate(revivalId: $revivalId, input: $input) { ...BudgetScenarioResultFields }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation BudgetSettingsUpdate($input: BudgetSettingsInput!) {\n        budgetSettingsUpdate(input: $input) { revivalId }\n    }\n"): (typeof documents)["\n    mutation BudgetSettingsUpdate($input: BudgetSettingsInput!) {\n        budgetSettingsUpdate(input: $input) { revivalId }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation BudgetLineCreate($input: BudgetLineCreateInput!) {\n        budgetLineCreate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation BudgetLineCreate($input: BudgetLineCreateInput!) {\n        budgetLineCreate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation BudgetLineUpdate($input: BudgetLineUpdateInput!) {\n        budgetLineUpdate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation BudgetLineUpdate($input: BudgetLineUpdateInput!) {\n        budgetLineUpdate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation BudgetLineRemove($id: ID!, $version: Int!) {\n        budgetLineRemove(id: $id, version: $version) { id }\n    }\n"): (typeof documents)["\n    mutation BudgetLineRemove($id: ID!, $version: Int!) {\n        budgetLineRemove(id: $id, version: $version) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation BudgetLineRestore($id: ID!, $version: Int!) {\n        budgetLineRestore(id: $id, version: $version) { id }\n    }\n"): (typeof documents)["\n    mutation BudgetLineRestore($id: ID!, $version: Int!) {\n        budgetLineRestore(id: $id, version: $version) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation TransactionCreate($input: TransactionCreateInput!) {\n        transactionCreate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation TransactionCreate($input: TransactionCreateInput!) {\n        transactionCreate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation TransactionUpdate($input: TransactionUpdateInput!) {\n        transactionUpdate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation TransactionUpdate($input: TransactionUpdateInput!) {\n        transactionUpdate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation TransactionCancel($id: ID!, $version: Int!) {\n        transactionCancel(id: $id, version: $version) { id }\n    }\n"): (typeof documents)["\n    mutation TransactionCancel($id: ID!, $version: Int!) {\n        transactionCancel(id: $id, version: $version) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation TransactionSetReimbursed($id: ID!, $version: Int!, $reimbursed: Boolean!) {\n        transactionSetReimbursed(id: $id, version: $version, reimbursed: $reimbursed) { id }\n    }\n"): (typeof documents)["\n    mutation TransactionSetReimbursed($id: ID!, $version: Int!, $reimbursed: Boolean!) {\n        transactionSetReimbursed(id: $id, version: $version, reimbursed: $reimbursed) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation BudgetScenarioSave($input: BudgetScenarioSaveInput!) {\n        budgetScenarioSave(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation BudgetScenarioSave($input: BudgetScenarioSaveInput!) {\n        budgetScenarioSave(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation BudgetScenarioUpdate($id: ID!, $version: Int!, $input: BudgetScenarioSaveInput!) {\n        budgetScenarioUpdate(id: $id, version: $version, input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation BudgetScenarioUpdate($id: ID!, $version: Int!, $input: BudgetScenarioSaveInput!) {\n        budgetScenarioUpdate(id: $id, version: $version, input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation BudgetScenarioRemove($id: ID!, $version: Int!) {\n        budgetScenarioRemove(id: $id, version: $version)\n    }\n"): (typeof documents)["\n    mutation BudgetScenarioRemove($id: ID!, $version: Int!) {\n        budgetScenarioRemove(id: $id, version: $version)\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment BudgetCategoryFields on BudgetCategory {\n        id\n        kind\n        role\n        name { sv en }\n        retired\n    }\n"): (typeof documents)["\n    fragment BudgetCategoryFields on BudgetCategory {\n        id\n        kind\n        role\n        name { sv en }\n        retired\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment BudgetLineFields on BudgetLine {\n        id\n        category { ...BudgetCategoryFields }\n        description\n        quantity\n        unitAmount\n        amount\n        event { id title startDate endDate cancelled }\n        logEntry { id number type status }\n        comment\n        removed\n        version\n    }\n"): (typeof documents)["\n    fragment BudgetLineFields on BudgetLine {\n        id\n        category { ...BudgetCategoryFields }\n        description\n        quantity\n        unitAmount\n        amount\n        event { id title startDate endDate cancelled }\n        logEntry { id number type status }\n        comment\n        removed\n        version\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment TransactionFields on Transaction {\n        id\n        date\n        amount\n        category { ...BudgetCategoryFields }\n        description\n        budgetLine { id description removed }\n        paidBy { ...OwnerFields }\n        reimbursed\n        reimbursedAt\n        receipt { filename contentType size uploadedAt }\n        cancelled\n        version\n    }\n"): (typeof documents)["\n    fragment TransactionFields on Transaction {\n        id\n        date\n        amount\n        category { ...BudgetCategoryFields }\n        description\n        budgetLine { id description removed }\n        paidBy { ...OwnerFields }\n        reimbursed\n        reimbursedAt\n        receipt { filename contentType size uploadedAt }\n        cancelled\n        version\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment BudgetScenarioParametersFields on BudgetScenarioParameters {\n        participants\n        participationFee\n        showTicketPrice\n        showTickets\n        partyTicketPrice\n        partyTickets\n        venueCost\n        partyCost\n    }\n"): (typeof documents)["\n    fragment BudgetScenarioParametersFields on BudgetScenarioParameters {\n        participants\n        participationFee\n        showTicketPrice\n        showTickets\n        partyTicketPrice\n        partyTickets\n        venueCost\n        partyCost\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment BudgetScenarioResultFields on BudgetScenarioResult {\n        baseline { ...BudgetScenarioParametersFields }\n        used { ...BudgetScenarioParametersFields }\n        income\n        cost\n        result\n        breakEvenShowTickets\n        partySubsidy\n    }\n"): (typeof documents)["\n    fragment BudgetScenarioResultFields on BudgetScenarioResult {\n        baseline { ...BudgetScenarioParametersFields }\n        used { ...BudgetScenarioParametersFields }\n        income\n        cost\n        result\n        breakEvenShowTickets\n        partySubsidy\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment EventTypeBudgetLineFields on EventTypeBudgetLine {\n        id\n        category { ...BudgetCategoryFields }\n        description { sv en }\n        quantityRule\n        quantity\n        unitAmount\n        version\n    }\n"): (typeof documents)["\n    fragment EventTypeBudgetLineFields on EventTypeBudgetLine {\n        id\n        category { ...BudgetCategoryFields }\n        description { sv en }\n        quantityRule\n        quantity\n        unitAmount\n        version\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment ReferenceRevivalFields on ReferenceRevival {\n        id\n        label\n        year\n        participants\n        comment\n        automatic\n        figures { category { ...BudgetCategoryFields } budgeted actual }\n        version\n    }\n"): (typeof documents)["\n    fragment ReferenceRevivalFields on ReferenceRevival {\n        id\n        label\n        year\n        participants\n        comment\n        automatic\n        figures { category { ...BudgetCategoryFields } budgeted actual }\n        version\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query BudgetCategories($includeRetired: Boolean) {\n        budgetCategories(includeRetired: $includeRetired) { ...BudgetCategoryFields position inUse version }\n    }\n"): (typeof documents)["\n    query BudgetCategories($includeRetired: Boolean) {\n        budgetCategories(includeRetired: $includeRetired) { ...BudgetCategoryFields position inUse version }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation BudgetCategoryCreate($input: BudgetCategoryCreateInput!) {\n        budgetCategoryCreate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation BudgetCategoryCreate($input: BudgetCategoryCreateInput!) {\n        budgetCategoryCreate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation BudgetCategoryUpdate($input: BudgetCategoryUpdateInput!) {\n        budgetCategoryUpdate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation BudgetCategoryUpdate($input: BudgetCategoryUpdateInput!) {\n        budgetCategoryUpdate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation BudgetCategoryMove($id: ID!, $version: Int!, $position: Int!) {\n        budgetCategoryMove(id: $id, version: $version, position: $position) { id }\n    }\n"): (typeof documents)["\n    mutation BudgetCategoryMove($id: ID!, $version: Int!, $position: Int!) {\n        budgetCategoryMove(id: $id, version: $version, position: $position) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation BudgetCategoryRetire($id: ID!, $version: Int!) {\n        budgetCategoryRetire(id: $id, version: $version) { id }\n    }\n"): (typeof documents)["\n    mutation BudgetCategoryRetire($id: ID!, $version: Int!) {\n        budgetCategoryRetire(id: $id, version: $version) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation BudgetCategoryRestore($id: ID!, $version: Int!) {\n        budgetCategoryRestore(id: $id, version: $version) { id }\n    }\n"): (typeof documents)["\n    mutation BudgetCategoryRestore($id: ID!, $version: Int!) {\n        budgetCategoryRestore(id: $id, version: $version) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation BudgetCategoryDelete($id: ID!, $version: Int!) {\n        budgetCategoryDelete(id: $id, version: $version)\n    }\n"): (typeof documents)["\n    mutation BudgetCategoryDelete($id: ID!, $version: Int!) {\n        budgetCategoryDelete(id: $id, version: $version)\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query ReferenceRevivals {\n        referenceRevivals { ...ReferenceRevivalFields }\n    }\n"): (typeof documents)["\n    query ReferenceRevivals {\n        referenceRevivals { ...ReferenceRevivalFields }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ReferenceRevivalCreate($input: ReferenceRevivalInput!) {\n        referenceRevivalCreate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation ReferenceRevivalCreate($input: ReferenceRevivalInput!) {\n        referenceRevivalCreate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ReferenceRevivalUpdate($id: ID!, $version: Int!, $input: ReferenceRevivalInput!) {\n        referenceRevivalUpdate(id: $id, version: $version, input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation ReferenceRevivalUpdate($id: ID!, $version: Int!, $input: ReferenceRevivalInput!) {\n        referenceRevivalUpdate(id: $id, version: $version, input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ReferenceRevivalDelete($id: ID!, $version: Int!) {\n        referenceRevivalDelete(id: $id, version: $version)\n    }\n"): (typeof documents)["\n    mutation ReferenceRevivalDelete($id: ID!, $version: Int!) {\n        referenceRevivalDelete(id: $id, version: $version)\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation EventTypeBudgetLineCreate($input: EventTypeBudgetLineInput!) {\n        eventTypeBudgetLineCreate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation EventTypeBudgetLineCreate($input: EventTypeBudgetLineInput!) {\n        eventTypeBudgetLineCreate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation EventTypeBudgetLineUpdate($id: ID!, $version: Int!, $input: EventTypeBudgetLineInput!) {\n        eventTypeBudgetLineUpdate(id: $id, version: $version, input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation EventTypeBudgetLineUpdate($id: ID!, $version: Int!, $input: EventTypeBudgetLineInput!) {\n        eventTypeBudgetLineUpdate(id: $id, version: $version, input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation EventTypeBudgetLineRemove($id: ID!, $version: Int!) {\n        eventTypeBudgetLineRemove(id: $id, version: $version) { id }\n    }\n"): (typeof documents)["\n    mutation EventTypeBudgetLineRemove($id: ID!, $version: Int!) {\n        eventTypeBudgetLineRemove(id: $id, version: $version) { id }\n    }\n"];
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
export function graphql(source: "\n    query RevivalChecklists($id: ID!, $filter: ChecklistItemFilter, $filtered: Boolean!, $includeCancelled: Boolean!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            permissions { canWriteLog }\n            ownerCandidates(includeParticipants: true) { id displayName }\n        }\n        checklists(revivalId: $id, includeCancelled: $includeCancelled) { id kind chapterKey chapterTitle { sv en } name date cancelled openCount overdueCount totalCount }\n        checklistItems(revivalId: $id, filter: $filter) @include(if: $filtered) { ...ChecklistItemFields }\n    }\n"): (typeof documents)["\n    query RevivalChecklists($id: ID!, $filter: ChecklistItemFilter, $filtered: Boolean!, $includeCancelled: Boolean!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            permissions { canWriteLog }\n            ownerCandidates(includeParticipants: true) { id displayName }\n        }\n        checklists(revivalId: $id, includeCancelled: $includeCancelled) { id kind chapterKey chapterTitle { sv en } name date cancelled openCount overdueCount totalCount }\n        checklistItems(revivalId: $id, filter: $filter) @include(if: $filtered) { ...ChecklistItemFields }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Checklist($id: ID!, $revivalId: ID!) {\n        revival(id: $revivalId) {\n            id\n            title\n            permissions { canWriteLog canWaiveRequirement }\n            ownerCandidates(includeParticipants: true) { id displayName }\n        }\n        checklist(id: $id) {\n            id\n            revivalId\n            kind\n            chapterKey\n            chapterTitle { sv en }\n            name\n            date\n            cancelled\n            version\n            template { id name { sv en } }\n            event { id title }\n            templatesAvailable { id kind chapterKey chapterTitle { sv en } name { sv en } }\n            tips { ...GuideItemFields }\n            items { ...ChecklistItemFields }\n        }\n    }\n"): (typeof documents)["\n    query Checklist($id: ID!, $revivalId: ID!) {\n        revival(id: $revivalId) {\n            id\n            title\n            permissions { canWriteLog canWaiveRequirement }\n            ownerCandidates(includeParticipants: true) { id displayName }\n        }\n        checklist(id: $id) {\n            id\n            revivalId\n            kind\n            chapterKey\n            chapterTitle { sv en }\n            name\n            date\n            cancelled\n            version\n            template { id name { sv en } }\n            event { id title }\n            templatesAvailable { id kind chapterKey chapterTitle { sv en } name { sv en } }\n            tips { ...GuideItemFields }\n            items { ...ChecklistItemFields }\n        }\n    }\n"];
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
export function graphql(source: "\n    fragment SyncRunFields on SyncRun {\n        id\n        status\n        startedBy { id displayName }\n        startedAt\n        finishedAt\n        total\n        done\n        failed\n        failures { participant { id displayName } operation reason }\n    }\n"): (typeof documents)["\n    fragment SyncRunFields on SyncRun {\n        id\n        status\n        startedBy { id displayName }\n        startedAt\n        finishedAt\n        total\n        done\n        failed\n        failures { participant { id displayName } operation reason }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query RevivalClosing($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            year\n            status\n            version\n            anonymizedAt\n            permissions { canReadWork canReadParticipants canReadBudget canWriteLog canSync canAnonymize canSetMembership }\n            ownerCandidates { id displayName }\n            closing {\n                actualResult\n                loanAmount\n                loanRepaid\n                surplusDecision { id number type status }\n                membershipYear\n                membershipsPaid\n                suggestions\n                lastSync { ...SyncRunFields }\n                anonymizedAt\n                autoAnonymizeOn\n            }\n        }\n    }\n"): (typeof documents)["\n    query RevivalClosing($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            year\n            status\n            version\n            anonymizedAt\n            permissions { canReadWork canReadParticipants canReadBudget canWriteLog canSync canAnonymize canSetMembership }\n            ownerCandidates { id displayName }\n            closing {\n                actualResult\n                loanAmount\n                loanRepaid\n                surplusDecision { id number type status }\n                membershipYear\n                membershipsPaid\n                suggestions\n                lastSync { ...SyncRunFields }\n                anonymizedAt\n                autoAnonymizeOn\n            }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query RevivalSyncSignal($id: ID!) {\n        revival(id: $id) {\n            id\n            closing { lastSync { id status failed } }\n        }\n    }\n"): (typeof documents)["\n    query RevivalSyncSignal($id: ID!) {\n        revival(id: $id) {\n            id\n            closing { lastSync { id status failed } }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query MembershipParticipants($revivalId: ID!) {\n        participants(revivalId: $revivalId, includeRemoved: false) {\n            id\n            kind\n            firstName\n            lastName\n            nickName\n            response\n            membershipPaid\n            removed\n        }\n    }\n"): (typeof documents)["\n    query MembershipParticipants($revivalId: ID!) {\n        participants(revivalId: $revivalId, includeRemoved: false) {\n            id\n            kind\n            firstName\n            lastName\n            nickName\n            response\n            membershipPaid\n            removed\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query SyncPreview($revivalId: ID!) {\n        syncPreview(revivalId: $revivalId) {\n            revivalId\n            hash\n            spexregisterRevivalExists\n            participants {\n                participant { id displayName position { id name } }\n                operations { operation detail exists }\n            }\n            excluded { id displayName }\n            membershipYear\n            lastRun { ...SyncRunFields }\n        }\n    }\n"): (typeof documents)["\n    query SyncPreview($revivalId: ID!) {\n        syncPreview(revivalId: $revivalId) {\n            revivalId\n            hash\n            spexregisterRevivalExists\n            participants {\n                participant { id displayName position { id name } }\n                operations { operation detail exists }\n            }\n            excluded { id displayName }\n            membershipYear\n            lastRun { ...SyncRunFields }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query SyncRun($id: ID!) {\n        syncRun(id: $id) { ...SyncRunFields }\n    }\n"): (typeof documents)["\n    query SyncRun($id: ID!) {\n        syncRun(id: $id) { ...SyncRunFields }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation SyncStart($revivalId: ID!, $previewHash: String!) {\n        syncStart(revivalId: $revivalId, previewHash: $previewHash) { ...SyncRunFields }\n    }\n"): (typeof documents)["\n    mutation SyncStart($revivalId: ID!, $previewHash: String!) {\n        syncStart(revivalId: $revivalId, previewHash: $previewHash) { ...SyncRunFields }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation MembershipSet($input: MembershipSetInput!) {\n        membershipSet(input: $input) { id membershipPaid }\n    }\n"): (typeof documents)["\n    mutation MembershipSet($input: MembershipSetInput!) {\n        membershipSet(input: $input) { id membershipPaid }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation RevivalAnonymize($id: ID!, $version: Int!, $confirmation: String!) {\n        revivalAnonymize(id: $id, version: $version, confirmation: $confirmation) { id anonymizedAt version }\n    }\n"): (typeof documents)["\n    mutation RevivalAnonymize($id: ID!, $version: Int!, $confirmation: String!) {\n        revivalAnonymize(id: $id, version: $version, confirmation: $confirmation) { id anonymizedAt version }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment OwnerFields on Owner {\n        name\n        person { id displayName active }\n    }\n"): (typeof documents)["\n    fragment OwnerFields on Owner {\n        name\n        person { id displayName active }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment LogEntryFields on LogEntry {\n        id\n        number\n        date\n        type\n        text\n        status\n        owner { ...OwnerFields }\n        deadline\n        overdue\n        comment\n        tags\n        meeting { id date title status }\n        guideItemKey\n        guideItem { id key type { ...GuideItemTypeFields } text { sv en } version }\n        checklistItem { id checklistId state text { sv en } }\n        event { id title startDate cancelled }\n        budgetLines { id description amount }\n        answers { id number type status }\n        answeredBy { id number type status }\n        origin\n        createdBy\n        createdAt\n        version\n    }\n"): (typeof documents)["\n    fragment LogEntryFields on LogEntry {\n        id\n        number\n        date\n        type\n        text\n        status\n        owner { ...OwnerFields }\n        deadline\n        overdue\n        comment\n        tags\n        meeting { id date title status }\n        guideItemKey\n        guideItem { id key type { ...GuideItemTypeFields } text { sv en } version }\n        checklistItem { id checklistId state text { sv en } }\n        event { id title startDate cancelled }\n        budgetLines { id description amount }\n        answers { id number type status }\n        answeredBy { id number type status }\n        origin\n        createdBy\n        createdAt\n        version\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query RevivalLog($id: ID!, $filter: LogEntryFilter) {\n        revival(id: $id) {\n            id\n            title\n            year\n            status\n            permissions { canWriteLog }\n            ownerCandidates { id displayName }\n        }\n        logEntries(revivalId: $id, filter: $filter) { ...LogEntryFields }\n        logTags(revivalId: $id)\n        meetings(revivalId: $id) { id date title }\n        events(revivalId: $id, includeCancelled: true) { id title startDate cancelled }\n    }\n"): (typeof documents)["\n    query RevivalLog($id: ID!, $filter: LogEntryFilter) {\n        revival(id: $id) {\n            id\n            title\n            year\n            status\n            permissions { canWriteLog }\n            ownerCandidates { id displayName }\n        }\n        logEntries(revivalId: $id, filter: $filter) { ...LogEntryFields }\n        logTags(revivalId: $id)\n        meetings(revivalId: $id) { id date title }\n        events(revivalId: $id, includeCancelled: true) { id title startDate cancelled }\n    }\n"];
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
export function graphql(source: "\n    query RevivalEvents($id: ID!, $includeCancelled: Boolean!, $withMeetings: Boolean!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            premiereDate\n            shows { date time venue }\n            permissions { canWriteLog canSubscribeCalendar }\n            eventProposals { type { ...EventTypeFields } startDate endDate earliest latest }\n            calendarFeed { createdAt }\n        }\n        events(revivalId: $id, includeCancelled: $includeCancelled) { ...EventFields }\n        eventTypes { ...EventTypeFields }\n        meetings(revivalId: $id) @include(if: $withMeetings) { id date title status }\n    }\n"): (typeof documents)["\n    query RevivalEvents($id: ID!, $includeCancelled: Boolean!, $withMeetings: Boolean!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            premiereDate\n            shows { date time venue }\n            permissions { canWriteLog canSubscribeCalendar }\n            eventProposals { type { ...EventTypeFields } startDate endDate earliest latest }\n            calendarFeed { createdAt }\n        }\n        events(revivalId: $id, includeCancelled: $includeCancelled) { ...EventFields }\n        eventTypes { ...EventTypeFields }\n        meetings(revivalId: $id) @include(if: $withMeetings) { id date title status }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query EventTypes($includeRetired: Boolean) {\n        eventTypes(includeRetired: $includeRetired) { ...EventTypeFields budgetLines { ...EventTypeBudgetLineFields } }\n    }\n"): (typeof documents)["\n    query EventTypes($includeRetired: Boolean) {\n        eventTypes(includeRetired: $includeRetired) { ...EventTypeFields budgetLines { ...EventTypeBudgetLineFields } }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation EventCreate($input: EventCreateInput!) {\n        eventCreate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation EventCreate($input: EventCreateInput!) {\n        eventCreate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation EventUpdate($input: EventUpdateInput!) {\n        eventUpdate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation EventUpdate($input: EventUpdateInput!) {\n        eventUpdate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation EventCancel($id: ID!, $version: Int!) {\n        eventCancel(id: $id, version: $version) { id }\n    }\n"): (typeof documents)["\n    mutation EventCancel($id: ID!, $version: Int!) {\n        eventCancel(id: $id, version: $version) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation EventRestore($id: ID!, $version: Int!) {\n        eventRestore(id: $id, version: $version) { id }\n    }\n"): (typeof documents)["\n    mutation EventRestore($id: ID!, $version: Int!) {\n        eventRestore(id: $id, version: $version) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation EventTypeCreate($input: EventTypeInput!) {\n        eventTypeCreate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation EventTypeCreate($input: EventTypeInput!) {\n        eventTypeCreate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation EventTypeUpdate($id: ID!, $version: Int!, $input: EventTypeInput!) {\n        eventTypeUpdate(id: $id, version: $version, input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation EventTypeUpdate($id: ID!, $version: Int!, $input: EventTypeInput!) {\n        eventTypeUpdate(id: $id, version: $version, input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation EventTypeMove($id: ID!, $version: Int!, $position: Int!) {\n        eventTypeMove(id: $id, version: $version, position: $position) { id }\n    }\n"): (typeof documents)["\n    mutation EventTypeMove($id: ID!, $version: Int!, $position: Int!) {\n        eventTypeMove(id: $id, version: $version, position: $position) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation EventTypeRetire($id: ID!, $version: Int!) {\n        eventTypeRetire(id: $id, version: $version) { id }\n    }\n"): (typeof documents)["\n    mutation EventTypeRetire($id: ID!, $version: Int!) {\n        eventTypeRetire(id: $id, version: $version) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation EventTypeRestore($id: ID!, $version: Int!) {\n        eventTypeRestore(id: $id, version: $version) { id }\n    }\n"): (typeof documents)["\n    mutation EventTypeRestore($id: ID!, $version: Int!) {\n        eventTypeRestore(id: $id, version: $version) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation CalendarFeedCreate($revivalId: ID!) {\n        calendarFeedCreate(revivalId: $revivalId) { url createdAt }\n    }\n"): (typeof documents)["\n    mutation CalendarFeedCreate($revivalId: ID!) {\n        calendarFeedCreate(revivalId: $revivalId) { url createdAt }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation CalendarFeedRevoke($revivalId: ID!) {\n        calendarFeedRevoke(revivalId: $revivalId)\n    }\n"): (typeof documents)["\n    mutation CalendarFeedRevoke($revivalId: ID!) {\n        calendarFeedRevoke(revivalId: $revivalId)\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment EventTypeFields on EventType {\n        id\n        name { sv en }\n        description { sv en }\n        rooms { sv en }\n        catering { sv en }\n        offsetMinDays\n        offsetMaxDays\n        days\n        revivalPays\n        checklistTemplate { id name { sv en } retired }\n        position\n        retired\n        version\n    }\n"): (typeof documents)["\n    fragment EventTypeFields on EventType {\n        id\n        name { sv en }\n        description { sv en }\n        rooms { sv en }\n        catering { sv en }\n        offsetMinDays\n        offsetMaxDays\n        days\n        revivalPays\n        checklistTemplate { id name { sv en } retired }\n        position\n        retired\n        version\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment EventFields on Event {\n        id\n        revivalId\n        type { id name { sv en } days revivalPays retired }\n        title\n        startDate\n        endDate\n        startTime\n        endTime\n        location\n        description\n        revivalPays\n        daysFromPremiere\n        checklist { id openCount totalCount cancelled }\n        cancelled\n        version\n    }\n"): (typeof documents)["\n    fragment EventFields on Event {\n        id\n        revivalId\n        type { id name { sv en } days revivalPays retired }\n        title\n        startDate\n        endDate\n        startTime\n        endTime\n        location\n        description\n        revivalPays\n        daysFromPremiere\n        checklist { id openCount totalCount cancelled }\n        cancelled\n        version\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment GuideItemFields on GuideItem {\n        id\n        key\n        type { ...GuideItemTypeFields }\n        text { sv en }\n        libraryEntries { id kind name { sv en } retired }\n        version\n    }\n"): (typeof documents)["\n    fragment GuideItemFields on GuideItem {\n        id\n        key\n        type { ...GuideItemTypeFields }\n        text { sv en }\n        libraryEntries { id kind name { sv en } retired }\n        version\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment GuideVersionFields on GuideVersion {\n        id\n        status\n        label\n        note\n        publishedAt\n        publishedBy\n        version\n        basedOn { id label publishedAt }\n        introduction { sv en }\n        chapters {\n            id\n            key\n            title { sv en }\n            version\n            items { ...GuideItemFields }\n            sections {\n                id\n                key\n                title { sv en }\n                version\n                items { ...GuideItemFields }\n            }\n        }\n    }\n"): (typeof documents)["\n    fragment GuideVersionFields on GuideVersion {\n        id\n        status\n        label\n        note\n        publishedAt\n        publishedBy\n        version\n        basedOn { id label publishedAt }\n        introduction { sv en }\n        chapters {\n            id\n            key\n            title { sv en }\n            version\n            items { ...GuideItemFields }\n            sections {\n                id\n                key\n                title { sv en }\n                version\n                items { ...GuideItemFields }\n            }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query GuideReadable {\n        guideReadable\n    }\n"): (typeof documents)["\n    query GuideReadable {\n        guideReadable\n    }\n"];
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
export function graphql(source: "\n    fragment LibraryEntryFields on LibraryEntry {\n        id\n        kind\n        name { sv en }\n        description { sv en }\n        pros { sv en }\n        cons { sv en }\n        booking { sv en }\n        prices { sv en }\n        contact { sv en }\n        url\n        retired\n        version\n    }\n"): (typeof documents)["\n    fragment LibraryEntryFields on LibraryEntry {\n        id\n        kind\n        name { sv en }\n        description { sv en }\n        pros { sv en }\n        cons { sv en }\n        booking { sv en }\n        prices { sv en }\n        contact { sv en }\n        url\n        retired\n        version\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query LibraryEntries($includeRetired: Boolean) {\n        libraryEntries(includeRetired: $includeRetired) { ...LibraryEntryFields }\n    }\n"): (typeof documents)["\n    query LibraryEntries($includeRetired: Boolean) {\n        libraryEntries(includeRetired: $includeRetired) { ...LibraryEntryFields }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation LibraryEntryCreate($input: LibraryEntryInput!) {\n        libraryEntryCreate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation LibraryEntryCreate($input: LibraryEntryInput!) {\n        libraryEntryCreate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation LibraryEntryUpdate($id: ID!, $version: Int!, $input: LibraryEntryInput!) {\n        libraryEntryUpdate(id: $id, version: $version, input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation LibraryEntryUpdate($id: ID!, $version: Int!, $input: LibraryEntryInput!) {\n        libraryEntryUpdate(id: $id, version: $version, input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation LibraryEntryRetire($id: ID!, $version: Int!) {\n        libraryEntryRetire(id: $id, version: $version) { id }\n    }\n"): (typeof documents)["\n    mutation LibraryEntryRetire($id: ID!, $version: Int!) {\n        libraryEntryRetire(id: $id, version: $version) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation LibraryEntryRestore($id: ID!, $version: Int!) {\n        libraryEntryRestore(id: $id, version: $version) { id }\n    }\n"): (typeof documents)["\n    mutation LibraryEntryRestore($id: ID!, $version: Int!) {\n        libraryEntryRestore(id: $id, version: $version) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment MailingTemplateFields on MailingTemplate {\n        id\n        name { sv en }\n        subject { sv en }\n        body { sv en }\n        audience\n        eventType { id name { sv en } retired }\n        due { kind amount weekday }\n        position\n        retired\n        version\n    }\n"): (typeof documents)["\n    fragment MailingTemplateFields on MailingTemplate {\n        id\n        name { sv en }\n        subject { sv en }\n        body { sv en }\n        audience\n        eventType { id name { sv en } retired }\n        due { kind amount weekday }\n        position\n        retired\n        version\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment MailingFields on Mailing {\n        id\n        revivalId\n        audience { kind position { id name } event { id title startDate } }\n        subject\n        body\n        status\n        plannedFor { template { id name { sv en } } event { id title } dueDate }\n        createdBy { id displayName }\n        createdAt\n        sentBy { id displayName }\n        sentAt\n        recipients { displayName status }\n        canSend\n        version\n    }\n"): (typeof documents)["\n    fragment MailingFields on Mailing {\n        id\n        revivalId\n        audience { kind position { id name } event { id title startDate } }\n        subject\n        body\n        status\n        plannedFor { template { id name { sv en } } event { id title } dueDate }\n        createdBy { id displayName }\n        createdAt\n        sentBy { id displayName }\n        sentAt\n        recipients { displayName status }\n        canSend\n        version\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Mailings($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            permissions { canReadMailings canDraftMailings canSendMailings }\n            mailingPlan {\n                template { ...MailingTemplateFields }\n                event { id title startDate }\n                dueDate\n                mailing { id status subject sentAt }\n                due\n            }\n        }\n        mailings(revivalId: $id) { ...MailingFields }\n    }\n"): (typeof documents)["\n    query Mailings($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            permissions { canReadMailings canDraftMailings canSendMailings }\n            mailingPlan {\n                template { ...MailingTemplateFields }\n                event { id title startDate }\n                dueDate\n                mailing { id status subject sentAt }\n                due\n            }\n        }\n        mailings(revivalId: $id) { ...MailingFields }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Mailing($id: ID!, $revivalId: ID!) {\n        revival(id: $revivalId) {\n            id\n            title\n            status\n            permissions { canReadMailings canDraftMailings canSendMailings }\n        }\n        mailing(id: $id) { ...MailingFields }\n    }\n"): (typeof documents)["\n    query Mailing($id: ID!, $revivalId: ID!) {\n        revival(id: $revivalId) {\n            id\n            title\n            status\n            permissions { canReadMailings canDraftMailings canSendMailings }\n        }\n        mailing(id: $id) { ...MailingFields }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query MailingEditorOptions($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            permissions { canReadMailings canDraftMailings canSendMailings }\n            mailingPlan { template { ...MailingTemplateFields } event { id title startDate } dueDate due }\n        }\n        events(revivalId: $id, includeCancelled: false) { id title startDate }\n    }\n"): (typeof documents)["\n    query MailingEditorOptions($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            permissions { canReadMailings canDraftMailings canSendMailings }\n            mailingPlan { template { ...MailingTemplateFields } event { id title startDate } dueDate due }\n        }\n        events(revivalId: $id, includeCancelled: false) { id title startDate }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query MailingPositions {\n        positions { id name category hasRole }\n    }\n"): (typeof documents)["\n    query MailingPositions {\n        positions { id name category hasRole }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query MailingAudiencePreview($revivalId: ID!, $audience: MailingAudienceInput!) {\n        mailingAudiencePreview(revivalId: $revivalId, audience: $audience) { displayName hasAddress }\n    }\n"): (typeof documents)["\n    query MailingAudiencePreview($revivalId: ID!, $audience: MailingAudienceInput!) {\n        mailingAudiencePreview(revivalId: $revivalId, audience: $audience) { displayName hasAddress }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query MailingTemplates($includeRetired: Boolean) {\n        mailingTemplates(includeRetired: $includeRetired) { ...MailingTemplateFields }\n    }\n"): (typeof documents)["\n    query MailingTemplates($includeRetired: Boolean) {\n        mailingTemplates(includeRetired: $includeRetired) { ...MailingTemplateFields }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation MailingCreate($input: MailingInput!) {\n        mailingCreate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation MailingCreate($input: MailingInput!) {\n        mailingCreate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation MailingUpdate($id: ID!, $version: Int!, $input: MailingInput!) {\n        mailingUpdate(id: $id, version: $version, input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation MailingUpdate($id: ID!, $version: Int!, $input: MailingInput!) {\n        mailingUpdate(id: $id, version: $version, input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation MailingCancel($id: ID!, $version: Int!) {\n        mailingCancel(id: $id, version: $version) { id }\n    }\n"): (typeof documents)["\n    mutation MailingCancel($id: ID!, $version: Int!) {\n        mailingCancel(id: $id, version: $version) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation MailingSend($id: ID!, $version: Int!) {\n        mailingSend(id: $id, version: $version) { id recipients { status } }\n    }\n"): (typeof documents)["\n    mutation MailingSend($id: ID!, $version: Int!) {\n        mailingSend(id: $id, version: $version) { id recipients { status } }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation MailingRetry($id: ID!) {\n        mailingRetry(id: $id) { id recipients { status } }\n    }\n"): (typeof documents)["\n    mutation MailingRetry($id: ID!) {\n        mailingRetry(id: $id) { id recipients { status } }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation MailingTemplateCreate($input: MailingTemplateInput!) {\n        mailingTemplateCreate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation MailingTemplateCreate($input: MailingTemplateInput!) {\n        mailingTemplateCreate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation MailingTemplateUpdate($id: ID!, $version: Int!, $input: MailingTemplateInput!) {\n        mailingTemplateUpdate(id: $id, version: $version, input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation MailingTemplateUpdate($id: ID!, $version: Int!, $input: MailingTemplateInput!) {\n        mailingTemplateUpdate(id: $id, version: $version, input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation MailingTemplateMove($id: ID!, $version: Int!, $position: Int!) {\n        mailingTemplateMove(id: $id, version: $version, position: $position) { id }\n    }\n"): (typeof documents)["\n    mutation MailingTemplateMove($id: ID!, $version: Int!, $position: Int!) {\n        mailingTemplateMove(id: $id, version: $version, position: $position) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation MailingTemplateRetire($id: ID!, $version: Int!) {\n        mailingTemplateRetire(id: $id, version: $version) { id }\n    }\n"): (typeof documents)["\n    mutation MailingTemplateRetire($id: ID!, $version: Int!) {\n        mailingTemplateRetire(id: $id, version: $version) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation MailingTemplateRestore($id: ID!, $version: Int!) {\n        mailingTemplateRestore(id: $id, version: $version) { id }\n    }\n"): (typeof documents)["\n    mutation MailingTemplateRestore($id: ID!, $version: Int!) {\n        mailingTemplateRestore(id: $id, version: $version) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment LinkServiceFields on LinkService {\n        id\n        name { sv en }\n        hosts\n        homeUrl\n        retired\n    }\n"): (typeof documents)["\n    fragment LinkServiceFields on LinkService {\n        id\n        name { sv en }\n        hosts\n        homeUrl\n        retired\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment MaterialFields on Material {\n        id\n        title\n        url\n        service { ...LinkServiceFields }\n        serviceChosen\n        category\n        visibility\n        positions { ...PositionFields }\n        comment\n        removed\n        version\n    }\n"): (typeof documents)["\n    fragment MaterialFields on Material {\n        id\n        title\n        url\n        service { ...LinkServiceFields }\n        serviceChosen\n        category\n        visibility\n        positions { ...PositionFields }\n        comment\n        removed\n        version\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment InventoryItemFields on InventoryItem {\n        id\n        name\n        kind\n        quantity\n        status\n        location\n        locationNote\n        owner { name person { id displayName active } }\n        comment\n        material { id title url removed }\n        removed\n        version\n    }\n"): (typeof documents)["\n    fragment InventoryItemFields on InventoryItem {\n        id\n        name\n        kind\n        quantity\n        status\n        location\n        locationNote\n        owner { name person { id displayName active } }\n        comment\n        material { id title url removed }\n        removed\n        version\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query MaterialsAccess($id: ID!) {\n        revival(id: $id) {\n            id\n            status\n            permissions { canReadMaterials canWriteMaterials }\n        }\n    }\n"): (typeof documents)["\n    query MaterialsAccess($id: ID!) {\n        revival(id: $id) {\n            id\n            status\n            permissions { canReadMaterials canWriteMaterials }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query RevivalMaterials($id: ID!, $includeRemoved: Boolean!) {\n        revival(id: $id) {\n            id\n            status\n            permissions { canWriteMaterials }\n        }\n        materials(revivalId: $id, includeRemoved: $includeRemoved) { ...MaterialFields }\n        linkServices { ...LinkServiceFields }\n    }\n"): (typeof documents)["\n    query RevivalMaterials($id: ID!, $includeRemoved: Boolean!) {\n        revival(id: $id) {\n            id\n            status\n            permissions { canWriteMaterials }\n        }\n        materials(revivalId: $id, includeRemoved: $includeRemoved) { ...MaterialFields }\n        linkServices { ...LinkServiceFields }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query RevivalInventory($id: ID!, $includeRemoved: Boolean!) {\n        revival(id: $id) {\n            id\n            status\n            permissions { canWriteMaterials }\n            ownerCandidates { id displayName }\n        }\n        inventory(revivalId: $id, includeRemoved: $includeRemoved) { ...InventoryItemFields }\n        materials(revivalId: $id) { id title url removed }\n    }\n"): (typeof documents)["\n    query RevivalInventory($id: ID!, $includeRemoved: Boolean!) {\n        revival(id: $id) {\n            id\n            status\n            permissions { canWriteMaterials }\n            ownerCandidates { id displayName }\n        }\n        inventory(revivalId: $id, includeRemoved: $includeRemoved) { ...InventoryItemFields }\n        materials(revivalId: $id) { id title url removed }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query LinkServices($includeRetired: Boolean) {\n        linkServices(includeRetired: $includeRetired) { ...LinkServiceFields position inUse version }\n    }\n"): (typeof documents)["\n    query LinkServices($includeRetired: Boolean) {\n        linkServices(includeRetired: $includeRetired) { ...LinkServiceFields position inUse version }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation MaterialCreate($input: MaterialInput!) {\n        materialCreate(input: $input) { id service { id } }\n    }\n"): (typeof documents)["\n    mutation MaterialCreate($input: MaterialInput!) {\n        materialCreate(input: $input) { id service { id } }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation MaterialUpdate($id: ID!, $version: Int!, $input: MaterialInput!) {\n        materialUpdate(id: $id, version: $version, input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation MaterialUpdate($id: ID!, $version: Int!, $input: MaterialInput!) {\n        materialUpdate(id: $id, version: $version, input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation MaterialRemove($id: ID!, $version: Int!) {\n        materialRemove(id: $id, version: $version) { id }\n    }\n"): (typeof documents)["\n    mutation MaterialRemove($id: ID!, $version: Int!) {\n        materialRemove(id: $id, version: $version) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation MaterialRestore($id: ID!, $version: Int!) {\n        materialRestore(id: $id, version: $version) { id }\n    }\n"): (typeof documents)["\n    mutation MaterialRestore($id: ID!, $version: Int!) {\n        materialRestore(id: $id, version: $version) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation InventoryItemCreate($input: InventoryItemInput!) {\n        inventoryItemCreate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation InventoryItemCreate($input: InventoryItemInput!) {\n        inventoryItemCreate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation InventoryItemUpdate($id: ID!, $version: Int!, $input: InventoryItemInput!) {\n        inventoryItemUpdate(id: $id, version: $version, input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation InventoryItemUpdate($id: ID!, $version: Int!, $input: InventoryItemInput!) {\n        inventoryItemUpdate(id: $id, version: $version, input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation InventoryItemRemove($id: ID!, $version: Int!) {\n        inventoryItemRemove(id: $id, version: $version) { id }\n    }\n"): (typeof documents)["\n    mutation InventoryItemRemove($id: ID!, $version: Int!) {\n        inventoryItemRemove(id: $id, version: $version) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation InventoryItemRestore($id: ID!, $version: Int!) {\n        inventoryItemRestore(id: $id, version: $version) { id }\n    }\n"): (typeof documents)["\n    mutation InventoryItemRestore($id: ID!, $version: Int!) {\n        inventoryItemRestore(id: $id, version: $version) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation LinkServiceCreate($input: LinkServiceInput!) {\n        linkServiceCreate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation LinkServiceCreate($input: LinkServiceInput!) {\n        linkServiceCreate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation LinkServiceUpdate($id: ID!, $version: Int!, $input: LinkServiceInput!) {\n        linkServiceUpdate(id: $id, version: $version, input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation LinkServiceUpdate($id: ID!, $version: Int!, $input: LinkServiceInput!) {\n        linkServiceUpdate(id: $id, version: $version, input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation LinkServiceMove($id: ID!, $version: Int!, $position: Int!) {\n        linkServiceMove(id: $id, version: $version, position: $position) { id }\n    }\n"): (typeof documents)["\n    mutation LinkServiceMove($id: ID!, $version: Int!, $position: Int!) {\n        linkServiceMove(id: $id, version: $version, position: $position) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation LinkServiceRetire($id: ID!, $version: Int!) {\n        linkServiceRetire(id: $id, version: $version) { id }\n    }\n"): (typeof documents)["\n    mutation LinkServiceRetire($id: ID!, $version: Int!) {\n        linkServiceRetire(id: $id, version: $version) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation LinkServiceRestore($id: ID!, $version: Int!) {\n        linkServiceRestore(id: $id, version: $version) { id }\n    }\n"): (typeof documents)["\n    mutation LinkServiceRestore($id: ID!, $version: Int!) {\n        linkServiceRestore(id: $id, version: $version) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation LinkServiceDelete($id: ID!, $version: Int!) {\n        linkServiceDelete(id: $id, version: $version)\n    }\n"): (typeof documents)["\n    mutation LinkServiceDelete($id: ID!, $version: Int!) {\n        linkServiceDelete(id: $id, version: $version)\n    }\n"];
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
export function graphql(source: "\n    query News($all: Boolean, $limit: Int) {\n        news(all: $all, limit: $limit) { id subject text visibleFrom visibleTo published createdAt lastModifiedAt version }\n    }\n"): (typeof documents)["\n    query News($all: Boolean, $limit: Int) {\n        news(all: $all, limit: $limit) { id subject text visibleFrom visibleTo published createdAt lastModifiedAt version }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation NewsCreate($input: NewsInput!) {\n        newsCreate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation NewsCreate($input: NewsInput!) {\n        newsCreate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation NewsUpdate($id: ID!, $version: Int!, $input: NewsInput!) {\n        newsUpdate(id: $id, version: $version, input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation NewsUpdate($id: ID!, $version: Int!, $input: NewsInput!) {\n        newsUpdate(id: $id, version: $version, input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation NewsDelete($id: ID!, $version: Int!) {\n        newsDelete(id: $id, version: $version)\n    }\n"): (typeof documents)["\n    mutation NewsDelete($id: ID!, $version: Int!) {\n        newsDelete(id: $id, version: $version)\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment PositionFields on Position {\n        id\n        name\n        category\n        hasRole\n    }\n"): (typeof documents)["\n    fragment PositionFields on Position {\n        id\n        name\n        category\n        hasRole\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment ParticipantFields on Participant {\n        id\n        revivalId\n        kind\n        spexareId\n        firstName\n        lastName\n        nickName\n        email\n        phone\n        pending\n        position { ...PositionFields }\n        roleName\n        vocalPart { id name }\n        preferredPosition { ...PositionFields }\n        response\n        respondedAt\n        comment\n        termsAcceptedAt\n        registerConsent\n        invitation\n        invitedAt\n        dietary\n        dietaryReadable\n        fee\n        feeOverride\n        feePaid\n        feePaidAt\n        compensationPerShift\n        removed\n        version\n    }\n"): (typeof documents)["\n    fragment ParticipantFields on Participant {\n        id\n        revivalId\n        kind\n        spexareId\n        firstName\n        lastName\n        nickName\n        email\n        phone\n        pending\n        position { ...PositionFields }\n        roleName\n        vocalPart { id name }\n        preferredPosition { ...PositionFields }\n        response\n        respondedAt\n        comment\n        termsAcceptedAt\n        registerConsent\n        invitation\n        invitedAt\n        dietary\n        dietaryReadable\n        fee\n        feeOverride\n        feePaid\n        feePaidAt\n        compensationPerShift\n        removed\n        version\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment SpexareCandidateFields on SpexareCandidate {\n        spexareId\n        firstName\n        lastName\n        nickName\n        graduation\n        history\n        added\n    }\n"): (typeof documents)["\n    fragment SpexareCandidateFields on SpexareCandidate {\n        spexareId\n        firstName\n        lastName\n        nickName\n        graduation\n        history\n        added\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment ParticipationSettingsFields on ParticipationSettings {\n        swishNumber\n        whatsappLink\n        terms\n        version\n    }\n"): (typeof documents)["\n    fragment ParticipationSettingsFields on ParticipationSettings {\n        swishNumber\n        whatsappLink\n        terms\n        version\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query ParticipantsOverview($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            permissions { canReadParticipants canWriteParticipants canReadDietary canWriteBudget }\n            participantCounts {\n                total\n                byResponse { response count }\n                byPosition { position { ...PositionFields } yes maybe pending }\n                notInvited\n                waitingForAccess\n                feesPaid\n                feesUnpaid\n                helpers\n            }\n            participationSettings { ...ParticipationSettingsFields }\n            referrals { id name contact comment referredBy createdAt }\n        }\n    }\n"): (typeof documents)["\n    query ParticipantsOverview($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            permissions { canReadParticipants canWriteParticipants canReadDietary canWriteBudget }\n            participantCounts {\n                total\n                byResponse { response count }\n                byPosition { position { ...PositionFields } yes maybe pending }\n                notInvited\n                waitingForAccess\n                feesPaid\n                feesUnpaid\n                helpers\n            }\n            participationSettings { ...ParticipationSettingsFields }\n            referrals { id name contact comment referredBy createdAt }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Participants($revivalId: ID!, $includeRemoved: Boolean!) {\n        participants(revivalId: $revivalId, includeRemoved: $includeRemoved) { ...ParticipantFields }\n    }\n"): (typeof documents)["\n    query Participants($revivalId: ID!, $includeRemoved: Boolean!) {\n        participants(revivalId: $revivalId, includeRemoved: $includeRemoved) { ...ParticipantFields }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Positions {\n        positions { ...PositionFields }\n        vocalParts { id name }\n    }\n"): (typeof documents)["\n    query Positions {\n        positions { ...PositionFields }\n        vocalParts { id name }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query ParticipantCandidates($revivalId: ID!) {\n        participantCandidates(revivalId: $revivalId) { ...SpexareCandidateFields }\n    }\n"): (typeof documents)["\n    query ParticipantCandidates($revivalId: ID!) {\n        participantCandidates(revivalId: $revivalId) { ...SpexareCandidateFields }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query SpexareSearch($revivalId: ID!, $query: String!) {\n        spexareSearch(revivalId: $revivalId, query: $query) { ...SpexareCandidateFields }\n    }\n"): (typeof documents)["\n    query SpexareSearch($revivalId: ID!, $query: String!) {\n        spexareSearch(revivalId: $revivalId, query: $query) { ...SpexareCandidateFields }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query MyParticipation($revivalId: ID!) {\n        myParticipation(revivalId: $revivalId) {\n            participant {\n                id\n                kind\n                firstName\n                lastName\n                nickName\n                pending\n                response\n                respondedAt\n                comment\n                termsAcceptedAt\n                registerConsent\n                preferredPosition { ...PositionFields }\n                fee\n                feePaid\n                feePaidAt\n                version\n            }\n            revival {\n                id\n                title\n                premiereDate\n                shows { date time venue }\n                calendarFeed { createdAt }\n                permissions { canSubscribeCalendar }\n            }\n            terms\n            checklistItems { id text { sv en } checklistName chapterTitle { sv en } checklistDate deadline overdue done comment version }\n            contact { email phone streetAddress postalCode city }\n            dietary\n            swish { number amount message qrAvailable }\n            whatsappLink\n            steeringGroup { id displayName }\n            events { id title startDate endDate startTime endTime location }\n            availability { ...AvailabilityDayFields }\n            shifts { ...ShiftSlotFields }\n            openShifts { ...ShiftSlotFields }\n            materials { ...MaterialFields }\n        }\n    }\n"): (typeof documents)["\n    query MyParticipation($revivalId: ID!) {\n        myParticipation(revivalId: $revivalId) {\n            participant {\n                id\n                kind\n                firstName\n                lastName\n                nickName\n                pending\n                response\n                respondedAt\n                comment\n                termsAcceptedAt\n                registerConsent\n                preferredPosition { ...PositionFields }\n                fee\n                feePaid\n                feePaidAt\n                version\n            }\n            revival {\n                id\n                title\n                premiereDate\n                shows { date time venue }\n                calendarFeed { createdAt }\n                permissions { canSubscribeCalendar }\n            }\n            terms\n            checklistItems { id text { sv en } checklistName chapterTitle { sv en } checklistDate deadline overdue done comment version }\n            contact { email phone streetAddress postalCode city }\n            dietary\n            swish { number amount message qrAvailable }\n            whatsappLink\n            steeringGroup { id displayName }\n            events { id title startDate endDate startTime endTime location }\n            availability { ...AvailabilityDayFields }\n            shifts { ...ShiftSlotFields }\n            openShifts { ...ShiftSlotFields }\n            materials { ...MaterialFields }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ParticipantAdd($input: ParticipantAddInput!) {\n        participantAdd(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation ParticipantAdd($input: ParticipantAddInput!) {\n        participantAdd(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ParticipantsAddSpexare($revivalId: ID!, $spexareIds: [ID!]!) {\n        participantsAddSpexare(revivalId: $revivalId, spexareIds: $spexareIds) { id }\n    }\n"): (typeof documents)["\n    mutation ParticipantsAddSpexare($revivalId: ID!, $spexareIds: [ID!]!) {\n        participantsAddSpexare(revivalId: $revivalId, spexareIds: $spexareIds) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ParticipantUpdate($input: ParticipantUpdateInput!) {\n        participantUpdate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation ParticipantUpdate($input: ParticipantUpdateInput!) {\n        participantUpdate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ParticipantRemove($id: ID!, $version: Int!) {\n        participantRemove(id: $id, version: $version)\n    }\n"): (typeof documents)["\n    mutation ParticipantRemove($id: ID!, $version: Int!) {\n        participantRemove(id: $id, version: $version)\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ParticipantsInvite($input: ParticipantsInviteInput!) {\n        participantsInvite(input: $input) {\n            invited { id }\n            skipped { reason participant { id firstName lastName nickName removed } }\n        }\n    }\n"): (typeof documents)["\n    mutation ParticipantsInvite($input: ParticipantsInviteInput!) {\n        participantsInvite(input: $input) {\n            invited { id }\n            skipped { reason participant { id firstName lastName nickName removed } }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ParticipantFeeSetPaid($id: ID!, $version: Int!, $paid: Boolean!) {\n        participantFeeSetPaid(id: $id, version: $version, paid: $paid) { id }\n    }\n"): (typeof documents)["\n    mutation ParticipantFeeSetPaid($id: ID!, $version: Int!, $paid: Boolean!) {\n        participantFeeSetPaid(id: $id, version: $version, paid: $paid) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ParticipationSettingsUpdate($input: ParticipationSettingsInput!) {\n        participationSettingsUpdate(input: $input) { version }\n    }\n"): (typeof documents)["\n    mutation ParticipationSettingsUpdate($input: ParticipationSettingsInput!) {\n        participationSettingsUpdate(input: $input) { version }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ReferralHandle($id: ID!, $outcome: ReferralOutcome!) {\n        referralHandle(id: $id, outcome: $outcome) { id }\n    }\n"): (typeof documents)["\n    mutation ReferralHandle($id: ID!, $outcome: ReferralOutcome!) {\n        referralHandle(id: $id, outcome: $outcome) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ParticipationRespond($input: ParticipationRespondInput!) {\n        participationRespond(input: $input) { participant { id response } }\n    }\n"): (typeof documents)["\n    mutation ParticipationRespond($input: ParticipationRespondInput!) {\n        participationRespond(input: $input) { participant { id response } }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ParticipationContactUpdate($input: ContactInput!) {\n        participationContactUpdate(input: $input) { participant { id } }\n    }\n"): (typeof documents)["\n    mutation ParticipationContactUpdate($input: ContactInput!) {\n        participationContactUpdate(input: $input) { participant { id } }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ParticipationDietarySet($revivalId: ID!, $text: String) {\n        participationDietarySet(revivalId: $revivalId, text: $text) { participant { id } }\n    }\n"): (typeof documents)["\n    mutation ParticipationDietarySet($revivalId: ID!, $text: String) {\n        participationDietarySet(revivalId: $revivalId, text: $text) { participant { id } }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ReferralCreate($input: ReferralInput!) {\n        referralCreate(input: $input)\n    }\n"): (typeof documents)["\n    mutation ReferralCreate($input: ReferralInput!) {\n        referralCreate(input: $input)\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation AssignedChecklistItemSetDone($id: ID!, $version: Int!, $done: Boolean!) {\n        assignedChecklistItemSetDone(id: $id, version: $version, done: $done) { id }\n    }\n"): (typeof documents)["\n    mutation AssignedChecklistItemSetDone($id: ID!, $version: Int!, $done: Boolean!) {\n        assignedChecklistItemSetDone(id: $id, version: $version, done: $done) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment RevivalSummary on Revival {\n        id\n        year\n        title\n        premiereDate\n        status\n        version\n        anonymizedAt\n        spex { id title year available }\n        members { id role state displayName email invitedAt }\n        permissions { canEditCore canEditDetails allowedStatuses canManageDirecteurs canManageSteeringGroup canDelete canReadBudget canWriteBudget }\n    }\n"): (typeof documents)["\n    fragment RevivalSummary on Revival {\n        id\n        year\n        title\n        premiereDate\n        status\n        version\n        anonymizedAt\n        spex { id title year available }\n        members { id role state displayName email invitedAt }\n        permissions { canEditCore canEditDetails allowedStatuses canManageDirecteurs canManageSteeringGroup canDelete canReadBudget canWriteBudget }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment RevivalDetail on Revival {\n        ...RevivalSummary\n        shows { date time venue }\n        createdBy\n        createdAt\n        lastModifiedBy\n        lastModifiedAt\n        members { id role capabilities { ...CapabilityFields } state displayName email version }\n        statusHistory { from to changedBy changedAt }\n        guideVersion { id label }\n    }\n"): (typeof documents)["\n    fragment RevivalDetail on Revival {\n        ...RevivalSummary\n        shows { date time venue }\n        createdBy\n        createdAt\n        lastModifiedBy\n        lastModifiedAt\n        members { id role capabilities { ...CapabilityFields } state displayName email version }\n        statusHistory { from to changedBy changedAt }\n        guideVersion { id label }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query UpcomingRevivals {\n        upcomingRevivals { id title year premiereDate shows { date time venue } }\n    }\n"): (typeof documents)["\n    query UpcomingRevivals {\n        upcomingRevivals { id title year premiereDate shows { date time venue } }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Me {\n        me {\n            id\n            displayName\n            email\n            globalRoles\n            revivalRoles { role capabilities { id } revival { id title } }\n        }\n    }\n"): (typeof documents)["\n    query Me {\n        me {\n            id\n            displayName\n            email\n            globalRoles\n            revivalRoles { role capabilities { id } revival { id title } }\n        }\n    }\n"];
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
export function graphql(source: "\n    query RevivalShell($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            myRole\n            anonymizedAt\n            permissions { isParticipant canReadWork canReadParticipants canReadBudget canReadStaffing canReadMailings canReadMaterials }\n        }\n    }\n"): (typeof documents)["\n    query RevivalShell($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            myRole\n            anonymizedAt\n            permissions { isParticipant canReadWork canReadParticipants canReadBudget canReadStaffing canReadMailings canReadMaterials }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query RevivalWorkSummary($id: ID!) {\n        revival(id: $id) {\n            id\n            workSummary {\n                openEntries\n                overdueEntries\n                overdueChecklistItems\n                openRequiredItems\n                meetingInProgress { id title date }\n                upcomingEvents { id title startDate endDate startTime endTime }\n            }\n        }\n    }\n"): (typeof documents)["\n    query RevivalWorkSummary($id: ID!) {\n        revival(id: $id) {\n            id\n            workSummary {\n                openEntries\n                overdueEntries\n                overdueChecklistItems\n                openRequiredItems\n                meetingInProgress { id title date }\n                upcomingEvents { id title startDate endDate startTime endTime }\n            }\n        }\n    }\n"];
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
export function graphql(source: "\n    query ApplicationSettings {\n        applicationSettings { terms { sv en } defaultParticipationFee version }\n    }\n"): (typeof documents)["\n    query ApplicationSettings {\n        applicationSettings { terms { sv en } defaultParticipationFee version }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ApplicationSettingsUpdate($version: Int!, $input: ApplicationSettingsInput!) {\n        applicationSettingsUpdate(version: $version, input: $input) { version }\n    }\n"): (typeof documents)["\n    mutation ApplicationSettingsUpdate($version: Int!, $input: ApplicationSettingsInput!) {\n        applicationSettingsUpdate(version: $version, input: $input) { version }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query SpexCalendarDates {\n        spexCalendarDates { id date label version }\n    }\n"): (typeof documents)["\n    query SpexCalendarDates {\n        spexCalendarDates { id date label version }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query RevivalTimeline {\n        revivals { id title status premiereDate shows { date time venue } }\n        spexCalendarDates { id date label version }\n    }\n"): (typeof documents)["\n    query RevivalTimeline {\n        revivals { id title status premiereDate shows { date time venue } }\n        spexCalendarDates { id date label version }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation SpexCalendarDateCreate($input: SpexCalendarDateInput!) {\n        spexCalendarDateCreate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation SpexCalendarDateCreate($input: SpexCalendarDateInput!) {\n        spexCalendarDateCreate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation SpexCalendarDateUpdate($id: ID!, $version: Int!, $input: SpexCalendarDateInput!) {\n        spexCalendarDateUpdate(id: $id, version: $version, input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation SpexCalendarDateUpdate($id: ID!, $version: Int!, $input: SpexCalendarDateInput!) {\n        spexCalendarDateUpdate(id: $id, version: $version, input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation SpexCalendarDateDelete($id: ID!, $version: Int!) {\n        spexCalendarDateDelete(id: $id, version: $version)\n    }\n"): (typeof documents)["\n    mutation SpexCalendarDateDelete($id: ID!, $version: Int!) {\n        spexCalendarDateDelete(id: $id, version: $version)\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query SpexSearch($query: String!, $first: Int) {\n        spexSearch(query: $query, first: $first) { id title year available }\n    }\n"): (typeof documents)["\n    query SpexSearch($query: String!, $first: Int) {\n        spexSearch(query: $query, first: $first) { id title year available }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment ParticipantRefFields on ParticipantRef {\n        id\n        displayName\n        kind\n        position { id name }\n    }\n"): (typeof documents)["\n    fragment ParticipantRefFields on ParticipantRef {\n        id\n        displayName\n        kind\n        position { id name }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment ShiftSlotFields on ShiftSlot {\n        id\n        event { id title startDate endDate location }\n        date\n        startTime\n        endTime\n        task\n        needed\n        comment\n        assigned { participant { ...ParticipantRefFields } selfSignedUp }\n        open\n        version\n    }\n"): (typeof documents)["\n    fragment ShiftSlotFields on ShiftSlot {\n        id\n        event { id title startDate endDate location }\n        date\n        startTime\n        endTime\n        task\n        needed\n        comment\n        assigned { participant { ...ParticipantRefFields } selfSignedUp }\n        open\n        version\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    fragment AvailabilityDayFields on AvailabilityDay {\n        eventId\n        date\n        answer\n        comment\n    }\n"): (typeof documents)["\n    fragment AvailabilityDayFields on AvailabilityDay {\n        eventId\n        date\n        answer\n        comment\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query Staffing($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            permissions { canReadStaffing canWriteStaffing }\n        }\n        events(revivalId: $id, includeCancelled: false) { id title startDate endDate startTime endTime location }\n        shiftSlots(revivalId: $id) { ...ShiftSlotFields }\n        availability(revivalId: $id) {\n            participant { ...ParticipantRefFields }\n            days { ...AvailabilityDayFields }\n        }\n    }\n"): (typeof documents)["\n    query Staffing($id: ID!) {\n        revival(id: $id) {\n            id\n            title\n            status\n            permissions { canReadStaffing canWriteStaffing }\n        }\n        events(revivalId: $id, includeCancelled: false) { id title startDate endDate startTime endTime location }\n        shiftSlots(revivalId: $id) { ...ShiftSlotFields }\n        availability(revivalId: $id) {\n            participant { ...ParticipantRefFields }\n            days { ...AvailabilityDayFields }\n        }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    query StaffingCandidates($revivalId: ID!) {\n        participants(revivalId: $revivalId) { id kind firstName lastName nickName response position { id name } removed }\n    }\n"): (typeof documents)["\n    query StaffingCandidates($revivalId: ID!) {\n        participants(revivalId: $revivalId) { id kind firstName lastName nickName response position { id name } removed }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ShiftSlotCreate($input: ShiftSlotInput!) {\n        shiftSlotCreate(input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation ShiftSlotCreate($input: ShiftSlotInput!) {\n        shiftSlotCreate(input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ShiftSlotUpdate($id: ID!, $version: Int!, $input: ShiftSlotInput!) {\n        shiftSlotUpdate(id: $id, version: $version, input: $input) { id }\n    }\n"): (typeof documents)["\n    mutation ShiftSlotUpdate($id: ID!, $version: Int!, $input: ShiftSlotInput!) {\n        shiftSlotUpdate(id: $id, version: $version, input: $input) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ShiftSlotRemove($id: ID!, $version: Int!) {\n        shiftSlotRemove(id: $id, version: $version)\n    }\n"): (typeof documents)["\n    mutation ShiftSlotRemove($id: ID!, $version: Int!) {\n        shiftSlotRemove(id: $id, version: $version)\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ShiftAssign($slotId: ID!, $participantId: ID!) {\n        shiftAssign(slotId: $slotId, participantId: $participantId) { id }\n    }\n"): (typeof documents)["\n    mutation ShiftAssign($slotId: ID!, $participantId: ID!) {\n        shiftAssign(slotId: $slotId, participantId: $participantId) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ShiftUnassign($slotId: ID!, $participantId: ID!) {\n        shiftUnassign(slotId: $slotId, participantId: $participantId) { id }\n    }\n"): (typeof documents)["\n    mutation ShiftUnassign($slotId: ID!, $participantId: ID!) {\n        shiftUnassign(slotId: $slotId, participantId: $participantId) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ShiftSignUp($slotId: ID!) {\n        shiftSignUp(slotId: $slotId) { id }\n    }\n"): (typeof documents)["\n    mutation ShiftSignUp($slotId: ID!) {\n        shiftSignUp(slotId: $slotId) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation ShiftWithdraw($slotId: ID!) {\n        shiftWithdraw(slotId: $slotId) { id }\n    }\n"): (typeof documents)["\n    mutation ShiftWithdraw($slotId: ID!) {\n        shiftWithdraw(slotId: $slotId) { id }\n    }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n    mutation AvailabilitySet($input: AvailabilityInput!) {\n        availabilitySet(input: $input) { participant { id } }\n    }\n"): (typeof documents)["\n    mutation AvailabilitySet($input: AvailabilityInput!) {\n        availabilitySet(input: $input) { participant { id } }\n    }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;