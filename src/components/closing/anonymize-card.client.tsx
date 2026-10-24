"use client";

import {useId, useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {UserX} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {anonymizeRevivalAction} from "@/app/(app)/revivals/[id]/closing/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {confirmsRevival} from "@/lib/closing/schema";
import {formatDate, formatInstant} from "@/utils/format";
import {track} from "@/utils/umami";

const REMOVED = ["participants", "pending", "dietary", "staffing", "owners", "meetings", "login"] as const;
const KEPT = ["guide", "log", "checklists", "events", "budget", "materials", "sync"] as const;

/**
 * What anonymizing removes and keeps (section 7, M7-FR-10..13), when it happens by itself, and the button that does it
 * now. It cannot be undone, so the revival's title must be typed to confirm, as when a guide chapter is removed.
 */
export function AnonymizeCard({revival, anonymizedAt, autoAnonymizeOn, canAnonymize, syncIncomplete = false}: {
    revival: { id: string; title: string; version: number };
    anonymizedAt: string | null;
    autoAnonymizeOn: string | null;
    canAnonymize: boolean;
    /** The participants are gone afterwards, so a sync not yet completed never can be (M7-FR-14). */
    syncIncomplete?: boolean;
}) {
    const t = useTranslations("Closing.anonymize");
    const tc = useTranslations("Common");
    const id = useId();
    const feedback = useActionFeedback();
    const [open, setOpen] = useState(false);
    const [typed, setTyped] = useState("");
    const [pending, startTransition] = useTransition();

    if (anonymizedAt) {
        return <p className="text-sm">{t("done", {at: formatInstant(anonymizedAt) ?? ""})}</p>;
    }

    return (
        <div className="space-y-4 text-sm">
            <p>{t("intro")}</p>
            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <h5 className="mb-1 font-medium">{t("removedTitle")}</h5>
                    <ul className="list-disc space-y-1 pl-5">
                        {REMOVED.map(key => <li key={key}>{t(`removed.${key}`)}</li>)}
                    </ul>
                </div>
                <div>
                    <h5 className="mb-1 font-medium">{t("keptTitle")}</h5>
                    <ul className="list-disc space-y-1 pl-5">
                        {KEPT.map(key => <li key={key}>{t(`kept.${key}`)}</li>)}
                    </ul>
                </div>
            </div>
            <p className="text-muted-foreground">{autoAnonymizeOn ? t("automaticOn", {date: formatDate(autoAnonymizeOn) ?? ""}) : t("automatic")}</p>
            {canAnonymize && syncIncomplete && <p className="font-medium text-destructive">{t("syncIncomplete")}</p>}
            {canAnonymize && (
                <AlertDialog open={open} onOpenChange={(next) => {
                    setOpen(next);
                    setTyped("");
                }}>
                    <AlertDialogTrigger render={<Button variant="destructive"/>}>
                        <UserX/>
                        {t("action")}
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t("confirmTitle", {title: revival.title})}</AlertDialogTitle>
                            <AlertDialogDescription>{t("confirmDescription")}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-2">
                            <Label htmlFor={`${id}-confirm`}>{t("type", {title: revival.title})}</Label>
                            <Input id={`${id}-confirm`} value={typed} autoComplete="off"
                                   onChange={event => setTyped(event.target.value)}/>
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{tc("cancel")}</AlertDialogCancel>
                            <AlertDialogAction variant="destructive"
                                               disabled={pending || !confirmsRevival(typed, revival)}
                                               onClick={() => startTransition(async () => {
                                                   const result = await anonymizeRevivalAction({
                                                       id: revival.id,
                                                       version: revival.version,
                                                       confirmation: typed.trim()
                                                   });

                                                   if (feedback(result, t("anonymized"))) {
                                                       track("revival-anonymize");
                                                       setOpen(false);
                                                   }
                                               })}>
                                {t("action")}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    );
}
