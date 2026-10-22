"use client";

import * as React from "react";
import {useId, useState, useTransition} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useLocale, useTranslations} from "next-intl";
import {Plus} from "lucide-react";
import type {ChecklistTemplatesQuery} from "@/gql/graphql";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle} from "@/components/ui/sheet";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {pickText} from "@/components/guide/localized";
import {createTemplateAction} from "@/app/(app)/admin/checklist-templates/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {MAX_TEMPLATE_NAME} from "@/lib/checklist/schema";

type Template = ChecklistTemplatesQuery["checklistTemplates"][number];
type Chapter = { key: string; title: { sv: string; en?: string | null } };

/**
 * A template per chapter of the latest published guide version, with the missing ones to create, templates for
 * chapters the guide no longer has, then event templates by name (FR-030).
 */
export function TemplateList({templates, chapters}: { templates: Template[]; chapters: Chapter[] }) {
    const t = useTranslations();
    const id = useId();
    const locale = useLocale();
    const router = useRouter();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const [creating, setCreating] = useState(false);
    const [name, setName] = useState({sv: "", en: ""});
    const href = (template: Template) => `/admin/checklist-templates/${template.id}`;
    const open = (id: string | undefined) => id && router.push(`/admin/checklist-templates/${id}`);
    const events = templates.filter(template => template.kind === "EVENT");
    const keys = new Set(chapters.map(chapter => chapter.key));
    const orphaned = templates.filter(template => template.kind === "CHAPTER" && !keys.has(template.chapterKey ?? ""));

    return (
        <div className="space-y-6">
            <section className="space-y-2" aria-label={t("ChecklistTemplate.chapters")}>
                <h3 className="font-medium">{t("ChecklistTemplate.chapters")}</h3>
                {chapters.length === 0 && <p className="text-sm text-muted-foreground">{t("ChecklistTemplate.noChapters")}</p>}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {chapters.map((chapter, index) => {
                        const own = templates.filter(template => template.kind === "CHAPTER" && template.chapterKey === chapter.key);
                        const active = own.find(template => !template.retired);

                        return (
                            <Card key={chapter.key}>
                                <CardHeader><CardTitle>{index + 1}. {pickText(chapter.title, locale).text}</CardTitle></CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    {active ? (
                                        <Link href={href(active)} className="hover:underline">{t("ChecklistTemplate.itemCount", {count: active.items.length})}</Link>
                                    ) : (
                                        <Button size="sm" variant="outline" disabled={pending} onClick={() => startTransition(async () => {
                                            const result = await createTemplateAction({kind: "CHAPTER", chapterKey: chapter.key});

                                            if (feedback(result)) {
                                                open(result.data.id);
                                            }
                                        })}>{t("ChecklistTemplate.createChapter")}</Button>
                                    )}
                                    {own.filter(template => template.retired).map(template => (
                                        <Link key={template.id} href={href(template)} className="block text-muted-foreground hover:underline">
                                            {t("ChecklistTemplate.retired")}
                                        </Link>
                                    ))}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </section>
            {orphaned.length > 0 && (
                <section className="space-y-2" aria-label={t("ChecklistTemplate.orphaned")}>
                    <h3 className="font-medium">{t("ChecklistTemplate.orphaned")}</h3>
                    <p className="text-sm text-muted-foreground">{t("ChecklistTemplate.orphanedDescription")}</p>
                    <ul className="divide-y rounded-lg border">
                        {orphaned.map(template => (
                            <li key={template.id}>
                                <Link href={href(template)} className="flex items-center justify-between gap-2 p-3 hover:bg-accent">
                                    <span>{t("ChecklistTemplate.chapterGone")}</span>
                                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                        {template.retired && <Badge variant="outline">{t("ChecklistTemplate.retired")}</Badge>}
                                        {t("ChecklistTemplate.itemCount", {count: template.items.length})}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
            <section className="space-y-2" aria-label={t("ChecklistTemplate.events")}>
                <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium">{t("ChecklistTemplate.events")}</h3>
                    <Button size="sm" onClick={() => setCreating(true)}><Plus/>{t("ChecklistTemplate.createEvent")}</Button>
                </div>
                {events.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("ChecklistTemplate.noEvents")}</p>
                ) : (
                    <ul className="divide-y rounded-lg border">
                        {events.map(template => (
                            <li key={template.id}>
                                <Link href={href(template)} className="flex items-center justify-between gap-2 p-3 hover:bg-accent">
                                    <span>{template.name ? pickText(template.name, locale).text : ""}</span>
                                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                        {template.retired && <Badge variant="outline">{t("ChecklistTemplate.retired")}</Badge>}
                                        {t("ChecklistTemplate.itemCount", {count: template.items.length})}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
            <Sheet open={creating} onOpenChange={setCreating}>
                <SheetContent className="w-full sm:max-w-[600px] flex flex-col gap-0 p-0 h-full">
                    <SheetHeader className="p-6 pb-4 shrink-0"><SheetTitle>{t("ChecklistTemplate.createEvent")}</SheetTitle></SheetHeader>
                    <form className="flex min-h-0 flex-1 flex-col overflow-hidden" onSubmit={event => {
                        event.preventDefault();
                        startTransition(async () => {
                            const result = await createTemplateAction({kind: "EVENT", name});

                            if (feedback(result)) {
                                setCreating(false);
                                open(result.data.id);
                            }
                        });
                    }}>
                        <ScrollArea className="min-h-0 flex-1 border-t">
                            <div className="space-y-4 px-6 py-6 pb-12">
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-name-sv`}>{t("ChecklistTemplate.nameSv")}</Label>
                                    <Input id={`${id}-name-sv`} required maxLength={MAX_TEMPLATE_NAME} value={name.sv}
                                           onChange={event => setName({...name, sv: event.target.value})}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-name-en`}>{t("ChecklistTemplate.nameEn")}</Label>
                                    <Input id={`${id}-name-en`} maxLength={MAX_TEMPLATE_NAME} value={name.en} onChange={event => setName({...name, en: event.target.value})}/>
                                </div>
                            </div>
                        </ScrollArea>
                        <SheetFooter className="p-6 pt-4 border-t bg-muted/30 shrink-0 mt-auto">
                            <Button type="button" variant="outline" onClick={() => setCreating(false)}>{t("Common.cancel")}</Button>
                            <Button type="submit" disabled={pending}>{t("Common.save")}</Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
}
