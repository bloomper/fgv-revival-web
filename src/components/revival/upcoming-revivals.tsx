import {useTranslations} from "next-intl";
import {CalendarDays, MapPin} from "lucide-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {formatDate} from "@/utils/format";

export type UpcomingRevival = {
    id: string;
    title: string;
    premiereDate: string;
    shows: { date: string; time?: string | null; venue?: string | null }[];
};

/**
 * The revivals coming up, as they are announced: the premiere and the shows, nothing about the people behind them.
 */
export function UpcomingRevivals({revivals}: { revivals: UpcomingRevival[] }) {
    const t = useTranslations("Home");

    return (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label={t("upcoming")}>
            {revivals.map(revival => {
                const venues = [...new Set(revival.shows.map(show => show.venue).filter(Boolean))];

                return (
                    <li key={revival.id}>
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>{revival.title}</CardTitle>
                                <CardDescription className="flex items-center gap-1">
                                    <CalendarDays className="size-4" aria-hidden/>
                                    {t("premiere", {date: formatDate(revival.premiereDate) ?? revival.premiereDate})}
                                </CardDescription>
                            </CardHeader>
                            {(revival.shows.length > 0 || venues.length > 0) && (
                                <CardContent className="space-y-1 text-sm text-muted-foreground">
                                    {revival.shows.length > 0 && <p>{t("shows", {count: revival.shows.length})}</p>}
                                    {venues.length > 0 && (
                                        <p className="flex items-center gap-1"><MapPin className="size-4" aria-hidden/>{venues.join(", ")}</p>
                                    )}
                                </CardContent>
                            )}
                        </Card>
                    </li>
                );
            })}
        </ul>
    );
}
