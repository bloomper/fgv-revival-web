"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {useParams} from "next/navigation";
import {useLocale, useTranslations} from "next-intl";
import {ChevronDown} from "lucide-react";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet";
import {pickText} from "@/components/guide/localized";
import {cn} from "@/utils/utils";

type Text = { sv: string; en?: string | null };

export type NavChapter = { key: string; title: Text; sections: { key: string; title: Text }[] };

/**
 * The section of the chapter that is in view, by the {@code section-<key>} anchors {@link GuideChapterView} renders.
 * The list is in the layout, so it can change chapter before the chapter's page has arrived: until the anchors are
 * there, it waits for them.
 */
function useSectionInView(sectionKeys: string) {
    const [inView, setInView] = useState<string | null>(null);

    useEffect(() => {
        const keys = sectionKeys.split("|").filter(Boolean);
        const intersections = new IntersectionObserver(entries => {
            const visible = entries.filter(entry => entry.isIntersecting);

            if (visible.length > 0) {
                setInView(visible[0].target.id.slice("section-".length));
            }
        }, {rootMargin: "-15% 0px -70% 0px"});
        const observe = () => {
            const elements = keys.map(key => document.getElementById(`section-${key}`)).filter((element): element is HTMLElement => element !== null);

            elements.forEach(element => intersections.observe(element));
            return elements.length > 0;
        };
        const arrivals = new MutationObserver(() => {
            if (observe()) {
                arrivals.disconnect();
            }
        });

        if (keys.length > 0 && !observe()) {
            arrivals.observe(document.body, {childList: true, subtree: true});
        }
        return () => {
            arrivals.disconnect();
            intersections.disconnect();
        };
    }, [sectionKeys]);

    return inView;
}

function ChapterList({chapters, current, hrefOf, inView, onNavigate}: {
    chapters: NavChapter[];
    current: string;
    hrefOf: (key: string) => string;
    inView: string | null;
    onNavigate?: () => void;
}) {
    const locale = useLocale();

    return (
        <ol className="space-y-1 text-sm">
            {chapters.map((chapter, index) => {
                const active = chapter.key === current;

                return (
                    <li key={chapter.key}>
                        <Link href={hrefOf(chapter.key)} onClick={onNavigate} aria-current={active ? "page" : undefined}
                              className={cn("flex gap-2 rounded-md px-2 py-1.5 hover:bg-accent", active && "bg-accent font-medium")}>
                            <span
                                className="w-5 shrink-0 text-right tabular-nums text-muted-foreground">{index + 1}.</span>
                            <span>{pickText(chapter.title, locale).text}</span>
                        </Link>
                        {active && chapter.sections.length > 0 && (
                            <ol className="my-1 ml-7 space-y-0.5 border-l pl-2">
                                {chapter.sections.map(section => (
                                    <li key={section.key}>
                                        <a href={`#section-${section.key}`} onClick={onNavigate}
                                           className={cn("block rounded-md px-2 py-1 text-muted-foreground hover:bg-accent hover:text-foreground",
                                               inView === section.key && "text-foreground")}>
                                            {pickText(section.title, locale).text}
                                        </a>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </li>
                );
            })}
        </ol>
    );
}

/**
 * Finding the way between chapters. On phones, a bar that stays at the top with the current chapter, opening the
 * chapter list from the bottom of the screen; from {@code lg}, the list beside the text, with the current chapter's
 * sections and the one in view marked. It is in the chapters' layout, so it stays while a chapter loads, and takes the
 * current chapter from the URL.
 */
export function GuideChapterNav({chapters, basePath}: { chapters: NavChapter[]; basePath: string }) {
    const params = useParams<{ chapterKey?: string }>();
    const current = params.chapterKey ? decodeURIComponent(params.chapterKey) : "";
    const t = useTranslations("Guide");
    const locale = useLocale();
    const [open, setOpen] = useState(false);
    const index = chapters.findIndex(chapter => chapter.key === current);
    const chapter = chapters[index];
    const hrefOf = (key: string) => `${basePath}/${encodeURIComponent(key)}`;
    const inView = useSectionInView(chapter?.sections.map(section => section.key).join("|") ?? "");

    if (!chapter) {
        return null;
    }

    return (
        <>
            <div className="sticky top-(--header-height) z-10 -mx-4 border-b bg-background px-4 py-2 lg:hidden">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger render={<Button variant="outline" className="w-full justify-between"/>}>
                        <span className="truncate">
                            <span className="text-muted-foreground">{t("chapterOf", {
                                number: index + 1,
                                count: chapters.length
                            })} · </span>
                            {pickText(chapter.title, locale).text}
                        </span>
                        <ChevronDown/>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="max-h-[80dvh] gap-0 p-0">
                        <SheetHeader className="border-b p-4">
                            <SheetTitle>{t("chapters")}</SheetTitle>
                        </SheetHeader>
                        <ScrollArea className="min-h-0 flex-1">
                            <nav aria-label={t("chapters")} className="p-2 pb-6">
                                <ChapterList chapters={chapters} current={current} hrefOf={hrefOf} inView={inView}
                                             onNavigate={() => setOpen(false)}/>
                            </nav>
                        </ScrollArea>
                    </SheetContent>
                </Sheet>
            </div>
            <nav aria-label={t("chapters")}
                 className="sticky top-24 hidden h-fit max-h-[calc(100dvh-8rem)] w-64 shrink-0 overflow-y-auto lg:block">
                <ChapterList chapters={chapters} current={current} hrefOf={hrefOf} inView={inView}/>
            </nav>
        </>
    );
}
