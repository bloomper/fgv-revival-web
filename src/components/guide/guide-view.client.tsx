"use client";

import type {ReactNode} from "react";
import {useLocale, useTranslations} from "next-intl";
import type {GuideItemFieldsFragment, GuideVersionFieldsFragment} from "@/gql/graphql";
import {GuideItem} from "@/components/guide/guide-item";
import {GuideMarkdown} from "@/components/guide/guide-markdown";
import {pickText} from "@/components/guide/localized";

type Chapter = GuideVersionFieldsFragment["chapters"][number];
type Section = Chapter["sections"][number];

export type GuidePlace = { phase: Chapter["phase"]; sectionKey: string | null };

/**
 * One version of the guide: the introduction, then chapters A–J, each with its leading items and sections. The
 * chapter index stays in reach on phones too. {@code itemActions} and {@code placeActions} add controls, e.g. for
 * suggestions.
 */
export function GuideView({version, itemActions, placeActions}: {
    version: GuideVersionFieldsFragment;
    itemActions?: (item: GuideItemFieldsFragment, place: GuidePlace) => ReactNode;
    placeActions?: (place: GuidePlace) => ReactNode;
}) {
    const t = useTranslations("Guide");
    const locale = useLocale();
    const title = (text: Chapter["title"]) => pickText(text, locale).text;
    const introduction = pickText(version.introduction, locale);
    const notTranslated = (text: Chapter["title"]) => !pickText(text, locale).translated &&
        <span className="text-xs text-muted-foreground">{t("notTranslated")}</span>;

    const items = (list: GuideItemFieldsFragment[], place: GuidePlace) => list.map(item => (
        <GuideItem key={item.id} item={item} actions={itemActions?.(item, place)}/>
    ));

    return (
        <div className="flex flex-col gap-6 lg:flex-row">
            <nav aria-label={t("chapters")}
                 className="sticky top-(--header-height) z-10 -mx-4 overflow-x-auto border-b bg-background px-4 py-2 lg:top-24 lg:mx-0 lg:h-fit lg:w-56 lg:shrink-0 lg:border-b-0 lg:p-0">
                <ol className="flex gap-3 text-sm lg:flex-col lg:gap-1">
                    {version.chapters.map(chapter => (
                        <li key={chapter.id} className="shrink-0">
                            <a href={`#chapter-${chapter.phase}`} className="hover:underline">
                                <span className="font-medium">{chapter.phase}</span>
                                <span className="hidden lg:inline">. {title(chapter.title)}</span>
                            </a>
                        </li>
                    ))}
                </ol>
            </nav>
            <div className="min-w-0 flex-1 space-y-8">
                {introduction.text && (
                    <section aria-label={t("introduction")} className="space-y-2">
                        {notTranslated(version.introduction)}
                        <GuideMarkdown>{introduction.text}</GuideMarkdown>
                    </section>
                )}
                {version.chapters.map(chapter => (
                    <section key={chapter.id} id={`chapter-${chapter.phase}`} aria-labelledby={`chapter-${chapter.phase}-title`} className="scroll-mt-24 space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 id={`chapter-${chapter.phase}-title`} className="text-base font-semibold">{chapter.phase}. {title(chapter.title)}</h3>
                            {notTranslated(chapter.title)}
                            {placeActions?.({phase: chapter.phase, sectionKey: null})}
                        </div>
                        <div className="space-y-3">{items(chapter.items, {phase: chapter.phase, sectionKey: null})}</div>
                        {chapter.sections.map((section: Section) => (
                            <section key={section.id} id={`section-${section.key}`} aria-labelledby={`section-${section.key}-title`} className="scroll-mt-24 space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h4 id={`section-${section.key}-title`} className="text-lg font-medium">{title(section.title)}</h4>
                                    {notTranslated(section.title)}
                                    {placeActions?.({phase: chapter.phase, sectionKey: section.key})}
                                </div>
                                {items(section.items, {phase: chapter.phase, sectionKey: section.key})}
                            </section>
                        ))}
                    </section>
                ))}
            </div>
        </div>
    );
}
