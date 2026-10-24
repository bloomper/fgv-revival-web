import {graphql} from "@/gql";

export const ParticipantRefFields = graphql(`
    fragment ParticipantRefFields on ParticipantRef {
        id
        displayName
        kind
        position { id name }
    }
`);

/** A shift slot with its event, so lists outside the event (my shifts, open shifts) can say where and when. */
export const ShiftSlotFields = graphql(`
    fragment ShiftSlotFields on ShiftSlot {
        id
        event { id title startDate endDate location }
        date
        startTime
        endTime
        task
        needed
        comment
        assigned { participant { ...ParticipantRefFields } selfSignedUp }
        open
        version
    }
`);

export const AvailabilityDayFields = graphql(`
    fragment AvailabilityDayFields on AvailabilityDay {
        eventId
        date
        answer
        comment
    }
`);
