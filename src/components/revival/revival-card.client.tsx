"use client";

import Link from "next/link";
import {useLocale, useTranslations} from "next-intl";
import {CalendarDays, Users} from "lucide-react";
import type {RevivalRole, RevivalSummaryFragment} from "@/gql/graphql";
import {Card, CardAction, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {StatusBadge} from "@/components/revival/status-badge";
import {SpexTitle} from "@/components/revival/spex-title";
import {formatDate} from "@/utils/format";

export function RevivalCard({revival, role}: { revival: RevivalSummaryFragment; role: RevivalRole | null }) {
    const t = useTranslations();
    const locale = useLocale();
    const premiere = formatDate(revival.premiereDate, locale);
    const members = revival.members.filter(member => member.state === "ACTIVE").length;
    const originalYear = revival.spex.year ? ` (${revival.spex.year})` : "";

    return (
        <Link href={`/revivals/${revival.id}`} className="block rounded-xl focus-visible:outline-2 focus-visible:outline-ring">
            <Card className="h-full transition-colors hover:bg-accent/40">
                <CardHeader>
                    <div className="text-2xl font-bold leading-none tabular-nums" aria-hidden>{revival.year}</div>
                    <CardTitle className="text-base">
                        <span aria-hidden><SpexTitle spex={revival.spex}/>{originalYear}</span>
                        <span className="sr-only">{revival.title}</span>
                    </CardTitle>
                    <CardAction><StatusBadge status={revival.status}/></CardAction>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="size-4 text-muted-foreground" aria-hidden/>
                        <span className="text-muted-foreground">{t("Revival.premiereDate")}</span>
                        {premiere
                            ? <span className="font-semibold">{premiere}</span>
                            : <span className="text-muted-foreground">{t("Revival.notSet")}</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                        <Users className="size-4" aria-hidden/>
                        <span>{t("Revival.memberCount", {count: members})}</span>
                        {role && <Badge variant="outline">{t(`Role.${role}`)}</Badge>}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
