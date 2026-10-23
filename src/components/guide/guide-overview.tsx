import Link from "next/link";
import {useLocale, useTranslations} from "next-intl";
import {ChevronRight} from "lucide-react";
import type {GuideVersionFieldsFragment} from "@/gql/graphql";
import {GuideMarkdown} from "@/components/guide/guide-markdown";
import {pickText} from "@/components/guide/localized";

/**
 * A version's start page: the introduction, then the chapters to open one at a time, with what is in each.
 */
export function GuideOverview({version, basePath}: { version: GuideVersionFieldsFragment; basePath: string }) {
    const t = useTranslations("Guide");
    const locale = useLocale();
    const introduction = pickText(version.introduction, locale);

    return (
        <div className="space-y-6">
            {introduction.text && (
                <section aria-label={t("introduction")} className="space-y-2">
                    {!introduction.translated && <span className="text-xs text-muted-foreground">{t("notTranslated")}</span>}
                    <GuideMarkdown>{introduction.text}</GuideMarkdown>
                </section>
            )}
            <section aria-labelledby="guide-chapters" className="space-y-2">
                <h3 id="guide-chapters" className="font-medium">{t("chapters")}</h3>
                {version.chapters.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("noChapters")}</p>
                ) : (
                    <ol className="grid gap-2 md:grid-cols-2">
                        {version.chapters.map((chapter, index) => {
                            const items = chapter.items.length + chapter.sections.reduce((sum, section) => sum + section.items.length, 0);

                            return (
                                <li key={chapter.id}>
                                    <Link href={`${basePath}/${encodeURIComponent(chapter.key)}`}
                                          className="flex h-full items-center gap-3 rounded-md border p-3 hover:bg-accent">
                                        <span className="w-6 shrink-0 text-right font-medium tabular-nums text-muted-foreground">{index + 1}.</span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block font-medium">{pickText(chapter.title, locale).text}</span>
                                            <span className="block text-xs text-muted-foreground">
                                                {t("chapterContents", {sections: chapter.sections.length, items})}
                                            </span>
                                        </span>
                                        <ChevronRight className="size-4 shrink-0 text-muted-foreground"/>
                                    </Link>
                                </li>
                            );
                        })}
                    </ol>
                )}
            </section>
        </div>
    );
}
