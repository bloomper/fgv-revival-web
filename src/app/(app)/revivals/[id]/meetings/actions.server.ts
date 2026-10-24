"use server";

import {revalidatePath} from "next/cache";
import type {z} from "zod";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {
    cancelMeeting,
    closeMeeting,
    createMeeting,
    retryMinutes,
    sendMinutes,
    startMeeting,
    updateMeeting
} from "@/lib/meeting/meeting.server";
import {
    meetingCreateSchema,
    meetingTransitionSchema,
    meetingUpdateSchema,
    minutesEmailSchema,
    minutesRetrySchema
} from "@/lib/meeting/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

function revalidate(revivalId: string) {
    revalidatePath(`/revivals/${revivalId}`, "layout");
}

export type MinutesEmailResult = { id: string; waitingLeftOut: number; failed: string[]; sent: number };

export async function createMeetingAction(input: z.input<typeof meetingCreateSchema>): Promise<ActionResult<{
    id: string
}>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, values} = meetingCreateSchema.parse(input);
        const created = await createMeeting({
            revivalId, date: values.date, title: values.title || null, attendeeIds: values.attendeeIds,
            othersPresent: values.othersPresent || null, agendaPoints: values.agendaPoints,
        });

        revalidate(revivalId);
        return {id: created?.id ?? ""};
    }));
}

export async function updateMeetingAction(input: z.input<typeof meetingUpdateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {id, version, revivalId, values} = meetingUpdateSchema.parse(input);

        await updateMeeting({
            id, version, date: values.date, title: values.title ?? "", attendeeIds: values.attendeeIds,
            othersPresent: values.othersPresent ?? "", agendaPoints: values.agendaPoints,
        });
        revalidate(revivalId);
        return null;
    }));
}

async function transition(input: z.input<typeof meetingTransitionSchema>, run: (id: string, version: number) => Promise<void>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {id, version, revivalId} = meetingTransitionSchema.parse(input);

        await run(id, version);
        revalidate(revivalId);
        return null;
    }));
}

export async function startMeetingAction(input: z.input<typeof meetingTransitionSchema>) {
    return transition(input, startMeeting);
}

export async function closeMeetingAction(input: z.input<typeof meetingTransitionSchema>) {
    return transition(input, closeMeeting);
}

export async function cancelMeetingAction(input: z.input<typeof meetingTransitionSchema>) {
    return transition(input, cancelMeeting);
}

function result(email: {
    id: string;
    waitingLeftOut: number;
    recipients: { person: { displayName?: string | null }; status: string }[]
} | undefined): MinutesEmailResult {
    return {
        id: email?.id ?? "",
        waitingLeftOut: email?.waitingLeftOut ?? 0,
        sent: email?.recipients.filter(recipient => recipient.status === "SENT").length ?? 0,
        failed: email?.recipients.filter(recipient => recipient.status === "FAILED").map(recipient => recipient.person.displayName ?? "—") ?? [],
    };
}

export async function sendMinutesAction(input: z.input<typeof minutesEmailSchema>): Promise<ActionResult<MinutesEmailResult>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {meetingId, revivalId, language} = minutesEmailSchema.parse(input);
        const sent = await sendMinutes({meetingId, language});

        revalidatePath(`/revivals/${revivalId}/meetings/${meetingId}`);
        return result(sent);
    }));
}

export async function retryMinutesAction(input: z.input<typeof minutesRetrySchema>): Promise<ActionResult<MinutesEmailResult>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {emailId, revivalId, meetingId} = minutesRetrySchema.parse(input);
        const sent = await retryMinutes(emailId);

        revalidatePath(`/revivals/${revivalId}/meetings/${meetingId}`);
        return result(sent);
    }));
}
