"use server";

import {revalidatePath} from "next/cache";
import type {z} from "zod";
import type {EventUpdateInput} from "@/gql/graphql";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {
    cancelEvent,
    createCalendarFeed,
    createEvent,
    restoreEvent,
    revokeCalendarFeed,
    updateEvent
} from "@/lib/event/event.server";
import {calendarFeedSchema, eventCreateSchema, eventTransitionSchema, eventUpdateSchema} from "@/lib/event/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

// The overview's upcoming events, the tab and the event's checklist all change, so the whole revival is revalidated.
function revalidate(revivalId: string) {
    revalidatePath(`/revivals/${revivalId}`, "layout");
}

export async function createEventAction(input: z.input<typeof eventCreateSchema>): Promise<ActionResult<{
    id: string
}>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, values} = eventCreateSchema.parse(input);
        const created = await createEvent({
            revivalId,
            typeId: values.typeId || null,
            title: values.title || null,
            startDate: values.startDate,
            endDate: values.endDate || null,
            startTime: values.startTime || null,
            endTime: values.endTime || null,
            location: values.location || null,
            description: values.description || null,
            revivalPays: values.revivalPays,
        });

        revalidate(revivalId);
        return {id: created?.id ?? ""};
    }));
}

/**
 * Sends every field, clearing the optional ones left blank; the type cannot change. A blank title keeps the old one.
 */
export async function updateEventAction(input: z.input<typeof eventUpdateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {id, version, revivalId, values} = eventUpdateSchema.parse(input);
        const update: EventUpdateInput = {
            id, version,
            startDate: values.startDate,
            endDate: values.endDate || values.startDate,
            revivalPays: values.revivalPays,
            ...(values.title ? {title: values.title} : {}),
            ...(values.startTime ? {startTime: values.startTime} : {clearStartTime: true}),
            ...(values.endTime ? {endTime: values.endTime} : {clearEndTime: true}),
            ...(values.location ? {location: values.location} : {clearLocation: true}),
            ...(values.description ? {description: values.description} : {clearDescription: true}),
        };

        await updateEvent(update);
        revalidate(revivalId);
        return null;
    }));
}

async function transition(input: z.input<typeof eventTransitionSchema>, run: (id: string, version: number) => Promise<void>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {id, version, revivalId} = eventTransitionSchema.parse(input);

        await run(id, version);
        revalidate(revivalId);
        return null;
    }));
}

export async function cancelEventAction(input: z.input<typeof eventTransitionSchema>) {
    return transition(input, cancelEvent);
}

export async function restoreEventAction(input: z.input<typeof eventTransitionSchema>) {
    return transition(input, restoreEvent);
}

/**
 * A new calendar link for the caller. The URL holds the secret and is shown once, so it is only returned, never stored.
 */
export async function createCalendarFeedAction(input: z.input<typeof calendarFeedSchema>): Promise<ActionResult<{
    url: string;
    createdAt: string
}>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId} = calendarFeedSchema.parse(input);
        const created = await createCalendarFeed(revivalId);

        revalidatePath(`/revivals/${revivalId}/events`);
        return {url: created?.url ?? "", createdAt: created?.createdAt ?? ""};
    }));
}

export async function revokeCalendarFeedAction(input: z.input<typeof calendarFeedSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId} = calendarFeedSchema.parse(input);

        await revokeCalendarFeed(revivalId);
        revalidatePath(`/revivals/${revivalId}/events`);
        return null;
    }));
}
