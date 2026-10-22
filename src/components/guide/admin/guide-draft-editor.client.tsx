"use client";

import {type ReactNode, useTransition} from "react";
import {useLocale, useTranslations} from "next-intl";
import {ArrowDown, ArrowUp, PencilLine, Plus, Trash2} from "lucide-react";
import type {GuideItemFieldsFragment, GuideVersionFieldsFragment} from "@/gql/graphql";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    createItemAction,
    createSectionAction,
    moveItemAction,
    moveSectionAction,
    removeItemAction,
    removeSectionAction,
    updateChapterAction,
    updateItemAction,
    updateSectionAction,
} from "@/app/(app)/admin/guide/draft/actions.server";
import {GuideItemDialog} from "@/components/guide/admin/guide-item-dialog.client";
import {GuideIntroductionDialog} from "@/components/guide/admin/guide-introduction-dialog.client";
import {GuideTitleDialog} from "@/components/guide/admin/guide-title-dialog.client";
import {GuideMarkdown} from "@/components/guide/guide-markdown";
import {GuideTypeBadge} from "@/components/guide/guide-type-badge";
import {pickText} from "@/components/guide/localized";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import type {ActionResult} from "@/lib/graphql.server";

type Chapter = GuideVersionFieldsFragment["chapters"][number];
type Section = Chapter["sections"][number];
type Place = { chapterId: string; sectionId: string | null; label: string; size: number };

function NoEnglish({text}: { text: { en?: string | null } }) {
    const t = useTranslations("Guide.editor");

    return text.en ? null : <Badge variant="outline">{t("noEnglish")}</Badge>;
}

function IconAction({label, onClick, children, disabled}: { label: string; onClick: () => void; children: ReactNode; disabled?: boolean }) {
    return <Button type="button" variant="ghost" size="icon-sm" aria-label={label} title={label} onClick={onClick} disabled={disabled}>{children}</Button>;
}

function ConfirmRemove({label, onConfirm}: { label: string; onConfirm: () => Promise<ActionResult<null>> }) {
    const t = useTranslations();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();

    return (
        <AlertDialog>
            <AlertDialogTrigger render={<Button variant="ghost" size="icon-sm" aria-label={label} title={label}/>}>
                <Trash2/>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{label}</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t("Common.cancel")}</AlertDialogCancel>
                    <AlertDialogAction disabled={pending} onClick={() => startTransition(async () => {
                        feedback(await onConfirm(), t("Guide.editor.saved"));
                    })}>{t("Common.remove")}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

/**
 * The draft as an outline of chapters A–J, editable in place (FR-013, research R9). Every change sends the row's version,
 * so a concurrent edit is refused with "reload" (edge case).
 */
export function GuideDraftEditor({draft}: { draft: GuideVersionFieldsFragment }) {
    const t = useTranslations();
    const locale = useLocale();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const run = (work: () => Promise<ActionResult<null>>) => startTransition(async () => {
        feedback(await work());
    });
    const title = (text: { sv: string; en?: string | null }) => pickText(text, locale).text;

    const places: Place[] = draft.chapters.flatMap(chapter => [
        {chapterId: chapter.id, sectionId: null, label: `${chapter.phase}. ${title(chapter.title)}`, size: chapter.items.length},
        ...chapter.sections.map(section => ({
            chapterId: chapter.id, sectionId: section.id, label: `${chapter.phase} › ${title(section.title)}`, size: section.items.length,
        })),
    ]);
    const untranslated = (chapter: Chapter) => [chapter.title, ...chapter.sections.map(section => section.title),
        ...chapter.items.map(item => item.text), ...chapter.sections.flatMap(section => section.items.map(item => item.text))]
        .filter(text => !text.en).length;

    const itemRow = (item: GuideItemFieldsFragment, list: GuideItemFieldsFragment[], index: number, chapter: Chapter, section: Section | null) => (
        <li key={item.id} className="space-y-2 rounded-md border p-3" data-testid={`draft-item-${item.key}`}>
            <div className="flex flex-wrap items-center gap-2">
                {item.type !== "TEXT" ? <GuideTypeBadge type={item.type}/> : <Badge variant="secondary">{t("Guide.type.TEXT")}</Badge>}
                <NoEnglish text={item.text}/>
                <div className="ml-auto flex flex-wrap items-center gap-1">
                    <GuideItemDialog
                        trigger={<Button variant="ghost" size="icon-sm" aria-label={t("Guide.editor.editItem")} title={t("Guide.editor.editItem")}/>}
                        heading={t("Guide.editor.editItem")}
                        initial={{type: item.type, text: item.text}}
                        onSave={values => updateItemAction({id: item.id, version: item.version, ...values})}
                    >
                        <PencilLine/>
                    </GuideItemDialog>
                    <IconAction label={t("Guide.editor.moveUp")} disabled={pending || index === 0}
                                onClick={() => run(() => moveItemAction({id: item.id, version: item.version, chapterId: chapter.id, sectionId: section?.id ?? null, position: index - 1}))}>
                        <ArrowUp/>
                    </IconAction>
                    <IconAction label={t("Guide.editor.moveDown")} disabled={pending || index === list.length - 1}
                                onClick={() => run(() => moveItemAction({id: item.id, version: item.version, chapterId: chapter.id, sectionId: section?.id ?? null, position: index + 1}))}>
                        <ArrowDown/>
                    </IconAction>
                    <select
                        aria-label={t("Guide.editor.moveTo")}
                        className="h-8 max-w-48 rounded-md border border-input bg-background px-2 text-sm shadow-xs"
                        value=""
                        disabled={pending}
                        onChange={event => {
                            const target = places[Number(event.target.value)];

                            if (target) {
                                run(() => moveItemAction({id: item.id, version: item.version, chapterId: target.chapterId, sectionId: target.sectionId, position: target.size}));
                            }
                        }}
                    >
                        <option value="">{t("Guide.editor.moveTo")}</option>
                        {places.map((place, placeIndex) => (place.chapterId === chapter.id && place.sectionId === (section?.id ?? null))
                            ? null
                            : <option key={`${place.chapterId}-${place.sectionId}`} value={placeIndex}>{place.label}</option>)}
                    </select>
                    <ConfirmRemove label={t("Guide.editor.removeItem")} onConfirm={() => removeItemAction({id: item.id, version: item.version})}/>
                </div>
            </div>
            <GuideMarkdown>{item.text.sv}</GuideMarkdown>
        </li>
    );

    const addItem = (chapter: Chapter, section: Section | null) => (
        <GuideItemDialog
            trigger={<Button variant="outline" size="sm"/>}
            heading={t("Guide.editor.addItem")}
            onSave={values => createItemAction({chapterId: chapter.id, sectionId: section?.id ?? null, ...values})}
        >
            <Plus/>
            {t("Guide.editor.addItem")}
        </GuideItemDialog>
    );

    return (
        <div className="space-y-8">
            <section className="space-y-2 rounded-md border p-4">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold">{t("Guide.introduction")}</h3>
                    <NoEnglish text={draft.introduction}/>
                    <GuideIntroductionDialog
                        trigger={<Button variant="ghost" size="sm"/>}
                        versionId={draft.id} version={draft.version} initial={draft.introduction}
                    >
                        <PencilLine/>
                        {t("Guide.editor.editIntroduction")}
                    </GuideIntroductionDialog>
                </div>
                <GuideMarkdown>{draft.introduction.sv}</GuideMarkdown>
            </section>

            {draft.chapters.map(chapter => (
                <section key={chapter.id} id={`chapter-${chapter.phase}`} className="space-y-4" aria-label={`${chapter.phase}. ${title(chapter.title)}`}>
                    <div className="flex flex-wrap items-center gap-2 border-b pb-2">
                        <h3 className="text-base font-semibold">{chapter.phase}. {title(chapter.title)}</h3>
                        <NoEnglish text={chapter.title}/>
                        <span className="text-xs text-muted-foreground">{t("Guide.admin.untranslated", {count: untranslated(chapter)})}</span>
                        <div className="ml-auto flex flex-wrap gap-1">
                            <GuideTitleDialog
                                trigger={<Button variant="ghost" size="sm"/>}
                                heading={t("Guide.editor.renameChapter")}
                                initial={chapter.title}
                                onSave={value => updateChapterAction({id: chapter.id, version: chapter.version, title: value})}
                            >
                                <PencilLine/>
                                {t("Guide.editor.renameChapter")}
                            </GuideTitleDialog>
                            <GuideTitleDialog
                                trigger={<Button variant="outline" size="sm"/>}
                                heading={t("Guide.editor.addSection")}
                                onSave={value => createSectionAction({chapterId: chapter.id, title: value})}
                            >
                                <Plus/>
                                {t("Guide.editor.addSection")}
                            </GuideTitleDialog>
                        </div>
                    </div>
                    <ol className="space-y-2">{chapter.items.map((item, index) => itemRow(item, chapter.items, index, chapter, null))}</ol>
                    <div>{addItem(chapter, null)}</div>

                    {chapter.sections.map((section, sectionIndex) => (
                        <section key={section.id} className="space-y-2 rounded-md bg-muted/30 p-3" aria-label={title(section.title)}>
                            <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-medium">{title(section.title)}</h4>
                                <NoEnglish text={section.title}/>
                                <div className="ml-auto flex flex-wrap items-center gap-1">
                                    <GuideTitleDialog
                                        trigger={<Button variant="ghost" size="icon-sm" aria-label={t("Guide.editor.renameSection")} title={t("Guide.editor.renameSection")}/>}
                                        heading={t("Guide.editor.renameSection")}
                                        initial={section.title}
                                        onSave={value => updateSectionAction({id: section.id, version: section.version, title: value})}
                                    >
                                        <PencilLine/>
                                    </GuideTitleDialog>
                                    <IconAction label={t("Guide.editor.moveUp")} disabled={pending || sectionIndex === 0}
                                                onClick={() => run(() => moveSectionAction({id: section.id, version: section.version, chapterId: chapter.id, position: sectionIndex - 1}))}>
                                        <ArrowUp/>
                                    </IconAction>
                                    <IconAction label={t("Guide.editor.moveDown")} disabled={pending || sectionIndex === chapter.sections.length - 1}
                                                onClick={() => run(() => moveSectionAction({id: section.id, version: section.version, chapterId: chapter.id, position: sectionIndex + 1}))}>
                                        <ArrowDown/>
                                    </IconAction>
                                    <select
                                        aria-label={t("Guide.editor.moveSectionTo")}
                                        className="h-8 rounded-md border border-input bg-background px-2 text-sm shadow-xs"
                                        value=""
                                        disabled={pending}
                                        onChange={event => {
                                            const target = draft.chapters.find(candidate => candidate.id === event.target.value);

                                            if (target) {
                                                run(() => moveSectionAction({id: section.id, version: section.version, chapterId: target.id, position: target.sections.length}));
                                            }
                                        }}
                                    >
                                        <option value="">{t("Guide.editor.moveSectionTo")}</option>
                                        {draft.chapters.filter(candidate => candidate.id !== chapter.id).map(candidate => (
                                            <option key={candidate.id} value={candidate.id}>{candidate.phase}. {title(candidate.title)}</option>
                                        ))}
                                    </select>
                                    <ConfirmRemove label={t("Guide.editor.removeSection")} onConfirm={() => removeSectionAction({id: section.id, version: section.version})}/>
                                </div>
                            </div>
                            <ol className="space-y-2">{section.items.map((item, index) => itemRow(item, section.items, index, chapter, section))}</ol>
                            <div>{addItem(chapter, section)}</div>
                        </section>
                    ))}
                </section>
            ))}
        </div>
    );
}
