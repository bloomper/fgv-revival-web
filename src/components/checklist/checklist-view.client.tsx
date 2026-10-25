"use client";

import * as React from "react";
import {useState} from "react";
import {useLocale, useTranslations} from "next-intl";
import {Plus} from "lucide-react";
import type {ChecklistItemFieldsFragment} from "@/gql/graphql";
import {Button} from "@/components/ui/button";
import type {OwnerMember} from "@/components/owner/owner-field.client";
import {ChecklistItemDialog} from "@/components/checklist/checklist-item-dialog.client";
import {ChecklistItemRow} from "@/components/checklist/checklist-item-row.client";
import {ChecklistStateDialog} from "@/components/checklist/checklist-state-dialog.client";
import {pickText} from "@/components/guide/localized";
import {HistoryDialog} from "@/components/history/history-dialog.client";

// A guide requirement can be a paragraph; the dialog's title needs only its start
function truncate(text: string): string {
    const plain = text.replace(/[*_`#>[\]()]/g, "").trim();

    return plain.length > 80 ? `${plain.slice(0, 79)}…` : plain;
}

/**
 * A checklist's items, guide requirements first. Items are never deleted.
 */
export function ChecklistView({revivalId, checklistId, items, members, canWrite, canWaive, cancelled, actions}: {
    revivalId: string;
    checklistId: string;
    items: ChecklistItemFieldsFragment[];
    members: OwnerMember[];
    canWrite: boolean;
    canWaive: boolean;
    cancelled: boolean;
    actions?: React.ReactNode;
}) {
    const t = useTranslations("Checklist");
    const [editing, setEditing] = useState<ChecklistItemFieldsFragment | null>(null);
    const [adding, setAdding] = useState(false);
    const [waiving, setWaiving] = useState<ChecklistItemFieldsFragment | null>(null);
    const [history, setHistory] = useState<ChecklistItemFieldsFragment | null>(null);
    const locale = useLocale();
    const writable = canWrite && !cancelled;

    return (
        <div className="space-y-3">
            {writable && (
                <div className="flex flex-wrap gap-2">
                    <Button onClick={() => setAdding(true)}><Plus/>{t("addItem")}</Button>
                    {actions}
                </div>
            )}
            {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("empty")}</p>
            ) : (
                <ul className="space-y-2">
                    {items.map(item => (
                        <ChecklistItemRow key={item.id} revivalId={revivalId} item={item} canWrite={writable}
                                          canWaive={canWaive}
                                          onEdit={() => setEditing(item)} onNotApplicable={() => setWaiving(item)}
                                          onHistory={() => setHistory(item)}/>
                    ))}
                </ul>
            )}
            {(adding || editing) && (
                <ChecklistItemDialog revivalId={revivalId} checklistId={checklistId} item={editing} members={members}
                                     open
                                     onOpenChange={(open) => {
                                         if (!open) {
                                             setAdding(false);
                                             setEditing(null);
                                         }
                                     }}/>
            )}
            {waiving && <ChecklistStateDialog revivalId={revivalId} item={waiving} open
                                              onOpenChange={(open) => !open && setWaiving(null)}/>}
            {history && (
                <HistoryDialog key={history.id} target={{
                    type: "CHECKLIST_ITEM",
                    id: history.id,
                    title: truncate(history.required ? pickText(history.text, locale).text : history.text.sv)
                }} onOpenChange={open => !open && setHistory(null)}/>
            )}
        </div>
    );
}
