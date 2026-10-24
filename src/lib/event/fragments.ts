import {graphql} from "@/gql";

export const EventTypeFields = graphql(`
    fragment EventTypeFields on EventType {
        id
        name { sv en }
        description { sv en }
        rooms { sv en }
        catering { sv en }
        offsetMinDays
        offsetMaxDays
        days
        revivalPays
        checklistTemplate { id name { sv en } retired }
        position
        retired
        version
    }
`);

export const EventFields = graphql(`
    fragment EventFields on Event {
        id
        revivalId
        type { id name { sv en } days revivalPays retired }
        title
        startDate
        endDate
        startTime
        endTime
        location
        description
        revivalPays
        daysFromPremiere
        checklist { id openCount totalCount cancelled }
        cancelled
        version
    }
`);
