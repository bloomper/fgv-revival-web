"use client";

import {useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {Ban, RotateCw, Send} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {Button} from "@/components/ui/button";
import {AudiencePreview, useAudiencePreview} from "@/components/mailing/mailing-editor.client";
import {
    cancelMailingAction,
    retryMailingAction,
    sendMailingAction
} from "@/app/(app)/revivals/[id]/mailings/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import type {AudienceValues} from "@/lib/mailing/schema";
import {track} from "@/utils/umami";

/**
 * The confirmation before a draft goes out (M6B-FR-9): how many it reaches now and who has no address, from the same
 * preview the editor shows. Nothing is sent without this confirmation.
 */
function SendDialog({revivalId, mailing, audience, onOpenChange}: {
    revivalId: string;
    mailing: { id: string; version: number; subject: string };
    audience: AudienceValues;
    onOpenChange: (open: boolean) => void;
}) {
    const t = useTranslations("Mailings");
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const preview = useAudiencePreview(revivalId, audience);
    const count = preview?.recipients?.filter(recipient => recipient.hasAddress).length ?? 0;

    return (
        <AlertDialog open onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("sendTitle", {subject: mailing.subject})}</AlertDialogTitle>
                    <AlertDialogDescription>{t("sendDescription")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AudiencePreview preview={preview}/>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t("cancelSend")}</AlertDialogCancel>
                    <AlertDialogAction disabled={pending || !preview?.recipients || count === 0}
                                       onClick={() => startTransition(async () => {
                                           const result = await sendMailingAction({
                                               revivalId,
                                               id: mailing.id,
                                               version: mailing.version
                                           });

                                           if (feedback(result, result.ok ? t("sentToast", {count: result.data.sent}) : undefined)) {
                                               track("mailing-send", {
                                                   audience: audience.kind,
                                                   count: result.data.sent
                                               });
                                               onOpenChange(false);
                                           }
                                       })}>
                        <Send/>{t("sendTo", {count})}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

/** Sending, cancelling and retrying a mailing, each as the mailing's permissions allow. */
export function MailingActions({revivalId, mailing, audience, canSend, canDraft, canRetry}: {
    revivalId: string;
    mailing: { id: string; version: number; subject: string; status: string };
    audience: AudienceValues;
    /** `Mailing.canSend`: the directeur or COMMS, and a draft. */
    canSend: boolean;
    canDraft: boolean;
    /** The directeur or COMMS, a sent mailing with failed recipients. */
    canRetry: boolean;
}) {
    const t = useTranslations("Mailings");
    const feedback = useActionFeedback();
    const [sending, setSending] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [pending, startTransition] = useTransition();
    const draft = mailing.status === "DRAFT";

    return (
        <div className="flex flex-wrap items-center gap-2">
            {draft && canSend && <Button onClick={() => setSending(true)}><Send/>{t("send")}</Button>}
            {draft && !canSend && canDraft && <p className="text-sm text-muted-foreground">{t("cannotSend")}</p>}
            {draft && canDraft &&
                <Button variant="outline" onClick={() => setCancelling(true)}><Ban/>{t("cancelDraft")}</Button>}
            {canRetry && (
                <Button variant="outline" disabled={pending} onClick={() => startTransition(async () => {
                    const result = await retryMailingAction({revivalId, id: mailing.id});

                    feedback(result, result.ok ? t("retried", {
                        sent: result.data.sent,
                        failed: result.data.failed
                    }) : undefined);
                })}>
                    <RotateCw/>{t("retry")}
                </Button>
            )}
            {sending &&
                <SendDialog revivalId={revivalId} mailing={mailing} audience={audience} onOpenChange={setSending}/>}
            {cancelling && (
                <AlertDialog open onOpenChange={setCancelling}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t("cancelDraftTitle")}</AlertDialogTitle>
                            <AlertDialogDescription>{t("cancelDraftDescription")}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t("keepDraft")}</AlertDialogCancel>
                            <AlertDialogAction variant="destructive" disabled={pending}
                                               onClick={() => startTransition(async () => {
                                                   if (feedback(await cancelMailingAction({
                                                       revivalId,
                                                       id: mailing.id,
                                                       version: mailing.version
                                                   }), t("draftCancelled"))) {
                                                       setCancelling(false);
                                                   }
                                               })}>{t("cancelDraft")}</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    );
}
