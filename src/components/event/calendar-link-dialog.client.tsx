"use client";

import * as React from "react";
import {useId, useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {CalendarSync, Copy} from "lucide-react";
import {toast} from "sonner";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {createCalendarFeedAction, revokeCalendarFeedAction} from "@/app/(app)/revivals/[id]/events/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {formatInstant} from "@/utils/format";
import {track} from "@/utils/umami";

/**
 * The caller's secret calendar link for the revival (M4-FR-5): created, replaced or turned off here. The address is
 * shown once, right after it is created, since only its hash is kept.
 */
export function CalendarLinkDialog({revivalId, feed, triggerClassName}: {
    revivalId: string;
    feed: { createdAt: string } | null;
    /** The participant's page makes the button big enough for a finger. */
    triggerClassName?: string;
}) {
    const t = useTranslations();
    const id = useId();
    const feedback = useActionFeedback();
    const [open, setOpen] = useState(false);
    const [url, setUrl] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();

    const create = () => startTransition(async () => {
        const result = await createCalendarFeedAction({revivalId});

        if (feedback(result)) {
            track("calendar-link");
            setUrl(result.data.url);
        }
    });

    const revoke = () => startTransition(async () => {
        if (feedback(await revokeCalendarFeedAction({revivalId}), t("Calendar.revoked"))) {
            setUrl(null);
        }
    });

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url ?? "");
            toast.success(t("Calendar.copied"));
        } catch {
            toast.error(t("Calendar.copyFailed"));
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* The address is forgotten when the dialog opens again, not as it closes, so it does not flicker away */}
            <Button variant="outline" className={triggerClassName} onClick={() => {
                setUrl(null);
                setOpen(true);
            }}><CalendarSync/>{t("Calendar.button")}</Button>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("Calendar.title")}</DialogTitle>
                    <DialogDescription>{t("Calendar.description")}</DialogDescription>
                </DialogHeader>
                {url ? (
                    <div className="space-y-2">
                        <Label htmlFor={`${id}-url`}>{t("Calendar.address")}</Label>
                        <div className="flex gap-2">
                            <Input id={`${id}-url`} value={url} readOnly onFocus={focus => focus.target.select()} className="font-mono text-xs"/>
                            <Button type="button" variant="outline" size="icon" aria-label={t("Calendar.copy")} onClick={copy}><Copy/></Button>
                        </div>
                        <p className="text-sm text-muted-foreground">{t("Calendar.shownOnce")}</p>
                    </div>
                ) : feed ? (
                    <div className="space-y-3 text-sm">
                        <p>{t("Calendar.active", {createdAt: formatInstant(feed.createdAt) ?? ""})}</p>
                        <Alert>
                            <AlertDescription>{t("Calendar.replaceWarning")}</AlertDescription>
                        </Alert>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">{t("Calendar.none")}</p>
                )}
                <DialogFooter>
                    {url ? (
                        <Button type="button" onClick={() => setOpen(false)}>{t("Common.close")}</Button>
                    ) : feed ? (
                        <>
                            <Button type="button" variant="outline" disabled={pending} onClick={revoke}>{t("Calendar.revoke")}</Button>
                            <Button type="button" disabled={pending} onClick={create}>{t("Calendar.replace")}</Button>
                        </>
                    ) : (
                        <Button type="button" disabled={pending} onClick={create}>{t("Calendar.create")}</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
