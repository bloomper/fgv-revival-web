"use client";

import {useLocale, useTranslations} from "next-intl";
import type {GuideChangesQuery} from "@/gql/graphql";
import {Badge} from "@/components/ui/badge";
import {GuideMarkdown} from "@/components/guide/guide-markdown";
import {GuideTypeBadge} from "@/components/guide/guide-type-badge";
import {pickText} from "@/components/guide/localized";

type Changes = GuideChangesQuery["guideChanges"];
type Text = { sv: string; en?: string | null };

/**
 * The chapters the changes touch, in the order they first appear, with a title from whichever version has one.
 */
function chaptersOf(changes: Changes): { key: string; title: Text | null }[] {
    const chapters = new Map<string, Text | null>();
    const add = (key: string | undefined, title: Text | null | undefined) => {
        if (key && (!chapters.has(key) || (!chapters.get(key) && title))) {
            chapters.set(key, title ?? null);
        }
    };

    changes.chapters.forEach(change => add(change.key, change.after ?? change.before));
    changes.sections.forEach(change => add((change.chapterAfter ?? change.chapterBefore)?.key, (change.chapterAfter ?? change.chapterBefore)?.title));
    changes.items.forEach(change => add((change.after ?? change.before)?.chapter.key, (change.after ?? change.before)?.chapter.title));
    return [...chapters].map(([key, title]) => ({key, title}));
}

/**
 * What changed between two versions, grouped by chapter.
 */
export function GuideChanges({changes}: { changes: Changes }) {
    const t = useTranslations("Guide.changes");
    const locale = useLocale();
    const text = (value: {
        sv: string;
        en?: string | null
    } | null | undefined) => value ? pickText(value, locale).text : "";
    const empty = changes.introductionChanged.length === 0 && changes.chapters.length === 0 && changes.sections.length === 0 && changes.items.length === 0;

    if (empty) {
        return <p className="text-sm text-muted-foreground">{t("none")}</p>;
    }

    return (
        <div className="space-y-6">
            {changes.introductionChanged.length > 0 && (
                <p className="text-sm"><Badge variant="secondary">{t("introduction")}</Badge></p>
            )}
            {chaptersOf(changes).map(({key, title}) => {
                const chapter = changes.chapters.find(change => change.key === key);
                const sections = changes.sections.filter(change => (change.chapterAfter ?? change.chapterBefore)?.key === key);
                const items = changes.items.filter(change => (change.after ?? change.before)?.chapter.key === key);

                return (
                    <section key={key} className="space-y-3" aria-label={t("chapter", {title: text(title)})}>
                        <h3 className="text-lg font-semibold">{t("chapter", {title: text(title)})}</h3>
                        {chapter && (
                            <div className="flex flex-wrap items-center gap-2 text-sm"
                                 data-testid={`chapter-change-${key}`}>
                                <Badge
                                    variant={chapter.kind === "REMOVED" ? "destructive" : chapter.kind === "ADDED" ? "default" : "secondary"}>
                                    {t(`chapterKind.${chapter.kind}`)}
                                </Badge>
                                {chapter.renamed.length > 0 && (
                                    <span><span
                                        className="line-through">{text(chapter.before)}</span> → {text(chapter.after)}</span>
                                )}
                                {chapter.moved && <Badge variant="outline">{t("moved")}</Badge>}
                                {chapter.kind === "REMOVED" &&
                                    <span className="text-destructive">{t("chapterRemovedChecklists")}</span>}
                            </div>
                        )}
                        {sections.map(change => (
                            <p key={change.key} className="flex flex-wrap items-center gap-2 text-sm">
                                <Badge
                                    variant={change.kind === "REMOVED" ? "destructive" : change.kind === "ADDED" ? "default" : "secondary"}>
                                    {t(`kind.${change.kind}`)}
                                </Badge>
                                <span>{t("section")} {text(change.after ?? change.before)}</span>
                                {change.renamed.length > 0 && <Badge variant="outline">{t("renamed")}</Badge>}
                                {change.moved && <Badge variant="outline">{t("moved")}</Badge>}
                                {change.reordered && <Badge variant="outline">{t("reordered")}</Badge>}
                            </p>
                        ))}
                        <ul className="space-y-2">
                            {items.map(change => (
                                <li key={change.key} className="space-y-2 rounded-md border p-3"
                                    data-testid={`change-${change.key}`}>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge
                                            variant={change.kind === "REMOVED" ? "destructive" : change.kind === "ADDED" ? "default" : "secondary"}>
                                            {t(`kind.${change.kind}`)}
                                        </Badge>
                                        {(change.after ?? change.before) &&
                                            <GuideTypeBadge type={(change.after ?? change.before)!.type}/>}
                                        {change.reworded.map(language => <Badge key={language}
                                                                                variant="outline">{t("reworded", {language})}</Badge>)}
                                        {change.retyped && <Badge variant="outline">{t("retyped")}</Badge>}
                                        {change.moved && <Badge variant="outline">{t("moved")}</Badge>}
                                    </div>
                                    {change.before && change.after && change.reworded.length > 0 ? (
                                        <div className="grid gap-2 md:grid-cols-2">
                                            <div className="rounded bg-muted/50 p-2 text-sm">
                                                <GuideMarkdown>{text(change.before.text)}</GuideMarkdown></div>
                                            <div className="rounded bg-muted/50 p-2 text-sm">
                                                <GuideMarkdown>{text(change.after.text)}</GuideMarkdown></div>
                                        </div>
                                    ) : (
                                        <div className="text-sm">
                                            <GuideMarkdown>{text((change.after ?? change.before)?.text)}</GuideMarkdown>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </section>
                );
            })}
        </div>
    );
}
