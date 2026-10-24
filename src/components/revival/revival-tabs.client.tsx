"use client";

import {type ReactNode, type RefObject, useEffect, useRef, useState} from "react";
import Link from "next/link";
import {useSelectedLayoutSegment} from "next/navigation";
import {
    BookOpen,
    CalendarCheck,
    CalendarClock,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    ClipboardCheck,
    Flag,
    FolderOpen,
    LayoutDashboard,
    ListChecks,
    type LucideIcon,
    Mail,
    UserRound,
    Users,
    Wallet,
} from "lucide-react";
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

/** Which ends of a horizontally scrolling element still have content hidden beyond them. */
function useOverflow(ref: RefObject<HTMLElement | null>, key: unknown) {
    const [overflow, setOverflow] = useState({start: false, end: false});

    useEffect(() => {
        const element = ref.current;
        if (!element) {
            return;
        }
        const update = () => {
            const {scrollLeft, scrollWidth, clientWidth} = element;
            setOverflow({start: scrollLeft > 1, end: scrollLeft + clientWidth < scrollWidth - 1});
        };
        update();
        element.addEventListener("scroll", update, {passive: true});
        const observer = new ResizeObserver(update);
        observer.observe(element);
        if (element.firstElementChild) {
            observer.observe(element.firstElementChild);
        }
        return () => {
            element.removeEventListener("scroll", update);
            observer.disconnect();
        };
    }, [ref, key]);

    return overflow;
}

function ScrollButton({side, onClick}: { side: "start" | "end"; onClick: () => void }) {
    const Icon = side === "start" ? ChevronLeft : ChevronRight;
    return (
        // Pointer-only: keyboard users reach every tab by Tab, which scrolls it into view.
        <button type="button" tabIndex={-1} aria-hidden onClick={onClick}
                className={cn(
                    "absolute inset-y-0 z-10 flex w-10 items-center text-muted-foreground hover:text-foreground [&_svg]:size-4",
                    side === "start"
                        ? "left-0 justify-start bg-linear-to-r from-background from-50% to-transparent"
                        : "right-0 justify-end bg-linear-to-l from-background from-50% to-transparent",
                )}>
            <Icon/>
        </button>
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
export function RevivalTabs({
                                revivalId,
                                work,
                                canReadBudget = false,
                                canReadParticipants = false,
                                canReadStaffing = false,
                                canReadMailings = false,
                                canReadMaterials = false,
                                closingProminent = false,
                            }: {
    revivalId: string;
    work: RevivalWork | null;
    /** Only those who may read the budget see its tab (M5-FR-6). */
    canReadBudget?: boolean;
    /** Only the directeurs, the steering group and super admins see the participants (M6a). */
    canReadParticipants?: boolean;
    /** Staffing and mailings (M6b): super admins, directeurs and the steering group. */
    canReadStaffing?: boolean;
    canReadMailings?: boolean;
    /** Materials and inventory (M8): super admins, directeurs and the steering group. */
    canReadMaterials?: boolean;
    /** From CLOSING onwards the Closing tab (M7), always last, is marked so it stands out. */
    closingProminent?: boolean;
}) {
    const t = useTranslations("Revival");
    const segment = useSelectedLayoutSegment();

    const tabs: Tab[] = [
        {segment: null, title: t("overview"), icon: LayoutDashboard},
        {segment: "events", title: t("events"), icon: CalendarDays},
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
        ...(canReadBudget ? [{segment: "budget", title: t("budget"), icon: Wallet}] : []),
        ...(canReadParticipants ? [{segment: "participants", title: t("participants"), icon: UserRound}] : []),
        ...(canReadStaffing ? [{segment: "staffing", title: t("staffing"), icon: CalendarClock}] : []),
        ...(canReadMailings ? [{segment: "mailings", title: t("mailings"), icon: Mail}] : []),
        ...(canReadMaterials ? [{segment: "materials", title: t("materials"), icon: FolderOpen}] : []),
        {segment: "guide", title: t("guide"), icon: BookOpen},
        {segment: "members", title: t("members"), icon: Users},
        {
            segment: "closing", title: t("closing"), icon: Flag,
            count: closingProminent && <span className="size-2 rounded-full bg-primary" title={t("closingNow")} aria-hidden/>,
        },
    ];

    const scroller = useRef<HTMLDivElement>(null);
    const overflow = useOverflow(scroller, tabs.length);

    // Bring the active tab into view, so a section far to the right is not hidden on a narrow screen.
    useEffect(() => {
        scroller.current?.querySelector("[aria-current=page]")?.scrollIntoView({block: "nearest", inline: "nearest"});
    }, [segment]);

    const scrollBy = (direction: 1 | -1) => {
        const element = scroller.current;
        element?.scrollBy({left: direction * element.clientWidth * 0.75, behavior: "smooth"});
    };

    return (
        <nav aria-label={t("sections")} className="print:hidden relative -mx-4 md:mx-0">
            {overflow.start && <ScrollButton side="start" onClick={() => scrollBy(-1)}/>}
            {overflow.end && <ScrollButton side="end" onClick={() => scrollBy(1)}/>}
            <div ref={scroller} className="overflow-x-auto overflow-y-hidden px-4 [scrollbar-width:none] md:px-0 [&::-webkit-scrollbar]:hidden">
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
            </div>
        </nav>
    );
}
