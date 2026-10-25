import Link from "next/link";
import {BookOpen, type LucideIcon, Theater, UserRound} from "lucide-react";
import {getTranslations} from "next-intl/server";
import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getGuideReadable} from "@/lib/guide/guide.server";
import {getPublishedNews} from "@/lib/news/news.server";
import {getMe, getUpcomingRevivals} from "@/lib/revival/revival.server";
import {UpcomingRevivals} from "@/components/revival/upcoming-revivals";
import {NewsList} from "@/components/news/news-list.client";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

function Shortcut({href, icon: Icon, title, text}: { href: string; icon: LucideIcon; title: string; text: string }) {
    return (
        <Link href={href} className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Card className="h-full transition-colors hover:bg-accent">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Icon className="size-5"/>{title}</CardTitle>
                    <CardDescription>{text}</CardDescription>
                </CardHeader>
            </Card>
        </Link>
    );
}

// The shortcuts to the participant's own pages are a convenience: without the server the page still points onwards
async function loadMe() {
    try {
        return await getMe();
    } catch (error) {
        if (error instanceof GraphQLRequestError) {
            return null;
        }
        throw error;
    }
}

// The news is a convenience too: without it the page still points onwards
async function loadNews() {
    try {
        return await getPublishedNews(NEWS_SHOWN);
    } catch (error) {
        if (error instanceof GraphQLRequestError) {
            return [];
        }
        throw error;
    }
}

const NEWS_SHOWN = 6;

// Spexregister names the revivals; without it, or the server, the section is left out
async function loadUpcoming() {
    try {
        return await getUpcomingRevivals();
    } catch (error) {
        if (error instanceof GraphQLRequestError) {
            return [];
        }
        throw error;
    }
}

/**
 * The start page: shortcuts onwards, the revivals coming up, and the latest published news, as in Spexregister. Participants and
 * helpers get a shortcut straight to their own page in each revival.
 */
export default async function HomePage() {
    return withPolicyPage(Policies.app.requireAccess, async () => {
        const [t, me, guideReadable, news, upcoming] = await Promise.all([getTranslations(), loadMe(), getGuideReadable(), loadNews(), loadUpcoming()]);
        const participations = (me?.revivalRoles ?? []).filter(assignment => assignment.role === "PARTICIPANT" || assignment.role === "HELPER");

        return (
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                <div className="space-y-1">
                    <h2 className="text-lg font-bold tracking-tight">{t("Home.welcome")}</h2>
                    <p className="text-muted-foreground">{t("Home.intro")}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    {participations.map(({revival}) => (
                        <Shortcut key={revival.id} href={`/revivals/${revival.id}/me`} icon={UserRound}
                                  title={`${t("Home.participationTitle")}: ${revival.title}`}
                                  text={t("Home.participationText", {title: revival.title})}/>
                    ))}
                    <Shortcut href="/revivals" icon={Theater} title={t("Nav.revivals")} text={t("Home.revivalsText")}/>
                    {guideReadable &&
                        <Shortcut href="/guide" icon={BookOpen} title={t("Nav.guide")} text={t("Home.guideText")}/>}
                </div>
                {upcoming.length > 0 && (
                    <section className="space-y-3" aria-labelledby="home-upcoming">
                        <h2 id="home-upcoming" className="text-lg font-bold tracking-tight">{t("Home.upcoming")}</h2>
                        <UpcomingRevivals revivals={upcoming}/>
                    </section>
                )}
                <section className="space-y-3" aria-labelledby="home-news">
                    <h2 id="home-news" className="text-lg font-bold tracking-tight">{t("News.latest")}</h2>
                    {news.length > 0
                        ? <NewsList news={news}/>
                        : <p className="text-sm text-muted-foreground">{t("News.none")}</p>}
                </section>
            </div>
        );
    });
}
