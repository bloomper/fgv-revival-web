"use client";

import * as React from "react";
import {useId, useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import type {ChecklistItemFieldsFragment} from "@/gql/graphql";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {setChecklistItemStateAction} from "@/app/(app)/revivals/[id]/checklists/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {MAX_REASON} from "@/lib/checklist/schema";

/**
 * Marks an item not applicable, which is how it is cancelled. A guide requirement needs a reason, and only a directeur
 * may waive one (M3 FR-025).
 */
export function ChecklistStateDialog({revivalId, item, open, onOpenChange}: {
    revivalId: string;
    item: ChecklistItemFieldsFragment;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const t = useTranslations();
    const id = useId();
    const feedback = useActionFeedback();
    const [reason, setReason] = useState("");
    const [pending, startTransition] = useTransition();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("Checklist.notApplicableTitle")}</DialogTitle>
                    <DialogDescription>{item.required ? t("Checklist.waiveDescription") : t("Checklist.notApplicableDescription")}</DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    <Label htmlFor={`${id}-reason`}>{item.required ? t("Checklist.reasonRequired") : t("Checklist.reason")}</Label>
                    <Textarea id={`${id}-reason`} rows={2} maxLength={MAX_REASON} value={reason} onChange={event => setReason(event.target.value)}/>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>{t("Common.cancel")}</Button>
                    <Button disabled={pending || (item.required && !reason.trim())} onClick={() => startTransition(async () => {
                        if (feedback(await setChecklistItemStateAction({id: item.id, version: item.version, revivalId, state: "NOT_APPLICABLE", reason}),
                            t("Common.saved"))) {
                            onOpenChange(false);
                        }
                    })}>{t("Checklist.markNotApplicable")}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
