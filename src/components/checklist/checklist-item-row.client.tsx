"use client";

import * as React from "react";
import {useOptimistic, useTransition} from "react";
import {useTranslations} from "next-intl";
import {Ban, Pencil, RotateCcw} from "lucide-react";
import type {ChecklistItemFieldsFragment} from "@/gql/graphql";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {OwnerLabel} from "@/components/owner/owner-label";
import {PlainText} from "@/components/plain-text";
import {OverdueBadge} from "@/components/decision-log/overdue-badge";
import {ChecklistItemText} from "@/components/checklist/checklist-item-text";
import {setChecklistItemStateAction} from "@/app/(app)/revivals/[id]/checklists/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {cn} from "@/utils/utils";

/**
 * One checklist item: a done box, its text, owner, deadline, comment and links. Controls only for those who may write;
 * not applicable on a guide requirement only for directeurs (M3 FR-025).
 */
export function ChecklistItemRow({revivalId, item, canWrite, canWaive, onEdit, onNotApplicable}: {
    revivalId: string;
    item: ChecklistItemFieldsFragment;
    canWrite: boolean;
    canWaive: boolean;
    onEdit: () => void;
    onNotApplicable: () => void;
}) {
    const t = useTranslations("Checklist");
    const tc = useTranslations("Capability");
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const [state, setOptimisticState] = useOptimistic(item.state);
    const textId = `item-${item.id}-text`;
    const setState = (next: "OPEN" | "DONE") => startTransition(async () => {
        setOptimisticState(next);
        feedback(await setChecklistItemStateAction({id: item.id, version: item.version, revivalId, state: next}));
    });

    return (
        <li className={cn("flex gap-3 rounded-lg border p-3", item.state !== "OPEN" && "text-muted-foreground")}>
            <input type="checkbox" className="mt-1 size-4" aria-labelledby={textId} checked={state === "DONE"}
                   disabled={!canWrite || pending || item.state === "NOT_APPLICABLE"}
                   onChange={event => setState(event.target.checked ? "DONE" : "OPEN")}/>
            <div className="min-w-0 flex-1 space-y-1">
                <div id={textId} className={cn(item.state === "NOT_APPLICABLE" && "line-through")}>
                    <ChecklistItemText item={item}/>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                    {item.required && <Badge>{t("required")}</Badge>}
                    {item.state === "NOT_APPLICABLE" && <Badge variant="outline">{t("state.NOT_APPLICABLE")}</Badge>}
                    {item.overdue && <OverdueBadge/>}
                    <span>{t("owner")}: <OwnerLabel owner={item.owner}/></span>
                    {!item.owner && item.defaultCapability && <Badge variant="outline">{t("capabilityHint", {capability: tc(item.defaultCapability)})}</Badge>}
                    {item.deadline && <span>{t("deadline")}: {item.deadline}</span>}
                    {item.stateChangedBy?.displayName && item.state !== "OPEN" && (
                        <span className="text-xs">{t("changedBy", {name: item.stateChangedBy.displayName})}</span>
                    )}
                </div>
                {item.reason && <p className="text-sm">{t("reasonLabel")}: <PlainText text={item.reason}/></p>}
                {item.comment && <PlainText className="block text-sm" text={item.comment}/>}
                {item.guideItem && !item.required && (
                    <div className="text-xs">
                        <span>{t("guideItem")}:</span>
                        <ChecklistItemText item={{required: true, text: item.guideItem.text}}/>
                    </div>
                )}
                {item.logEntries.length > 0 && (
                    <p className="text-xs">{t("logRows", {numbers: item.logEntries.map(entry => `#${entry.number}`).join(", ")})}</p>
                )}
            </div>
            {canWrite && (
                <div className="flex shrink-0 items-start gap-1">
                    <Button size="icon" variant="ghost" aria-label={t("editItem")} onClick={onEdit}><Pencil/></Button>
                    {item.state === "NOT_APPLICABLE" ? (
                        <Button size="icon" variant="ghost" aria-label={t("reopen")} disabled={pending} onClick={() => setState("OPEN")}><RotateCcw/></Button>
                    ) : (!item.required || canWaive) && (
                        <Button size="icon" variant="ghost" aria-label={t("markNotApplicable")} onClick={onNotApplicable}><Ban/></Button>
                    )}
                </div>
            )}
        </li>
    );
}
