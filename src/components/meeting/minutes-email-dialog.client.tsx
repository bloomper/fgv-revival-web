"use client";

import * as React from "react";
import {useState, useTransition} from "react";
import {useLocale, useTranslations} from "next-intl";
import {toast} from "sonner";
import {Mail} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {type MinutesEmailResult, retryMinutesAction, sendMinutesAction} from "@/app/(app)/revivals/[id]/meetings/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";

/**
 * Emails a closed meeting's minutes to the steering group, in Swedish or English, and shows who did not get them,
 * with a way to send again to those only (M3 FR-021).
 */
export function MinutesEmailDialog({revivalId, meetingId}: { revivalId: string; meetingId: string }) {
    const t = useTranslations("Meeting");
    const locale = useLocale();
    const feedback = useActionFeedback();
    const [open, setOpen] = useState(false);
    const [language, setLanguage] = useState<"sv" | "en">(locale === "en" ? "en" : "sv");
    const [result, setResult] = useState<MinutesEmailResult | null>(null);
    const [pending, startTransition] = useTransition();

    const show = (outcome: MinutesEmailResult) => {
        setResult(outcome);
        if (outcome.failed.length === 0) {
            toast.success(t("emailSent", {count: outcome.sent}));
        }
    };

    return (
        <>
            <Button variant="outline" onClick={() => {
                setResult(null);
                setOpen(true);
            }}><Mail/>{t("email")}</Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("emailTitle")}</DialogTitle>
                        <DialogDescription>{t("emailDescription")}</DialogDescription>
                    </DialogHeader>
                    {result ? (
                        <div className="space-y-2 text-sm">
                            <p>{t("emailSent", {count: result.sent})}</p>
                            {result.waitingLeftOut > 0 && <p>{t("waitingLeftOut", {count: result.waitingLeftOut})}</p>}
                            {result.failed.length > 0 && (
                                <>
                                    <p className="text-destructive">{t("emailFailed")}</p>
                                    <ul className="list-disc pl-5">{result.failed.map(name => <li key={name}>{name}</li>)}</ul>
                                </>
                            )}
                        </div>
                    ) : (
                        <label className="flex items-center gap-2 text-sm">
                            {t("language")}
                            <select className="h-8 rounded-md border border-input bg-background px-2" value={language}
                                    onChange={event => setLanguage(event.target.value as "sv" | "en")}>
                                <option value="sv">Svenska</option>
                                <option value="en">English</option>
                            </select>
                        </label>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>{t("done")}</Button>
                        {result?.failed.length ? (
                            <Button disabled={pending} onClick={() => startTransition(async () => {
                                const outcome = await retryMinutesAction({emailId: result.id, revivalId, meetingId});

                                if (feedback(outcome)) {
                                    show(outcome.data);
                                }
                            })}>{t("sendAgain")}</Button>
                        ) : !result && (
                            <Button disabled={pending} onClick={() => startTransition(async () => {
                                const outcome = await sendMinutesAction({meetingId, revivalId, language});

                                if (feedback(outcome)) {
                                    show(outcome.data);
                                }
                            })}>{t("send")}</Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
