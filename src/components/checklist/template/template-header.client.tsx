"use client";

import * as React from "react";
import {useId, useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {Archive} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {renameTemplateAction, retireTemplateAction} from "@/app/(app)/admin/checklist-templates/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {MAX_TEMPLATE_NAME} from "@/lib/checklist/schema";

/**
 * An event template's name, and retiring a template, which leaves checklists made from it as they are (FR-030).
 */
export function TemplateHeader({template}: {
    template: { id: string; kind: "PHASE" | "EVENT"; version: number; name?: { sv: string; en?: string | null } | null };
}) {
    const t = useTranslations();
    const id = useId();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const [name, setName] = useState({sv: template.name?.sv ?? "", en: template.name?.en ?? ""});

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            {template.kind === "EVENT" && (
                <form className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-end" onSubmit={event => {
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
            )}
            <Button variant="outline" className="sm:ml-auto" disabled={pending} onClick={() => startTransition(async () => {
                feedback(await retireTemplateAction({id: template.id, version: template.version}), t("ChecklistTemplate.retiredDone"));
            })}><Archive/>{t("ChecklistTemplate.retire")}</Button>
        </div>
    );
}
