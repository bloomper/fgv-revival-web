"use client";

import * as React from "react";
import {useCallback, useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {
    BookOpen,
    BookOpenCheck,
    CalendarDays,
    CalendarRange,
    ClipboardList,
    Command as CommandIcon,
    Drama,
    History,
    Newspaper,
    House,
    Link2,
    ListChecks,
    type LucideIcon,
    Mail,
    Plus,
    Tags,
    Theater,
    Users,
    Wallet,
    Wrench,
} from "lucide-react";

import {Command, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {Dialog, DialogContent, DialogDescription, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {useRoles} from "@/components/roles-provider.client";
import {canReadAllRevivals, isSuperAdmin} from "@/utils/auth";
import {track} from "@/utils/umami";

type PaletteEntry = {
    id: string;
    label: string;
    href: string;
    icon: LucideIcon;
};

const normalize = (value: string) => value.trim().toLowerCase();

export function CommandPalette({guideReadable}: { guideReadable: boolean }) {
    const t = useTranslations();
    const router = useRouter();
    const roles = useRoles();

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                setOpen((previous) => !previous);
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    const {navigation, actions} = useMemo(() => {
        const navigationEntries: PaletteEntry[] = [
            {id: "home", label: t("Nav.home"), href: "/", icon: House},
            {id: "revivals", label: t("Nav.revivals"), href: "/revivals", icon: Theater},
        ];

        if (canReadAllRevivals(roles)) {
            navigationEntries.push({
                id: "all-revivals",
                label: t("Nav.allRevivals"),
                href: "/revivals/manage",
                icon: ListChecks
            });
            navigationEntries.push({
                id: "revival-timeline",
                label: t("Nav.revivalTimeline"),
                href: "/revivals/manage?view=timeline",
                icon: CalendarRange
            });
        }

        if (guideReadable) {
            navigationEntries.push({id: "guide", label: t("Nav.guide"), href: "/guide", icon: BookOpen});
        }

        if (isSuperAdmin(roles)) {
            navigationEntries.push({
                id: "admin-guide",
                label: t("Nav.adminGuide"),
                href: "/admin/guide",
                icon: BookOpenCheck
            });
            navigationEntries.push({
                id: "admin-checklist-templates",
                label: t("Nav.adminChecklistTemplates"),
                href: "/admin/checklist-templates",
                icon: ClipboardList
            });
            navigationEntries.push({
                id: "admin-event-types",
                label: t("Nav.adminEventTypes"),
                href: "/admin/event-types",
                icon: CalendarDays
            });
            navigationEntries.push({
                id: "admin-mailing-templates",
                label: t("Nav.adminMailingTemplates"),
                href: "/admin/mailing-templates",
                icon: Mail
            });
            navigationEntries.push({
                id: "admin-guide-item-types",
                label: t("Nav.adminGuideItemTypes"),
                href: "/admin/guide-item-types",
                icon: Tags
            });
            navigationEntries.push({
                id: "admin-capabilities",
                label: t("Nav.adminCapabilities"),
                href: "/admin/capabilities",
                icon: Users
            });
            navigationEntries.push({
                id: "admin-budget-categories",
                label: t("Nav.adminBudgetCategories"),
                href: "/admin/budget-categories",
                icon: Wallet
            });
            navigationEntries.push({
                id: "admin-link-services",
                label: t("Nav.adminLinkServices"),
                href: "/admin/link-services",
                icon: Link2
            });
            navigationEntries.push({
                id: "admin-reference-figures",
                label: t("Nav.adminReferenceFigures"),
                href: "/admin/reference-figures",
                icon: History
            });
            navigationEntries.push({
                id: "admin-spex-calendar",
                label: t("Nav.adminSpexCalendar"),
                href: "/admin/spex-calendar",
                icon: CalendarRange
            });
            navigationEntries.push({
                id: "admin-news",
                label: t("Nav.adminNews"),
                href: "/admin/news",
                icon: Newspaper
            });
        }

        navigationEntries.push(
            {id: "support", label: t("Support.title"), href: "/support", icon: Wrench},
            {id: "about", label: t("About.title"), href: "/about", icon: Drama},
        );

        const actionEntries: PaletteEntry[] = [];

        if (isSuperAdmin(roles)) {
            actionEntries.push({
                id: "create-revival",
                label: t("Admin.create"),
                href: "/revivals/manage?create=1",
                icon: Plus
            });
        }

        return {navigation: navigationEntries, actions: actionEntries};
    }, [roles, t, guideReadable]);

    const term = normalize(query);
    const matching = useCallback(
        (entries: PaletteEntry[]) => (term ? entries.filter((entry) => normalize(entry.label).includes(term)) : entries),
        [term],
    );
    const matchingNavigation = matching(navigation);
    const matchingActions = matching(actions);

    const go = useCallback((entry: PaletteEntry) => {
        track("command-palette", {target: entry.id});
        setOpen(false);
        setQuery("");
        router.push(entry.href);
    }, [router]);

    const hasResults = matchingNavigation.length > 0 || matchingActions.length > 0;

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-2"
                onClick={() => setOpen(true)}
                aria-label={t("CommandPalette.open")}
            >
                <CommandIcon className="h-4 w-4"/>
                <span className="hidden text-xs text-muted-foreground lg:inline">{t("CommandPalette.hint")}</span>
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="overflow-hidden p-0" showCloseButton={false}>
                    <DialogTitle className="sr-only">{t("CommandPalette.title")}</DialogTitle>
                    <DialogDescription className="sr-only">{t("CommandPalette.description")}</DialogDescription>
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder={t("CommandPalette.placeholder")}
                            value={query}
                            onValueChange={setQuery}
                        />
                        <CommandList>
                            {matchingNavigation.length > 0 && (
                                <CommandGroup heading={t("CommandPalette.navigation")}>
                                    {matchingNavigation.map((entry) => (
                                        <CommandItem key={entry.id} value={entry.id} onSelect={() => go(entry)}>
                                            <entry.icon/>
                                            <span>{entry.label}</span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}

                            {matchingActions.length > 0 && (
                                <CommandGroup heading={t("CommandPalette.create")}>
                                    {matchingActions.map((entry) => (
                                        <CommandItem key={entry.id} value={entry.id} onSelect={() => go(entry)}>
                                            <entry.icon/>
                                            <span>{entry.label}</span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}

                            {!hasResults && (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                    {t("CommandPalette.empty")}
                                </div>
                            )}
                        </CommandList>
                    </Command>
                </DialogContent>
            </Dialog>
        </>
    );
}
