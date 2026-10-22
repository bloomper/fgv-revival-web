import Link from "next/link";
import {useTranslations} from "next-intl";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

type Summary = {
    id: string;
    kind: "PHASE" | "EVENT";
    phase?: string | null;
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
 * The ten phase checklists A–J side by side, then the event checklists, cancelled ones when asked for (M3 FR-022,
 * FR-023).
 */
export function ChecklistOverview({revivalId, checklists, showCancelled}: { revivalId: string; checklists: Summary[]; showCancelled: boolean }) {
    const t = useTranslations("Checklist");
    const phases = checklists.filter(checklist => checklist.kind === "PHASE");
    const events = checklists.filter(checklist => checklist.kind === "EVENT");

    return (
        <div className="space-y-6">
            <section className="space-y-2" aria-label={t("phases")}>
                <h3 className="font-medium">{t("phases")}</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {phases.map(phase => (
                        <Link key={phase.id} href={`/revivals/${revivalId}/checklists/${phase.id}`}>
                            <Card className="h-full hover:bg-accent">
                                <CardHeader><CardTitle>{t("phase", {phase: phase.phase ?? ""})}</CardTitle></CardHeader>
                                <CardContent><Counts summary={phase}/></CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>
            <section className="space-y-2" aria-label={t("events")}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-medium">{t("events")}</h3>
                    <Button variant="outline" size="sm" aria-pressed={showCancelled}
                            render={<Link href={`/revivals/${revivalId}/checklists${showCancelled ? "" : "?cancelled=1"}`}/>}>
                        {showCancelled ? t("hideCancelled") : t("showCancelled")}
                    </Button>
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
