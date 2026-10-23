import {graphql} from "@/gql";

export const OwnerFields = graphql(`
    fragment OwnerFields on Owner {
        name
        person { id displayName active }
    }
`);

export const LogEntryFields = graphql(`
    fragment LogEntryFields on LogEntry {
        id
        number
        date
        type
        text
        status
        owner { ...OwnerFields }
        deadline
        overdue
        comment
        tags
        meeting { id date title status }
        guideItemKey
        guideItem { id key type { ...GuideItemTypeFields } text { sv en } version }
        checklistItem { id checklistId state text { sv en } }
        answers { id number type status }
        answeredBy { id number type status }
        origin
        createdBy
        createdAt
        version
    }
`);
