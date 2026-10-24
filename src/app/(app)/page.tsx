import Link from "next/link";
import {BookOpen, type LucideIcon, Theater, UserRound} from "lucide-react";
import {getTranslations} from "next-intl/server";
import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getGuideReadable} from "@/lib/guide/guide.server";
import {getMe} from "@/lib/revival/revival.server";
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

/**
 * The start page. It only points onwards for now; news, as in Spexregister, may come here later. Participants and
 * helpers get a shortcut straight to their own page in each revival (M6a).
 */
export default async function HomePage() {
    return withPolicyPage(Policies.app.requireAccess, async () => {
        const [t, me, guideReadable] = await Promise.all([getTranslations(), loadMe(), getGuideReadable()]);
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
                                  title={`${t("Home.participationTitle")}: ${revival.title}`} text={t("Home.participationText", {title: revival.title})}/>
                    ))}
                    <Shortcut href="/revivals" icon={Theater} title={t("Nav.revivals")} text={t("Home.revivalsText")}/>
                    {guideReadable && <Shortcut href="/guide" icon={BookOpen} title={t("Nav.guide")} text={t("Home.guideText")}/>}
                </div>
            </div>
        );
    });
}
