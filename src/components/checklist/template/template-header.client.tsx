"use client";

import * as React from "react";
import {useId, useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {Archive, ArchiveRestore} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {renameTemplateAction, restoreTemplateAction, retireTemplateAction} from "@/app/(app)/admin/checklist-templates/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {MAX_TEMPLATE_NAME} from "@/lib/checklist/schema";

type Template = { id: string; version: number; retired: boolean; name?: { sv: string; en?: string | null } | null };

/**
 * An event template's name (FR-030).
 */
export function TemplateNameForm({template}: { template: Template }) {
    const t = useTranslations();
    const id = useId();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const [name, setName] = useState({sv: template.name?.sv ?? "", en: template.name?.en ?? ""});

    return (
        <form className="flex flex-col gap-2 sm:flex-row sm:items-end" onSubmit={event => {
            event.preventDefault();
            startTransition(async () => {
                feedback(await renameTemplateAction({id: template.id, version: template.version, ...name}), t("Common.saved"));
            });
        }}>
            <div className="flex-1 space-y-2">
                <Label htmlFor={`${id}-sv`}>{t("ChecklistTemplate.nameSv")}</Label>
                <Input id={`${id}-sv`} required maxLength={MAX_TEMPLATE_NAME} value={name.sv} onChange={event => setName({...name, sv: event.target.value})}/>
            </div>
            <div className="flex-1 space-y-2">
                <Label htmlFor={`${id}-en`}>{t("ChecklistTemplate.nameEn")}</Label>
                <Input id={`${id}-en`} maxLength={MAX_TEMPLATE_NAME} value={name.en} onChange={event => setName({...name, en: event.target.value})}/>
            </div>
            <Button type="submit" variant="outline" disabled={pending}>{t("Common.save")}</Button>
        </form>
    );
}

/**
 * Retiring a template, which leaves checklists made from it as they are, or restoring a retired one (FR-030).
 */
export function TemplateRetirement({template}: { template: Template }) {
    const t = useTranslations("ChecklistTemplate");
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();

    return template.retired ? (
        <Button variant="outline" disabled={pending} onClick={() => startTransition(async () => {
            feedback(await restoreTemplateAction({id: template.id, version: template.version}), t("restoredDone"));
        })}><ArchiveRestore/>{t("restore")}</Button>
    ) : (
        <Button variant="outline" disabled={pending} onClick={() => startTransition(async () => {
            feedback(await retireTemplateAction({id: template.id, version: template.version}), t("retiredDone"));
        })}><Archive/>{t("retire")}</Button>
    );
}
