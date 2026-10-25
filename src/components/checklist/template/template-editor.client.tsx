"use client";

import * as React from "react";
import {useState, useTransition} from "react";
import {useFormatter, useLocale, useTranslations} from "next-intl";
import {Archive, ArchiveRestore, ArrowDown, ArrowUp, Pencil, Plus} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {catalogName} from "@/components/catalog/catalog";
import {type TemplateItem, TemplateItemDialog} from "@/components/checklist/template/template-item-dialog.client";
import {
    moveTemplateItemAction,
    restoreTemplateItemAction,
    retireTemplateItemAction
} from "@/app/(app)/admin/checklist-templates/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";

/**
 * A template's items in order, moved up and down, edited or retired. Retiring keeps checklist items' links;
 * with {@code showRetired}, the retired items follow, to be restored at the end of the list.
 */
export function TemplateEditor({templateId, kind, items, retiredItems, showRetired, readOnly}: {
    templateId: string;
    kind: "CHAPTER" | "EVENT";
    items: TemplateItem[];
    retiredItems: TemplateItem[];
    showRetired: boolean;
    readOnly: boolean;
}) {
    const t = useTranslations();
    const locale = useLocale();
    const format = useFormatter();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const [editing, setEditing] = useState<TemplateItem | null>(null);
    const [adding, setAdding] = useState(false);
    const deadline = (item: TemplateItem) => {
        if (!item.deadline) {
            return null;
        }
        if (item.deadline.kind === "WEEKDAY_WEEK_BEFORE") {
            return t("ChecklistTemplate.deadline.weekdayRule", {weekday: t(`ChecklistTemplate.deadline.weekdays.${item.deadline.weekday ?? "MONDAY"}`)});
        }
        return t(`ChecklistTemplate.deadline.${item.deadline.kind}Rule`, {
            amount: format.number(Math.abs(item.deadline.amount ?? 0)),
            direction: (item.deadline.amount ?? 0) <= 0 ? "before" : "after",
        });
    };
    const run = (action: () => Promise<Parameters<typeof feedback>[0]>, success?: string) => startTransition(async () => {
        feedback(await action(), success);
    });
    const body = (item: TemplateItem) => (
        <div className="min-w-0 flex-1 space-y-1">
            <p>{item.text.sv}</p>
            {item.text.en && <p className="text-sm text-muted-foreground">{item.text.en}</p>}
            <div className="flex flex-wrap gap-2 text-sm">
                {deadline(item) && <Badge variant="outline">{deadline(item)}</Badge>}
                {item.defaultCapability &&
                    <Badge variant="outline">{catalogName(item.defaultCapability, locale)}</Badge>}
                {item.guideItem &&
                    <span className="text-xs text-muted-foreground">{t("ChecklistTemplate.guideItem.linked")}</span>}
            </div>
        </div>
    );

    return (
        <div className="space-y-3">
            {!readOnly && <Button onClick={() => setAdding(true)}><Plus/>{t("ChecklistTemplate.addItem")}</Button>}
            {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("ChecklistTemplate.noItems")}</p>
            ) : (
                <ol className="space-y-2" aria-label={t("ChecklistTemplate.items")}>
                    {items.map((item, index) => (
                        <li key={item.id} className="flex gap-3 rounded-lg border p-3">
                            {body(item)}
                            {!readOnly && (
                                <div className="flex shrink-0 items-start gap-1">
                                    <Button size="icon" variant="ghost"
                                            aria-label={t("ChecklistTemplate.moveUp", {text: item.text.sv})}
                                            disabled={pending || index === 0}
                                            onClick={() => run(() => moveTemplateItemAction({
                                                templateId,
                                                id: item.id,
                                                version: item.version,
                                                position: index - 1
                                            }))}><ArrowUp/></Button>
                                    <Button size="icon" variant="ghost"
                                            aria-label={t("ChecklistTemplate.moveDown", {text: item.text.sv})}
                                            disabled={pending || index === items.length - 1}
                                            onClick={() => run(() => moveTemplateItemAction({
                                                templateId,
                                                id: item.id,
                                                version: item.version,
                                                position: index + 1
                                            }))}><ArrowDown/></Button>
                                    <Button size="icon" variant="ghost"
                                            aria-label={t("ChecklistTemplate.editItemNamed", {text: item.text.sv})}
                                            onClick={() => setEditing(item)}><Pencil/></Button>
                                    <Button size="icon" variant="ghost"
                                            aria-label={t("ChecklistTemplate.retireItem", {text: item.text.sv})}
                                            disabled={pending}
                                            onClick={() => run(() => retireTemplateItemAction({
                                                templateId,
                                                id: item.id,
                                                version: item.version
                                            }))}><Archive/></Button>
                                </div>
                            )}
                        </li>
                    ))}
                </ol>
            )}
            {showRetired && retiredItems.length > 0 && (
                <section className="space-y-2 pt-4" aria-label={t("ChecklistTemplate.retiredItems")}>
                    <h4 className="text-sm font-medium text-muted-foreground">{t("ChecklistTemplate.retiredItems")}</h4>
                    <ul className="space-y-2">
                        {retiredItems.map(item => (
                            <li key={item.id}
                                className="flex gap-3 rounded-lg border border-dashed p-3 text-muted-foreground">
                                {body(item)}
                                {!readOnly && (
                                    <Button size="icon" variant="ghost" className="shrink-0"
                                            aria-label={t("ChecklistTemplate.restoreItem", {text: item.text.sv})}
                                            disabled={pending}
                                            onClick={() => run(() => restoreTemplateItemAction({
                                                    templateId,
                                                    id: item.id,
                                                    version: item.version
                                                }),
                                                t("ChecklistTemplate.itemRestored"))}><ArchiveRestore/></Button>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>
            )}
            {(adding || editing) && (
                <TemplateItemDialog key={editing?.id ?? "new"} templateId={templateId} kind={kind} item={editing} open
                                    onOpenChange={(open) => {
                                        if (!open) {
                                            setAdding(false);
                                            setEditing(null);
                                        }
                                    }}/>
            )}
        </div>
    );
}
