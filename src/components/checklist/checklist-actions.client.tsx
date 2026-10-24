"use client";

import * as React from "react";
import {useTransition} from "react";
import {useLocale, useTranslations} from "next-intl";
import {Ban, ListPlus} from "lucide-react";
import {Button} from "@/components/ui/button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {pickText} from "@/components/guide/localized";
import {addFromTemplateAction, cancelEventChecklistAction} from "@/app/(app)/revivals/[id]/checklists/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";

type Text = { sv: string; en?: string | null };
type Template = { id: string; kind: "CHAPTER" | "EVENT"; chapterTitle?: Text | null; name?: Text | null };

/**
 * Adding the items a template has and the checklist lacks (M3 FR-032a), and cancelling an event checklist.
 */
export function ChecklistActions({revivalId, checklist, templates}: {
    revivalId: string;
    checklist: { id: string; version: number; kind: "CHAPTER" | "EVENT" };
    templates: Template[];
}) {
    const t = useTranslations("Checklist");
    const locale = useLocale();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const add = (templateId: string) => startTransition(async () => {
        feedback(await addFromTemplateAction({
            revivalId,
            id: checklist.id,
            version: checklist.version,
            templateId
        }), t("addedFromTemplate"));
    });
    const label = (template: Template) => template.kind === "CHAPTER"
        ? t("chapterTemplate", {chapter: template.chapterTitle ? pickText(template.chapterTitle, locale).text : ""})
        : template.name ? pickText(template.name, locale).text : template.id;

    return (
        <>
            {templates.length === 1 && (
                <Button variant="outline" disabled={pending}
                        onClick={() => add(templates[0].id)}><ListPlus/>{t("addFromTemplate")}</Button>
            )}
            {templates.length > 1 && (
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={<Button variant="outline" disabled={pending}/>}><ListPlus/>{t("addFromTemplate")}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {templates.map(template => <DropdownMenuItem key={template.id}
                                                                     onClick={() => add(template.id)}>{label(template)}</DropdownMenuItem>)}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
            {checklist.kind === "EVENT" && (
                <Button variant="outline" className="text-destructive hover:text-destructive" disabled={pending}
                        onClick={() => startTransition(async () => {
                            feedback(await cancelEventChecklistAction({
                                revivalId,
                                id: checklist.id,
                                version: checklist.version
                            }), t("cancelledDone"));
                        })}><Ban/>{t("cancelEvent")}</Button>
            )}
        </>
    );
}
