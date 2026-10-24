import Link from "next/link";
import {useLocale, useTranslations} from "next-intl";
import {ArrowLeft, ArrowRight} from "lucide-react";
import {pickText} from "@/components/guide/localized";
import type {NavChapter} from "@/components/guide/guide-chapter-nav.client";

/**
 * The previous and next chapter at the end of a chapter, the way through the guide on a phone.
 */
export function GuideChapterPager({chapters, current, basePath}: {
    chapters: NavChapter[];
    current: string;
    basePath: string
}) {
    const t = useTranslations("Guide");
    const locale = useLocale();
    const index = chapters.findIndex(chapter => chapter.key === current);
    const previous = index > 0 ? chapters[index - 1] : null;
    const next = index >= 0 && index < chapters.length - 1 ? chapters[index + 1] : null;
    const hrefOf = (key: string) => `${basePath}/${encodeURIComponent(key)}`;

    return (
        <nav aria-label={t("chapterPager")} className="grid gap-2 border-t pt-4 sm:grid-cols-2">
            {previous ? (
                <Link href={hrefOf(previous.key)}
                      className="flex items-center gap-2 rounded-md border p-3 text-sm hover:bg-accent">
                    <ArrowLeft className="size-4 shrink-0"/>
                    <span className="min-w-0">
                        <span className="block text-xs text-muted-foreground">{t("previousChapter")}</span>
                        <span className="block truncate">{index}. {pickText(previous.title, locale).text}</span>
                    </span>
                </Link>
            ) : <span className="hidden sm:block"/>}
            {next && (
                <Link href={hrefOf(next.key)}
                      className="flex items-center justify-end gap-2 rounded-md border p-3 text-right text-sm hover:bg-accent">
                    <span className="min-w-0">
                        <span className="block text-xs text-muted-foreground">{t("nextChapter")}</span>
                        <span className="block truncate">{index + 2}. {pickText(next.title, locale).text}</span>
                    </span>
                    <ArrowRight className="size-4 shrink-0"/>
                </Link>
            )}
        </nav>
    );
}
