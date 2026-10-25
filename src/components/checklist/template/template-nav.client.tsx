"use client";

import * as React from "react";
import {useId, useState, useTransition} from "react";
import Link from "next/link";
import {useParams, useRouter, useSearchParams} from "next/navigation";
import {useLocale, useTranslations} from "next-intl";
import {Plus} from "lucide-react";
import type {ChecklistTemplatesQuery} from "@/gql/graphql";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle} from "@/components/ui/sheet";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {pickText} from "@/components/guide/localized";
import {ShowRetiredSwitch} from "@/components/show-retired-switch.client";
import {createTemplateAction} from "@/app/(app)/admin/checklist-templates/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {MAX_TEMPLATE_NAME} from "@/lib/checklist/schema";
import {cn} from "@/utils/utils";

type Template = ChecklistTemplatesQuery["checklistTemplates"][number];
type Chapter = { key: string; title: { sv: string; en?: string | null } };

const row = "flex w-full items-baseline gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent";

function Count({count}: { count: number }) {
    const t = useTranslations("ChecklistTemplate");

    return <span
        className="ml-auto shrink-0 text-xs text-muted-foreground tabular-nums">{t("itemCount", {count})}</span>;
}

/**
 * The page heading above the list and the template, with the switch for retired templates. On phones the template has
 * its own way back instead, so the heading is only on the list there.
 */
export function TemplatePageHeader() {
    const t = useTranslations("ChecklistTemplate");
    const current = useParams<{ templateId?: string }>().templateId;
    const retired = useSearchParams().get("retired") === "1";

    return (
        <div className={cn("flex flex-wrap items-center justify-between gap-2", current && "hidden lg:flex")}>
            <h2 className="text-lg font-bold tracking-tight">{t("title")}</h2>
            <ShowRetiredSwitch shown={retired} label={t("showRetired")}/>
        </div>
    );
}

/**
 * The templates beside the one being edited: a row per chapter of the latest published guide version in the guide's
 * order, creating the missing ones in one click, then templates for chapters the guide no longer has, then event
 * templates by name. It lives in the layout, so it stays put while the template beside it loads. Retired
 * templates only with {@code ?retired=1}; the layout cannot read the query, so it passes them all and they are hidden
 * here. On the list page it is the whole page on phones; beside a template, only from {@code lg}.
 */
export function TemplateNav({templates: all, chapters}: { templates: Template[]; chapters: Chapter[] }) {
    const t = useTranslations();
    const current = useParams<{ templateId?: string }>().templateId;
    const retired = useSearchParams().get("retired") === "1";
    const templates = retired ? all : all.filter(template => !template.retired);
    const id = useId();
    const locale = useLocale();
    const router = useRouter();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const [creating, setCreating] = useState(false);
    const [name, setName] = useState({sv: "", en: ""});
    const query = retired ? "?retired=1" : "";
    const href = (template: Template) => `/admin/checklist-templates/${template.id}${query}`;
    const open = (id: string | undefined) => id && router.push(`/admin/checklist-templates/${id}${query}`);
    const link = (template: Template, children: React.ReactNode, extra?: string) => (
        <Link href={href(template)} aria-current={template.id === current ? "page" : undefined}
              className={cn(row, extra, template.id === current && "bg-accent font-medium")}>
            {children}
        </Link>
    );
    const events = templates.filter(template => template.kind === "EVENT");
    const keys = new Set(chapters.map(chapter => chapter.key));
    const orphaned = templates.filter(template => template.kind === "CHAPTER" && !keys.has(template.chapterKey ?? ""));

    return (
        <nav aria-label={t("ChecklistTemplate.title")}
             className={cn("space-y-6 lg:sticky lg:top-24 lg:h-fit lg:max-h-[calc(100dvh-8rem)] lg:w-80 lg:shrink-0 lg:overflow-y-auto", current && "hidden lg:block")}>
            <section className="space-y-1" aria-label={t("ChecklistTemplate.chapters")}>
                <h3 className="px-2 text-sm font-medium text-muted-foreground">{t("ChecklistTemplate.chapters")}</h3>
                {chapters.length === 0 &&
                    <p className="px-2 text-sm text-muted-foreground">{t("ChecklistTemplate.noChapters")}</p>}
                <ol>
                    {chapters.map((chapter, index) => {
                        const own = templates.filter(template => template.kind === "CHAPTER" && template.chapterKey === chapter.key);
                        const active = own.find(template => !template.retired);
                        const title = (
                            <>
                                <span
                                    className="w-5 shrink-0 text-right tabular-nums text-muted-foreground">{index + 1}.</span>
                                <span className="min-w-0">{pickText(chapter.title, locale).text}</span>
                            </>
                        );

                        return (
                            <li key={chapter.key}>
                                {active ? link(active, <>{title}<Count count={active.items.length}/></>) : (
                                    <button type="button" className={cn(row, "disabled:opacity-50")} disabled={pending}
                                            onClick={() => startTransition(async () => {
                                                const result = await createTemplateAction({
                                                    kind: "CHAPTER",
                                                    chapterKey: chapter.key
                                                });

                                                if (feedback(result)) {
                                                    open(result.data.id);
                                                }
                                            })}>
                                        {title}
                                        <span
                                            className="ml-auto inline-flex shrink-0 items-center gap-1 text-xs text-primary">
                                            <Plus className="size-3"/>{t("ChecklistTemplate.createChapter")}
                                        </span>
                                    </button>
                                )}
                                {own.filter(template => template.retired).map(template => (
                                    <React.Fragment key={template.id}>
                                        {link(template, <><span
                                            className="text-muted-foreground">{t("ChecklistTemplate.retired")}</span><Count
                                            count={template.items.length}/></>, "pl-9")}
                                    </React.Fragment>
                                ))}
                            </li>
                        );
                    })}
                </ol>
            </section>
            {orphaned.length > 0 && (
                <section className="space-y-1" aria-label={t("ChecklistTemplate.orphaned")}>
                    <h3 className="px-2 text-sm font-medium text-muted-foreground">{t("ChecklistTemplate.orphaned")}</h3>
                    <p className="px-2 text-xs text-muted-foreground">{t("ChecklistTemplate.orphanedDescription")}</p>
                    <ul>
                        {orphaned.map(template => (
                            <li key={template.id}>
                                {link(template, (
                                    <>
                                        <span className="min-w-0">
                                            {template.chapterTitle ? pickText(template.chapterTitle, locale).text : t("ChecklistTemplate.chapterGone")}
                                        </span>
                                        {template.retired &&
                                            <Badge variant="outline">{t("ChecklistTemplate.retired")}</Badge>}
                                        <Count count={template.items.length}/>
                                    </>
                                ))}
                            </li>
                        ))}
                    </ul>
                </section>
            )}
            <section className="space-y-1" aria-label={t("ChecklistTemplate.events")}>
                <div className="flex items-center justify-between gap-2 px-2">
                    <h3 className="text-sm font-medium text-muted-foreground">{t("ChecklistTemplate.events")}</h3>
                    <Button size="sm" variant="outline"
                            onClick={() => setCreating(true)}><Plus/>{t("ChecklistTemplate.createEvent")}</Button>
                </div>
                {events.length === 0 ? (
                    <p className="px-2 text-sm text-muted-foreground">{t("ChecklistTemplate.noEvents")}</p>
                ) : (
                    <ul>
                        {events.map(template => (
                            <li key={template.id}>
                                {link(template, (
                                    <>
                                        <span
                                            className="min-w-0">{template.name ? pickText(template.name, locale).text : ""}</span>
                                        {template.retired &&
                                            <Badge variant="outline">{t("ChecklistTemplate.retired")}</Badge>}
                                        <Count count={template.items.length}/>
                                    </>
                                ))}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
            <Sheet open={creating} onOpenChange={setCreating}>
                <SheetContent className="w-full sm:max-w-[600px] flex flex-col gap-0 p-0 h-full">
                    <SheetHeader
                        className="p-6 pb-4 shrink-0"><SheetTitle>{t("ChecklistTemplate.createEvent")}</SheetTitle></SheetHeader>
                    <form className="flex min-h-0 flex-1 flex-col overflow-hidden" onSubmit={event => {
                        event.preventDefault();
                        startTransition(async () => {
                            const result = await createTemplateAction({kind: "EVENT", name});

                            if (feedback(result)) {
                                setCreating(false);
                                setName({sv: "", en: ""});
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
                                    <Input id={`${id}-name-en`} maxLength={MAX_TEMPLATE_NAME} value={name.en}
                                           onChange={event => setName({...name, en: event.target.value})}/>
                                </div>
                            </div>
                        </ScrollArea>
                        <SheetFooter className="p-6 pt-4 border-t bg-muted/30 shrink-0 mt-auto">
                            <Button type="button" variant="outline"
                                    onClick={() => setCreating(false)}>{t("Common.cancel")}</Button>
                            <Button type="submit" disabled={pending}>{t("Common.save")}</Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </nav>
    );
}
