import {graphql} from "@/gql";

export const ChecklistItemFields = graphql(`
    fragment ChecklistItemFields on ChecklistItem {
        id
        required
        text { sv en }
        state
        stateChangedBy { displayName }
        stateChangedAt
        reason
        owner { ...OwnerFields }
        deadline
        deadlineManual
        overdue
        comment
        guideItem { id key type text { sv en } version }
        defaultCapability
        logEntries { id number type status }
        checklist { id kind chapterKey chapterTitle { sv en } name }
        version
    }
`);
