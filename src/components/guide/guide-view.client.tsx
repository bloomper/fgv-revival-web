"use client";

import type {ReactNode} from "react";
import {useLocale, useTranslations} from "next-intl";
import type {GuideItemFieldsFragment, GuideVersionFieldsFragment} from "@/gql/graphql";
import {GuideItem} from "@/components/guide/guide-item";
import {pickText} from "@/components/guide/localized";

type Chapter = GuideVersionFieldsFragment["chapters"][number];
type Section = Chapter["sections"][number];

export type GuidePlace = { chapterKey: string; sectionKey: string | null };

/**
 * One chapter of the guide: its title, its leading items and its sections. Chapters are numbered by their place in the
 * version. {@code itemActions} and {@code placeActions} add controls, e.g. for suggestions.
 */
export function GuideChapterView({chapter, number, itemActions, placeActions}: {
    chapter: Chapter;
    number: number;
    itemActions?: (item: GuideItemFieldsFragment, place: GuidePlace) => ReactNode;
    placeActions?: (place: GuidePlace) => ReactNode;
}) {
    const t = useTranslations("Guide");
    const locale = useLocale();
    const title = (text: Chapter["title"]) => pickText(text, locale).text;
    const notTranslated = (text: Chapter["title"]) => !pickText(text, locale).translated &&
        <span className="text-xs text-muted-foreground">{t("notTranslated")}</span>;

    const items = (list: GuideItemFieldsFragment[], place: GuidePlace) => list.map(item => (
        <GuideItem key={item.id} item={item} actions={itemActions?.(item, place)}/>
    ));

    return (
        <section aria-labelledby="chapter-title" className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
                <h3 id="chapter-title" className="text-lg font-semibold tracking-tight">{number}. {title(chapter.title)}</h3>
                {notTranslated(chapter.title)}
                {placeActions?.({chapterKey: chapter.key, sectionKey: null})}
            </div>
            {chapter.items.length > 0 && <div className="space-y-3">{items(chapter.items, {chapterKey: chapter.key, sectionKey: null})}</div>}
            {chapter.sections.map((section: Section) => (
                <section key={section.id} id={`section-${section.key}`} aria-labelledby={`section-${section.key}-title`}
                         className="scroll-mt-32 space-y-3 lg:scroll-mt-24">
                    <div className="flex flex-wrap items-center gap-2">
                        <h4 id={`section-${section.key}-title`} className="text-base font-semibold">{title(section.title)}</h4>
                        {notTranslated(section.title)}
                        {placeActions?.({chapterKey: chapter.key, sectionKey: section.key})}
                    </div>
                    {items(section.items, {chapterKey: chapter.key, sectionKey: section.key})}
                </section>
            ))}
        </section>
    );
}
