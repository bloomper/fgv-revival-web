import Link from "next/link";
import {useLocale, useTranslations} from "next-intl";
import {Badge} from "@/components/ui/badge";
import {buttonVariants} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {pickText} from "@/components/guide/localized";

type Summary = {
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

function Counts({summary}: { summary: Summary }) {
    const t = useTranslations("Checklist");

    return (
        <p className="text-sm text-muted-foreground">
            {t("counts", {open: summary.openCount, total: summary.totalCount})}
            {summary.overdueCount > 0 && <span className="text-destructive"> · {t("overdueCount", {count: summary.overdueCount})}</span>}
        </p>
    );
}

/**
 * One checklist per chapter of the pinned guide version, in the guide's order, then the event checklists, cancelled
 * ones when asked for (M3 FR-022, FR-023).
 */
export function ChecklistOverview({revivalId, checklists, showCancelled}: { revivalId: string; checklists: Summary[]; showCancelled: boolean }) {
    const t = useTranslations("Checklist");
    const locale = useLocale();
    const chapters = checklists.filter(checklist => checklist.kind === "CHAPTER");
    const events = checklists.filter(checklist => checklist.kind === "EVENT");

    return (
        <div className="space-y-6">
            <section className="space-y-2" aria-label={t("chapters")}>
                <h3 className="font-medium">{t("chapters")}</h3>
                {chapters.length === 0 ? <p className="text-sm text-muted-foreground">{t("noChapters")}</p> : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {chapters.map((chapter, index) => (
                            <Link key={chapter.id} href={`/revivals/${revivalId}/checklists/${chapter.id}`}>
                                <Card className="h-full hover:bg-accent">
                                    <CardHeader>
                                        <CardTitle>{index + 1}. {chapter.chapterTitle ? pickText(chapter.chapterTitle, locale).text : chapter.chapterKey}</CardTitle>
                                    </CardHeader>
                                    <CardContent><Counts summary={chapter}/></CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
            <section className="space-y-2" aria-label={t("events")}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-medium">{t("events")}</h3>
                    <Link href={`/revivals/${revivalId}/checklists${showCancelled ? "" : "?cancelled=1"}`} aria-pressed={showCancelled} className={buttonVariants({variant: "outline", size: "sm"})}>
                        {showCancelled ? t("hideCancelled") : t("showCancelled")}
                    </Link>
                </div>
                {events.length === 0 ? <p className="text-sm text-muted-foreground">{t("noEvents")}</p> : (
                    <ul className="divide-y rounded-lg border">
                        {events.map(event => (
                            <li key={event.id}>
                                <Link href={`/revivals/${revivalId}/checklists/${event.id}`} className="flex flex-wrap items-center justify-between gap-2 p-3 hover:bg-accent">
                                    <span>
                                        {event.name} {event.date && <span className="text-muted-foreground">{event.date}</span>}
                                        {event.cancelled && <Badge variant="outline" className="ml-2">{t("cancelled")}</Badge>}
                                    </span>
                                    <Counts summary={event}/>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
