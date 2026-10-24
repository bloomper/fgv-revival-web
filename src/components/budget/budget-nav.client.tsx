"use client";

import Link from "next/link";
import {useSelectedLayoutSegment} from "next/navigation";
import {useTranslations} from "next-intl";
import {ArrowLeftRight, Calculator, LayoutDashboard, List, type LucideIcon} from "lucide-react";
import {cn} from "@/utils/utils";

const VIEWS: { segment: string | null; key: string; icon: LucideIcon }[] = [
    {segment: null, key: "overview", icon: LayoutDashboard},
    {segment: "lines", key: "lines", icon: List},
    {segment: "transactions", key: "transactions", icon: ArrowLeftRight},
    {segment: "scenarios", key: "scenarios", icon: Calculator},
];

/**
 * The budget's parts as links styled as a segmented control, each its own route, as the events' views are.
 */
export function BudgetNav({revivalId}: { revivalId: string }) {
    const t = useTranslations("Budget");
    const segment = useSelectedLayoutSegment();
    const base = `/revivals/${revivalId}/budget`;

    return (
        <nav aria-label={t("views")} className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-lg bg-muted p-1">
            {VIEWS.map(view => {
                const active = view.segment === segment;

                return (
                    <Link key={view.key} href={view.segment ? `${base}/${view.segment}` : base}
                          aria-current={active ? "page" : undefined}
                          className={cn("inline-flex items-center gap-2 rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap [&_svg]:size-4",
                              active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                        <view.icon/>
                        {t(view.key)}
                    </Link>
                );
            })}
        </nav>
    );
}
