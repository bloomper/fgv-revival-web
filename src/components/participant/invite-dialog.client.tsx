"use client";

import {useId, useState, useTransition} from "react";
import {useLocale, useTranslations} from "next-intl";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {NativeSelect} from "@/components/ui/native-select";
import {type InviteOutcome, inviteParticipantsAction} from "@/app/(app)/revivals/[id]/participants/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import type {ParticipantFieldsFragment} from "@/gql/graphql";
import {participantName} from "@/lib/participant/contact";
import {INVITATION_LANGUAGES} from "@/lib/participant/schema";
import {track} from "@/utils/umami";

const KNOWN_REASONS = ["NO_EMAIL", "REMOVED", "DECLINED", "ALREADY_MEMBER"];

/**
 * Invites the chosen participants, or reminds those already invited, in the language picked here. A single spexare
 * without an email address in Spexregister can be given one. Afterwards it lists who was skipped and why.
 */
export function InviteDialog({revivalId, participants, onOpenChange}: {
    revivalId: string;
    participants: Pick<ParticipantFieldsFragment, "id" | "firstName" | "lastName" | "nickName" | "email" | "pending" | "invitation">[];
    onOpenChange: (open: boolean) => void;
}) {
    const t = useTranslations();
    const locale = useLocale();
    const id = useId();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const [language, setLanguage] = useState(INVITATION_LANGUAGES.includes(locale as "sv") ? locale : "sv");
    const [email, setEmail] = useState("");
    const [outcome, setOutcome] = useState<InviteOutcome | null>(null);
    const single = participants.length === 1 ? participants[0] : null;
    const askEmail = !!single && !single.pending && !single.email;
    const reminders = participants.filter(participant => participant.invitation !== "NOT_INVITED").length;

    const submit = () => startTransition(async () => {
        const result = await inviteParticipantsAction({
            revivalId,
            participantIds: participants.map(participant => participant.id),
            email: askEmail ? email : "",
            language: language as "sv" | "en",
        });

        if (feedback(result)) {
            track("participants-invite", {count: result.data.invited});
            setOutcome(result.data);
        }
    });

    return (
        <Dialog open onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{single ? t("Participants.inviteOneTitle", {name: participantName(single)}) : t("Participants.inviteTitle")}</DialogTitle>
                    <DialogDescription>{t("Participants.inviteDescription")}</DialogDescription>
                </DialogHeader>
                {outcome ? (
                    <div className="space-y-3 text-sm" role="status">
                        <p>{t("Participants.invitedCount", {count: outcome.invited})}</p>
                        {outcome.skipped.length > 0 && (
                            <div className="space-y-1">
                                <p className="font-medium">{t("Participants.skippedTitle", {count: outcome.skipped.length})}</p>
                                <ul className="list-disc space-y-1 pl-5">
                                    {outcome.skipped.map(skip => (
                                        <li key={skip.id}>
                                            {participantName(skip) || t("Participants.removedPerson")}:{" "}
                                            {KNOWN_REASONS.includes(skip.reason) ? t(`Participants.skipReasons.${skip.reason}`) : skip.reason}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm">
                            {t("Participants.inviteCount", {count: participants.length})}
                            {reminders > 0 && <> {t("Participants.reminderCount", {count: reminders})}</>}
                        </p>
                        <div className="space-y-2">
                            <Label htmlFor={`${id}-language`}>{t("Participants.inviteLanguage")}</Label>
                            <NativeSelect id={`${id}-language`} className="w-full" value={language}
                                          onChange={change => setLanguage(change.target.value)}>
                                {INVITATION_LANGUAGES.map(code => <option key={code}
                                                                          value={code}>{t(`Participants.languages.${code}`)}</option>)}
                            </NativeSelect>
                        </div>
                        {askEmail && (
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-email`}>{t("Participants.inviteEmail")}</Label>
                                <Input id={`${id}-email`} type="email" autoComplete="off" value={email}
                                       onChange={change => setEmail(change.target.value)}
                                       aria-describedby={`${id}-email-hint`}/>
                                <p id={`${id}-email-hint`}
                                   className="text-xs text-muted-foreground">{t("Participants.inviteEmailHint")}</p>
                            </div>
                        )}
                    </div>
                )}
                <DialogFooter>
                    {outcome ? (
                        <Button type="button" onClick={() => onOpenChange(false)}>{t("Common.close")}</Button>
                    ) : (
                        <>
                            <Button type="button" variant="outline"
                                    onClick={() => onOpenChange(false)}>{t("Common.cancel")}</Button>
                            <Button type="button" disabled={pending}
                                    onClick={submit}>{t("Participants.sendInvitations")}</Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
