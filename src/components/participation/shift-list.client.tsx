"use client";

import {useTransition} from "react";
import {useTranslations} from "next-intl";
import {Button} from "@/components/ui/button";
import {PlainText} from "@/components/plain-text";
import {signUpForShiftAction, withdrawFromShiftAction} from "@/app/(app)/revivals/[id]/me/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {useWeekday} from "@/hooks/use-weekday";
import type {ShiftSlotFieldsFragment} from "@/gql/graphql";
import {compareSlots} from "@/lib/staffing/staffing";
import {formatDate} from "@/utils/format";
import {track} from "@/utils/umami";

/** Whether the caller signed up for the slot themselves, so may withdraw. */
function selfSignedUp(slot: ShiftSlotFieldsFragment, participantId: string) {
    return slot.assigned.some(assignment => assignment.participant.id === participantId && assignment.selfSignedUp);
}

/**
 * The participant's shifts (M6B-FR-4/7), or the open ones they may take, as a list of large rows: the task, the day
 * and time, the event and its place, and one button. Shifts the steering group gave them cannot be withdrawn here.
 */
export function ShiftList({revivalId, participantId, slots, mode}: {
    revivalId: string;
    participantId: string;
    slots: ShiftSlotFieldsFragment[];
    mode: "mine" | "open";
}) {
    const t = useTranslations("Shifts");
    const weekday = useWeekday();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();

    if (slots.length === 0) {
        return <p className="text-sm text-muted-foreground">{mode === "mine" ? t("noneMine") : t("noneOpen")}</p>;
    }
    return (
        <ul className="flex flex-col gap-3">
            {[...slots].sort(compareSlots).map(slot => {
                const own = selfSignedUp(slot, participantId);
                const label = `${slot.task}, ${formatDate(slot.date)} ${slot.startTime}–${slot.endTime}`;

                return (
                    <li key={slot.id} className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 space-y-0.5">
                            <p className="font-medium">{slot.task}</p>
                            <p className="text-sm tabular-nums">
                                <span className="capitalize">{weekday(slot.date)}</span> {formatDate(slot.date)} · {slot.startTime}–{slot.endTime}
                            </p>
                            <p className="text-sm text-muted-foreground">{[slot.event.title, slot.event.location].filter(Boolean).join(" · ")}</p>
                            {slot.comment && <p className="text-sm text-muted-foreground"><PlainText text={slot.comment}/></p>}
                            {mode === "open" && <p className="text-sm text-muted-foreground">{t("openCount", {count: slot.open})}</p>}
                            {mode === "mine" && !own && <p className="text-sm text-muted-foreground">{t("assignedByGroup")}</p>}
                        </div>
                        {mode === "open" && (
                            <Button size="lg" className="h-11 w-full shrink-0 sm:w-auto" disabled={pending} aria-label={t("signUpFor", {slot: label})}
                                    onClick={() => startTransition(async () => {
                                        if (feedback(await signUpForShiftAction({revivalId, slotId: slot.id}), t("signedUp"))) {
                                            track("shift-sign-up");
                                        }
                                    })}>
                                {t("signUp")}
                            </Button>
                        )}
                        {mode === "mine" && own && (
                            <Button size="lg" variant="outline" className="h-11 w-full shrink-0 sm:w-auto" disabled={pending} aria-label={t("withdrawFrom", {slot: label})}
                                    onClick={() => startTransition(async () => {
                                        feedback(await withdrawFromShiftAction({revivalId, slotId: slot.id}), t("withdrawn"));
                                    })}>
                                {t("withdraw")}
                            </Button>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
