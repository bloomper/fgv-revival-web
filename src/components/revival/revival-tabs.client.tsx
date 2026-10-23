"use client";

import type {ReactNode} from "react";
import Link from "next/link";
import {useSelectedLayoutSegment} from "next/navigation";
import {BookOpen, CalendarCheck, ClipboardCheck, LayoutDashboard, ListChecks, type LucideIcon, Users} from "lucide-react";
import {useTranslations} from "next-intl";
import {Badge} from "@/components/ui/badge";
import {cn} from "@/utils/utils";

export interface RevivalWork {
    openEntries: number;
    overdueEntries: number;
    openRequiredItems: number;
    overdueChecklistItems: number;
}

function WorkCount({open, overdue, label}: { open: number; overdue: number; label: string }) {
    return (
        <span className="flex items-center gap-1" title={label}>
            <span className="sr-only">{label}</span>
            <Badge variant="secondary" aria-hidden>{open}</Badge>
            {overdue > 0 && <Badge variant="destructive" aria-hidden>{overdue}</Badge>}
        </span>
    );
}

interface Tab {
    segment: string | null;
    title: string;
    icon: LucideIcon;
    count?: ReactNode;
}

/**
 * The sections of a revival as links styled as tabs, one per route, so each section keeps its own URL. The active tab
 * follows the first segment below the revival, which also keeps it lit on a meeting or a checklist.
 */
export function RevivalTabs({revivalId, work}: {
    revivalId: string;
    work: RevivalWork | null;
}) {
    const t = useTranslations("Revival");
    const segment = useSelectedLayoutSegment();

    const tabs: Tab[] = [
        {segment: null, title: t("overview"), icon: LayoutDashboard},
        {
            segment: "log", title: t("log"), icon: ListChecks,
            count: work && <WorkCount open={work.openEntries} overdue={work.overdueEntries}
                                      label={t("openOverdue", {open: work.openEntries, overdue: work.overdueEntries})}/>,
        },
        {segment: "meetings", title: t("meetings"), icon: CalendarCheck},
        {
            segment: "checklists", title: t("checklists"), icon: ClipboardCheck,
            count: work && <WorkCount open={work.openRequiredItems} overdue={work.overdueChecklistItems}
                                      label={t("requirementsOverdue", {open: work.openRequiredItems, overdue: work.overdueChecklistItems})}/>,
        },
        {segment: "guide", title: t("guide"), icon: BookOpen},
        {segment: "members", title: t("members"), icon: Users},
    ];

    return (
        <nav aria-label={t("sections")} className="-mx-4 overflow-x-auto overflow-y-hidden px-4 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
            <ul className="flex min-w-max gap-1 border-b">
                {tabs.map(tab => {
                    const active = tab.segment === segment;
                    return (
                        <li key={tab.segment ?? ""}>
                            <Link href={tab.segment ? `/revivals/${revivalId}/${tab.segment}` : `/revivals/${revivalId}`}
                                  aria-current={active ? "page" : undefined}
                                  className={cn(
                                      "-mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors [&_svg]:size-4",
                                      active
                                          ? "border-primary text-foreground"
                                          : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                                  )}>
                                <tab.icon/>
                                {tab.title}
                                {tab.count}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
