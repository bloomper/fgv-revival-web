"use client";

import * as React from "react";
import {useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {closeMeetingAction} from "@/app/(app)/revivals/[id]/meetings/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";

/**
 * Closes a meeting once every open or waiting to-do has an owner; lists those that don't, each opening the
 * row to give it one.
 */
export function MeetingCloseDialog({revivalId, meeting, blocking, onOpenRow}: {
    revivalId: string;
    meeting: { id: string; version: number };
    blocking: { id: string; number: number }[];
    onOpenRow: (id: string) => void;
}) {
    const t = useTranslations();
    const feedback = useActionFeedback();
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();

    return (
        <>
            <Button onClick={() => setOpen(true)}>{t("Meeting.close")}</Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("Meeting.closeTitle")}</DialogTitle>
                        <DialogDescription>{blocking.length > 0 ? t("Meeting.blocked") : t("Meeting.closeDescription")}</DialogDescription>
                    </DialogHeader>
                    {blocking.length > 0 && (
                        <ul className="list-disc pl-5 text-sm" aria-label={t("Meeting.blockingRows")}>
                            {blocking.map(entry => (
                                <li key={entry.id}>
                                    <Button variant="link" className="h-auto p-0" onClick={() => {
                                        setOpen(false);
                                        onOpenRow(entry.id);
                                    }}>{t("Meeting.blockingRow", {number: entry.number})}</Button>
                                </li>
                            ))}
                        </ul>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>{t("Common.cancel")}</Button>
                        <Button disabled={pending || blocking.length > 0} onClick={() => startTransition(async () => {
                            if (feedback(await closeMeetingAction({...meeting, revivalId}), t("Meeting.closed"))) {
                                setOpen(false);
                            }
                        })}>{t("Meeting.close")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
