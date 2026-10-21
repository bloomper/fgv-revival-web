"use client";

import Link from "next/link";
import {useLocale, useTranslations} from "next-intl";
import type {RevivalRole, RevivalSummaryFragment} from "@/gql/graphql";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {StatusBadge} from "@/components/revival/status-badge";
import {SpexTitle} from "@/components/revival/spex-title";
import {formatDate} from "@/utils/format";

export function RevivalCard({revival, role}: { revival: RevivalSummaryFragment; role: RevivalRole | null }) {
    const t = useTranslations();
    const locale = useLocale();

    return (
        <Link href={`/revivals/${revival.id}`} className="block rounded-xl focus-visible:outline-2 focus-visible:outline-ring">
            <Card className="h-full transition-colors hover:bg-accent/40">
                <CardHeader>
                    <CardTitle>{revival.workingTitle}</CardTitle>
                    <CardDescription><SpexTitle spex={revival.spex}/> · {revival.year}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-2 text-sm">
                    <StatusBadge status={revival.status}/>
                    {role && <Badge variant="outline">{t(`Role.${role}`)}</Badge>}
                    <span className="text-muted-foreground">
                        {t("Revival.premiereDate")}: {formatDate(revival.premiereDate, locale) ?? t("Revival.notSet")}
                    </span>
                </CardContent>
            </Card>
        </Link>
    );
}
