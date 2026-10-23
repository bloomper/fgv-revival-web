"use client";

import * as React from "react";
import {useId, useOptimistic, useTransition} from "react";
import Link from "next/link";
import {useParams, usePathname, useRouter, useSearchParams} from "next/navigation";
import {useLocale, useTranslations} from "next-intl";
import {Badge} from "@/components/ui/badge";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {pickText} from "@/components/guide/localized";
import {EventChecklistDialog, type EventTemplate} from "@/components/checklist/event-checklist-dialog.client";
import {CHECKLIST_FILTERS, checklistFilterQuery, parseChecklistFilter} from "@/lib/checklist/schema";
import {formatDate} from "@/utils/format";
import {cn} from "@/utils/utils";

export type ChecklistSummary = {
    id: string;
    kind: "CHAPTER" | "EVENT";
    chapterKey?: string | null;
    chapterTitle?: { sv: string; en?: string | null } | null;
    name?: string | null;
    date?: string | null;
    cancelled: boolean;
    openCount: number;
    overdueCount: number;
    totalCount: number;
};

const row = "flex w-full items-baseline gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent";

function Counts({summary}: { summary: ChecklistSummary }) {
    const t = useTranslations("Checklist");

    return (
        <span className="ml-auto flex shrink-0 items-baseline gap-1.5 text-xs tabular-nums">
            {summary.overdueCount > 0 && <span className="text-destructive">{t("overdueCount", {count: summary.overdueCount})}</span>}
            <span className="text-muted-foreground">{t("counts", {open: summary.openCount, total: summary.totalCount})}</span>
        </span>
    );
}

/**
 * Shows or hides cancelled event checklists; the choice lives in the URL ({@code ?cancelled=1}), as the filters do.
 */
function ShowCancelledSwitch({shown}: { shown: boolean }) {
    const t = useTranslations("Checklist");
    const id = useId();
    const router = useRouter();
    const pathname = usePathname();
    const [, startTransition] = useTransition();
    const [checked, setChecked] = useOptimistic(shown);

    return (
        <div className="flex items-center gap-2 px-2">
            <Switch id={id} checked={checked} onCheckedChange={next => startTransition(() => {
                setChecked(next);
                router.push(next ? `${pathname}?cancelled=1` : pathname);
            })}/>
            <Label htmlFor={id} className="text-xs font-normal text-muted-foreground">{t("showCancelled")}</Label>
        </div>
    );
}

/**
 * A revival's checklists beside the one open, as the checklist templates are under Administration: one per chapter
 * of the pinned guide version, numbered in the guide's order, then the event checklists, and the filters that find
 * items across all of them (M3 FR-022, FR-023, FR-028). It lives in the layout, so it stays put while a checklist
 * loads. Cancelled event checklists only with {@code ?cancelled=1}. On the list page it is the whole page on phones;
 * beside a checklist, only from {@code lg}.
 */
export function ChecklistNav({revivalId, checklists, templates, canWrite}: {
    revivalId: string;
    checklists: ChecklistSummary[];
    templates: EventTemplate[];
    canWrite: boolean;
}) {
    const t = useTranslations("Checklist");
    const locale = useLocale();
    const current = useParams<{ checklistId?: string }>().checklistId;
    const searchParams = useSearchParams();
    const showCancelled = searchParams.get("cancelled") === "1";
    const filter = current ? null : parseChecklistFilter(Object.fromEntries(searchParams));
    const base = `/revivals/${revivalId}/checklists`;
    const query = showCancelled ? "?cancelled=1" : "";
    const chapters = checklists.filter(checklist => checklist.kind === "CHAPTER");
    const events = checklists.filter(checklist => checklist.kind === "EVENT" && (showCancelled || !checklist.cancelled));
    const link = (checklist: ChecklistSummary, children: React.ReactNode) => (
        <Link href={`${base}/${checklist.id}${query}`} aria-current={checklist.id === current ? "page" : undefined}
              className={cn(row, checklist.id === current && "bg-accent font-medium", checklist.cancelled && "text-muted-foreground")}>
            {children}
        </Link>
    );

    return (
        <nav aria-label={t("title")}
             className={cn("space-y-6 lg:sticky lg:top-24 lg:h-fit lg:max-h-[calc(100dvh-8rem)] lg:w-80 lg:shrink-0 lg:overflow-y-auto",
                 current && "hidden lg:block")}>
            <section className="space-y-1" aria-label={t("find")}>
                <h4 className="px-2 text-sm font-medium text-muted-foreground">{t("find")}</h4>
                <div className="flex flex-wrap gap-1 px-2" role="group" aria-label={t("filter.label")}>
                    {CHECKLIST_FILTERS.map(key => (
                        <Link key={key} href={`${base}${checklistFilterQuery(filter, key)}`} aria-pressed={!!filter?.[key]}
                              className={cn("rounded-full border px-2.5 py-0.5 text-xs hover:bg-accent",
                                  filter?.[key] && "border-primary bg-primary text-primary-foreground hover:bg-primary/90")}>
                            {t(`filter.${key}`)}
                        </Link>
                    ))}
                </div>
            </section>
            <section className="space-y-1" aria-label={t("chapters")}>
                <h4 className="px-2 text-sm font-medium text-muted-foreground">{t("chapters")}</h4>
                {chapters.length === 0 && <p className="px-2 text-sm text-muted-foreground">{t("noChapters")}</p>}
                <ol>
                    {chapters.map((chapter, index) => (
                        <li key={chapter.id}>
                            {link(chapter, (
                                <>
                                    <span className="w-5 shrink-0 text-right tabular-nums text-muted-foreground">{index + 1}.</span>{" "}
                                    <span className="min-w-0">{chapter.chapterTitle ? pickText(chapter.chapterTitle, locale).text : chapter.chapterKey}</span>
                                    {" "}<Counts summary={chapter}/>
                                </>
                            ))}
                        </li>
                    ))}
                </ol>
            </section>
            <section className="space-y-1" aria-label={t("events")}>
                <div className="flex items-center justify-between gap-2 px-2">
                    <h4 className="text-sm font-medium text-muted-foreground">{t("events")}</h4>
                    {canWrite && <EventChecklistDialog revivalId={revivalId} templates={templates} compact/>}
                </div>
                {events.length === 0 ? (
                    <p className="px-2 text-sm text-muted-foreground">{t("noEvents")}</p>
                ) : (
                    <ul>
                        {events.map(event => (
                            <li key={event.id}>
                                {link(event, (
                                    <>
                                        <span className="min-w-0">
                                            {event.name}
                                            {event.date && <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">{formatDate(event.date)}</span>}
                                        </span>
                                        {event.cancelled && <Badge variant="outline">{t("cancelled")}</Badge>}
                                        {" "}<Counts summary={event}/>
                                    </>
                                ))}
                            </li>
                        ))}
                    </ul>
                )}
                {checklists.some(checklist => checklist.cancelled) && <ShowCancelledSwitch shown={showCancelled}/>}
            </section>
        </nav>
    );
}
