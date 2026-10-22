"use client";

import * as React from "react";
import {useCallback, useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {BookOpen, BookOpenCheck, ClipboardList, Command as CommandIcon, Drama, House, ListChecks, type LucideIcon, Plus, Wrench} from "lucide-react";

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

export function CommandPalette() {
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
            {id: "home", label: t("Nav.myRevivals"), href: "/", icon: House},
        ];

        if (canReadAllRevivals(roles)) {
            navigationEntries.push({id: "all-revivals", label: t("Nav.allRevivals"), href: "/admin/revivals", icon: ListChecks});
        }

        navigationEntries.push({id: "guide", label: t("Nav.guide"), href: "/guide", icon: BookOpen});

        if (isSuperAdmin(roles)) {
            navigationEntries.push({id: "admin-guide", label: t("Nav.adminGuide"), href: "/admin/guide", icon: BookOpenCheck});
            navigationEntries.push({id: "admin-checklist-templates", label: t("Nav.adminChecklistTemplates"), href: "/admin/checklist-templates", icon: ClipboardList});
        }

        navigationEntries.push(
            {id: "support", label: t("Support.title"), href: "/support", icon: Wrench},
            {id: "about", label: t("About.title"), href: "/about", icon: Drama},
        );

        const actionEntries: PaletteEntry[] = [];

        if (isSuperAdmin(roles)) {
            actionEntries.push({id: "create-revival", label: t("Admin.create"), href: "/admin/revivals?create=1", icon: Plus});
        }

        return {navigation: navigationEntries, actions: actionEntries};
    }, [roles, t]);

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
