import {graphql} from "@/gql";

export const PositionFields = graphql(`
    fragment PositionFields on Position {
        id
        name
        category
        hasRole
    }
`);

/**
 * A participant as the steering group's list shows it. Contact details and dietary needs come back null for those who
 * may not read them (participant.graphqls).
 */
export const ParticipantFields = graphql(`
    fragment ParticipantFields on Participant {
        id
        revivalId
        kind
        spexareId
        firstName
        lastName
        nickName
        email
        phone
        pending
        position { ...PositionFields }
        roleName
        vocalPart { id name }
        preferredPosition { ...PositionFields }
        response
        respondedAt
        comment
        termsAcceptedAt
        registerConsent
        invitation
        invitedAt
        dietary
        dietaryReadable
        fee
        feeOverride
        feePaid
        feePaidAt
        compensationPerShift
        removed
        version
    }
`);

export const SpexareCandidateFields = graphql(`
    fragment SpexareCandidateFields on SpexareCandidate {
        spexareId
        firstName
        lastName
        nickName
        graduation
        history
        added
    }
`);

export const ParticipationSettingsFields = graphql(`
    fragment ParticipationSettingsFields on ParticipationSettings {
        swishNumber
        whatsappLink
        terms
        version
    }
`);
