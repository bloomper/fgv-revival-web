import {graphql} from "@/gql";

export const MailingTemplateFields = graphql(`
    fragment MailingTemplateFields on MailingTemplate {
        id
        name { sv en }
        subject { sv en }
        body { sv en }
        audience
        eventType { id name { sv en } retired }
        due { kind amount weekday }
        position
        retired
        version
    }
`);

/** A mailing with its recipients by name; addresses are never part of it (mailing.graphqls). */
export const MailingFields = graphql(`
    fragment MailingFields on Mailing {
        id
        revivalId
        audience { kind position { id name } event { id title startDate } }
        subject
        body
        status
        plannedFor { template { id name { sv en } } event { id title } dueDate }
        createdBy { id displayName }
        createdAt
        sentBy { id displayName }
        sentAt
        recipients { displayName status }
        canSend
        version
    }
`);
