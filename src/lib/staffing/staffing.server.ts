import "server-only";

import {graphql} from "@/gql";
import type {AvailabilityInput, ShiftSlotInput} from "@/gql/graphql";
import {runMutation, runQuery} from "@/lib/graphql.server";

// Availability and staffing (staffing.graphqls). The slots and answers carry participants by name only
// (ParticipantRef); the full list of participants, for picking whom to assign, comes from Spexregister and is fetched
// apart so its being unavailable leaves the slots working.

const StaffingQuery = graphql(`
    query Staffing($id: ID!) {
        revival(id: $id) {
            id
            title
            status
            permissions { canReadStaffing canWriteStaffing }
        }
        events(revivalId: $id, includeCancelled: false) { id title startDate endDate startTime endTime location }
        shiftSlots(revivalId: $id) { ...ShiftSlotFields }
        availability(revivalId: $id) {
            participant { ...ParticipantRefFields }
            days { ...AvailabilityDayFields }
        }
    }
`);

const StaffingCandidatesQuery = graphql(`
    query StaffingCandidates($revivalId: ID!) {
        participants(revivalId: $revivalId) { id kind firstName lastName nickName response position { id name } removed }
    }
`);

const ShiftSlotCreateMutation = graphql(`
    mutation ShiftSlotCreate($input: ShiftSlotInput!) {
        shiftSlotCreate(input: $input) { id }
    }
`);

const ShiftSlotUpdateMutation = graphql(`
    mutation ShiftSlotUpdate($id: ID!, $version: Int!, $input: ShiftSlotInput!) {
        shiftSlotUpdate(id: $id, version: $version, input: $input) { id }
    }
`);

const ShiftSlotRemoveMutation = graphql(`
    mutation ShiftSlotRemove($id: ID!, $version: Int!) {
        shiftSlotRemove(id: $id, version: $version)
    }
`);

const ShiftAssignMutation = graphql(`
    mutation ShiftAssign($slotId: ID!, $participantId: ID!) {
        shiftAssign(slotId: $slotId, participantId: $participantId) { id }
    }
`);

const ShiftUnassignMutation = graphql(`
    mutation ShiftUnassign($slotId: ID!, $participantId: ID!) {
        shiftUnassign(slotId: $slotId, participantId: $participantId) { id }
    }
`);

const ShiftSignUpMutation = graphql(`
    mutation ShiftSignUp($slotId: ID!) {
        shiftSignUp(slotId: $slotId) { id }
    }
`);

const ShiftWithdrawMutation = graphql(`
    mutation ShiftWithdraw($slotId: ID!) {
        shiftWithdraw(slotId: $slotId) { id }
    }
`);

const AvailabilitySetMutation = graphql(`
    mutation AvailabilitySet($input: AvailabilityInput!) {
        availabilitySet(input: $input) { participant { id } }
    }
`);

/**
 * The staffing tab: the revival's events that are not cancelled, their slots and everyone's answers. Null when the
 * revival is not visible.
 */
export async function getStaffing(revivalId: string) {
    const data = await runQuery(StaffingQuery, {id: revivalId});

    return data?.revival ? {
        revival: data.revival,
        events: data.events,
        slots: data.shiftSlots,
        availability: data.availability
    } : null;
}

/** The participants and helpers who may be given a shift; names from Spexregister. */
export async function getStaffingCandidates(revivalId: string) {
    return (await runQuery(StaffingCandidatesQuery, {revivalId}))?.participants ?? [];
}

export async function createShiftSlot(input: ShiftSlotInput) {
    await runMutation(ShiftSlotCreateMutation, {input});
}

export async function updateShiftSlot(id: string, version: number, input: ShiftSlotInput) {
    await runMutation(ShiftSlotUpdateMutation, {id, version, input});
}

export async function removeShiftSlot(id: string, version: number) {
    await runMutation(ShiftSlotRemoveMutation, {id, version});
}

export async function assignShift(slotId: string, participantId: string) {
    await runMutation(ShiftAssignMutation, {slotId, participantId});
}

export async function unassignShift(slotId: string, participantId: string) {
    await runMutation(ShiftUnassignMutation, {slotId, participantId});
}

export async function signUpForShift(slotId: string) {
    await runMutation(ShiftSignUpMutation, {slotId});
}

export async function withdrawFromShift(slotId: string) {
    await runMutation(ShiftWithdrawMutation, {slotId});
}

export async function setAvailability(input: AvailabilityInput) {
    await runMutation(AvailabilitySetMutation, {input});
}
