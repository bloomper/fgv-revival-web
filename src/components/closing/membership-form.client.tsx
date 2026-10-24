"use client";

import {useId, useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {setMembershipAction} from "@/app/(app)/revivals/[id]/closing/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {membershipYearSchema} from "@/lib/closing/schema";
import {track} from "@/utils/umami";

export type MembershipParticipant = { id: string; name: string; membershipPaid: boolean };

/**
 * The year the revival pays FGV membership for and for whom (M7-FR-1): a checklist of the participants who answered
 * yes. Saving replaces the marks, so everyone left unticked is unmarked. Read-only without `canWrite`.
 */
export function MembershipForm({revivalId, year, participants, canWrite}: {
    revivalId: string;
    year: number;
    participants: MembershipParticipant[];
    canWrite: boolean;
}) {
    const t = useTranslations();
    const id = useId();
    const feedback = useActionFeedback();
    const [yearText, setYearText] = useState(String(year));
    const [yearError, setYearError] = useState(false);
    const [selected, setSelected] = useState(() => new Set(participants.filter(participant => participant.membershipPaid).map(participant => participant.id)));
    const [pending, startTransition] = useTransition();
    const allSelected = participants.length > 0 && selected.size === participants.length;

    const toggle = (participantId: string, checked: boolean) => setSelected(current => {
        const next = new Set(current);

        if (checked) {
            next.add(participantId);
        } else {
            next.delete(participantId);
        }
        return next;
    });

    const save = () => {
        const parsed = membershipYearSchema.safeParse(yearText);

        setYearError(!parsed.success);
        if (!parsed.success) {
            return;
        }
        startTransition(async () => {
            const participantIds = participants.filter(participant => selected.has(participant.id)).map(participant => participant.id);
            const result = await setMembershipAction({revivalId, year: parsed.data, participantIds});

            if (feedback(result, t("Closing.membershipSaved"))) {
                track("membership-set", {count: participantIds.length});
            }
        });
    };

    if (participants.length === 0) {
        return <p className="text-sm text-muted-foreground">{t("Closing.membershipNone")}</p>;
    }

    return (
        <form className="space-y-4" onSubmit={(event) => {
            event.preventDefault();
            save();
        }}>
            <div className="max-w-40 space-y-2">
                <Label htmlFor={`${id}-year`}>{t("Closing.membershipYear")}</Label>
                <Input id={`${id}-year`} inputMode="numeric" maxLength={4} value={yearText} disabled={!canWrite}
                       aria-invalid={yearError || undefined} aria-describedby={yearError ? `${id}-year-error` : undefined}
                       onChange={event => setYearText(event.target.value)}/>
                {yearError && <p id={`${id}-year-error`} className="text-sm text-destructive">{t("Validation.membershipYearInvalid")}</p>}
            </div>
            <fieldset className="space-y-2">
                <legend className="mb-2 text-sm font-medium">{t("Closing.membershipFor")}</legend>
                {canWrite && (
                    <label className="flex items-center gap-2 border-b pb-2 text-sm font-medium">
                        <Checkbox checked={allSelected}
                                  onCheckedChange={value => setSelected(value ? new Set(participants.map(participant => participant.id)) : new Set())}/>
                        {t("Closing.membershipAll")}
                    </label>
                )}
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {participants.map(participant => (
                        <li key={participant.id}>
                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox checked={selected.has(participant.id)} disabled={!canWrite}
                                          onCheckedChange={value => toggle(participant.id, !!value)}/>
                                {participant.name}
                            </label>
                        </li>
                    ))}
                </ul>
            </fieldset>
            <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground" aria-live="polite">{t("Closing.membershipCount", {count: selected.size, total: participants.length})}</p>
                {canWrite && <Button type="submit" disabled={pending} className="ml-auto">{t("Common.save")}</Button>}
            </div>
        </form>
    );
}
