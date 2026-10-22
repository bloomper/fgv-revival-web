import Link from "next/link";
import {BookOpen, type LucideIcon, Theater} from "lucide-react";
import {getTranslations} from "next-intl/server";
import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
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

/**
 * The start page. It only points onwards for now; news, as in Spexregister, may come here later.
 */
export default async function HomePage() {
    return withPolicyPage(Policies.app.requireAccess, async () => {
        const t = await getTranslations();

        return (
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                <div className="space-y-1">
                    <h2 className="text-lg font-bold tracking-tight">{t("Home.welcome")}</h2>
                    <p className="text-muted-foreground">{t("Home.intro")}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Shortcut href="/revivals" icon={Theater} title={t("Nav.revivals")} text={t("Home.revivalsText")}/>
                    <Shortcut href="/guide" icon={BookOpen} title={t("Nav.guide")} text={t("Home.guideText")}/>
                </div>
            </div>
        );
    });
}
