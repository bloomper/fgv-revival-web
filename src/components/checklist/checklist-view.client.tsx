"use client";

import * as React from "react";
import {useState} from "react";
import {useTranslations} from "next-intl";
import {Plus} from "lucide-react";
import type {ChecklistItemFieldsFragment} from "@/gql/graphql";
import {Button} from "@/components/ui/button";
import type {OwnerMember} from "@/components/owner/owner-field.client";
import {ChecklistItemDialog} from "@/components/checklist/checklist-item-dialog.client";
import {ChecklistItemRow} from "@/components/checklist/checklist-item-row.client";
import {ChecklistStateDialog} from "@/components/checklist/checklist-state-dialog.client";

/**
 * A checklist's items, guide requirements first (M3 FR-022). Items are never deleted (FR-026).
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
                                          onEdit={() => setEditing(item)} onNotApplicable={() => setWaiving(item)}/>
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
        </div>
    );
}
