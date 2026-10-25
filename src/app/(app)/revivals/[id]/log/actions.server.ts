"use server";

import {revalidatePath} from "next/cache";
import type {z} from "zod";
import type {LogEntryUpdateInput, OwnerInput} from "@/gql/graphql";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {answerLogEntry, createLogEntry, updateLogEntry} from "@/lib/decision-log/log.server";
import {
    logEntryAnswerSchema,
    logEntryCreateSchema,
    logEntryUpdateSchema,
    type ownerSchema
} from "@/lib/decision-log/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

function ownerInput(owner: z.infer<typeof ownerSchema> | undefined): OwnerInput | null {
    if (owner?.personId) {
        return {personId: owner.personId};
    }
    if (owner?.name) {
        return {name: owner.name};
    }
    return null;
}

function revalidate(revivalId: string) {
    revalidatePath(`/revivals/${revivalId}`, "layout");
}

export async function createLogEntryAction(input: z.input<typeof logEntryCreateSchema>): Promise<ActionResult<{
    number: number
}>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, meetingId, values} = logEntryCreateSchema.parse(input);
        const created = await createLogEntry({
            revivalId,
            meetingId: meetingId ?? null,
            type: values.type,
            text: values.text,
            status: values.status,
            owner: ownerInput(values.owner),
            deadline: values.deadline || null,
            date: values.date || null,
            comment: values.comment || null,
            tags: values.tags,
            eventId: values.eventId || null,
        });

        revalidate(revivalId);
        return {number: created?.number ?? 0};
    }));
}

export async function updateLogEntryAction(input: z.input<typeof logEntryUpdateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {id, version, revivalId, meetingId, values} = logEntryUpdateSchema.parse(input);
        const update: LogEntryUpdateInput = {id, version, meetingId: meetingId ?? null};

        if (values.type) {
            update.type = values.type;
        }
        if (values.text !== undefined) {
            update.text = values.text;
        }
        if (values.status) {
            update.status = values.status;
        }
        if (values.owner !== undefined) {
            const owner = ownerInput(values.owner);

            if (owner) {
                update.owner = owner;
            } else {
                update.clearOwner = true;
            }
        }
        if (values.deadline !== undefined) {
            if (values.deadline) {
                update.deadline = values.deadline;
            } else {
                update.clearDeadline = true;
            }
        }
        if (values.date) {
            update.date = values.date;
        }
        if (values.comment !== undefined) {
            if (values.comment) {
                update.comment = values.comment;
            } else {
                update.clearComment = true;
            }
        }
        if (values.tags !== undefined) {
            update.tags = values.tags;
        }
        if (values.eventId !== undefined) {
            if (values.eventId) {
                update.eventId = values.eventId;
            } else {
                update.clearEvent = true;
            }
        }
        await updateLogEntry(update);
        revalidate(revivalId);
        return null;
    }));
}

export async function answerLogEntryAction(input: z.input<typeof logEntryAnswerSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const parsed = logEntryAnswerSchema.parse(input);

        await answerLogEntry({
            questionId: parsed.questionId,
            questionVersion: parsed.questionVersion,
            meetingId: parsed.meetingId ?? null,
            text: parsed.text,
            owner: ownerInput(parsed.owner),
            deadline: parsed.deadline || null,
            comment: parsed.comment || null,
        });
        revalidate(parsed.revivalId);
        return null;
    }));
}
