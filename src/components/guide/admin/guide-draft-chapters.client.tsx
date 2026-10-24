"use client";

import {useState, useTransition} from "react";
import Link from "next/link";
import {useLocale, useTranslations} from "next-intl";
import {ArrowDown, ArrowUp, ChevronRight, PencilLine, Plus, Trash2} from "lucide-react";
import type {GuideChapterRemovalImpactQuery, GuideVersionFieldsFragment} from "@/gql/graphql";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
    chapterRemovalImpactAction,
    createChapterAction,
    moveChapterAction,
    removeChapterAction,
    updateChapterAction,
} from "@/app/(app)/admin/guide/draft/actions.server";
import {GuideTitleDialog} from "@/components/guide/admin/guide-title-dialog.client";
import {pickText} from "@/components/guide/localized";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import type {ActionResult} from "@/lib/graphql.server";

type Chapter = GuideVersionFieldsFragment["chapters"][number];
type Impact = GuideChapterRemovalImpactQuery["guideChapterRemovalImpact"];

const itemCount = (chapter: Chapter) => chapter.items.length + chapter.sections.reduce((sum, section) => sum + section.items.length, 0);

/**
 * Removing a chapter takes its sections and items out of the draft, and revivals lose their checklist for it when they
 * move to the version published from the draft. So the dialog says what goes, and asks for the chapter's title.
 */
function RemoveChapterDialog({chapter}: { chapter: Chapter }) {
    const t = useTranslations();
    const feedback = useActionFeedback();
    const [open, setOpen] = useState(false);
    const [typed, setTyped] = useState("");
    const [impact, setImpact] = useState<Impact | null>(null);
    const [pending, startTransition] = useTransition();
    const matches = typed.trim() === chapter.title.sv.trim();

    const change = (next: boolean) => {
        setOpen(next);
        setTyped("");
        setImpact(null);
        if (next) {
            startTransition(async () => {
                const result = await chapterRemovalImpactAction(chapter.key);

                setImpact(result.ok ? result.data : null);
            });
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={change}>
            <AlertDialogTrigger render={<Button variant="ghost" size="icon-sm"
                                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                aria-label={t("Guide.editor.removeChapter")}
                                                title={t("Guide.editor.removeChapter")}/>}>
                <Trash2/>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("Guide.editor.removeChapterTitle", {title: chapter.title.sv})}</AlertDialogTitle>
                    <AlertDialogDescription render={<div className="space-y-2"/>}>
                        <p>{t("Guide.editor.removeChapterContents", {
                            sections: chapter.sections.length,
                            items: itemCount(chapter)
                        })}</p>
                        <p className="font-medium text-destructive" data-testid="chapter-removal-impact">
                            {impact
                                ? impact.revivalCount > 0
                                    ? t("Guide.editor.removeChapterImpact", {
                                        revivals: impact.revivalCount,
                                        items: impact.itemCount,
                                        done: impact.doneCount
                                    })
                                    : t("Guide.editor.removeChapterNoImpact")
                                : t("Guide.editor.removeChapterCounting")}
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2">
                    <Label htmlFor={`remove-chapter-${chapter.key}`}>{t("Guide.editor.removeChapterType")}</Label>
                    <Input id={`remove-chapter-${chapter.key}`} value={typed}
                           onChange={event => setTyped(event.target.value)} autoComplete="off"/>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t("Common.cancel")}</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" disabled={pending || !matches}
                                       onClick={() => startTransition(async () => {
                                           feedback(await removeChapterAction({
                                               id: chapter.id,
                                               version: chapter.version
                                           }), t("Guide.editor.chapterRemoved"));
                                       })}>{t("Guide.editor.removeChapter")}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

/**
 * The draft's chapters in order: open one to edit it, or add, rename, reorder and remove them.
 */
export function GuideDraftChapters({draft}: { draft: GuideVersionFieldsFragment }) {
    const t = useTranslations();
    const locale = useLocale();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const run = (work: () => Promise<ActionResult<null>>) => startTransition(async () => {
        feedback(await work());
    });

    return (
        <section aria-labelledby="draft-chapters" className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <h3 id="draft-chapters" className="text-lg font-semibold">{t("Guide.chapters")}</h3>
                <GuideTitleDialog
                    trigger={<Button variant="outline" size="sm" className="ml-auto"/>}
                    heading={t("Guide.editor.addChapter")}
                    onSave={value => createChapterAction({versionId: draft.id, title: value})}
                >
                    <Plus/>
                    {t("Guide.editor.addChapter")}
                </GuideTitleDialog>
            </div>
            {draft.chapters.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("Guide.editor.noChapters")}</p>
            ) : (
                <ol className="divide-y overflow-hidden rounded-md border">
                    {draft.chapters.map((chapter, index) => (
                        <li key={chapter.id}
                            className="flex flex-wrap items-center gap-2 p-3 transition-colors has-[a:hover]:bg-accent/50"
                            data-testid={`draft-chapter-${chapter.key}`}>
                            <Link href={`/admin/guide/draft/${encodeURIComponent(chapter.key)}`}
                                  className="flex min-w-0 flex-1 items-center gap-3">
                                <span
                                    className="w-6 shrink-0 text-right font-medium tabular-nums text-muted-foreground">{index + 1}.</span>
                                <span className="min-w-0">
                                    <span className="block font-medium">{pickText(chapter.title, locale).text}</span>
                                    <span className="block text-xs text-muted-foreground">
                                        {t("Guide.chapterContents", {
                                            sections: chapter.sections.length,
                                            items: itemCount(chapter)
                                        })}
                                    </span>
                                </span>
                                <ChevronRight className="size-4 shrink-0 text-muted-foreground"/>
                            </Link>
                            {!chapter.title.en && <Badge variant="outline">{t("Guide.editor.noEnglish")}</Badge>}
                            <div className="flex items-center gap-1">
                                <GuideTitleDialog
                                    trigger={<Button variant="ghost" size="icon-sm"
                                                     aria-label={t("Guide.editor.renameChapter")}
                                                     title={t("Guide.editor.renameChapter")}/>}
                                    heading={t("Guide.editor.renameChapter")}
                                    initial={chapter.title}
                                    onSave={value => updateChapterAction({
                                        id: chapter.id,
                                        version: chapter.version,
                                        title: value
                                    })}
                                >
                                    <PencilLine/>
                                </GuideTitleDialog>
                                <Button type="button" variant="ghost" size="icon-sm"
                                        aria-label={t("Guide.editor.moveUp")} title={t("Guide.editor.moveUp")}
                                        disabled={pending || index === 0}
                                        onClick={() => run(() => moveChapterAction({
                                            id: chapter.id,
                                            version: chapter.version,
                                            position: index - 1
                                        }))}>
                                    <ArrowUp/>
                                </Button>
                                <Button type="button" variant="ghost" size="icon-sm"
                                        aria-label={t("Guide.editor.moveDown")} title={t("Guide.editor.moveDown")}
                                        disabled={pending || index === draft.chapters.length - 1}
                                        onClick={() => run(() => moveChapterAction({
                                            id: chapter.id,
                                            version: chapter.version,
                                            position: index + 1
                                        }))}>
                                    <ArrowDown/>
                                </Button>
                                <RemoveChapterDialog chapter={chapter}/>
                            </div>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}
