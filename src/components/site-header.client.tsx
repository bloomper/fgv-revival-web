"use client";

import {SidebarIcon} from "lucide-react";
import {useTranslations} from "next-intl";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {useSidebar} from "@/components/ui/sidebar";
import {ModeToggle} from "@/components/mode-toggle.client";
import {LanguageToggle} from "@/components/language-toggle.client";
import {useIsClient} from "@/hooks/use-is-client.client";
import {CommandPalette} from "@/components/command-palette.client";

export function SiteHeader({guideReadable}: { guideReadable: boolean }) {
    const {toggleSidebar} = useSidebar();
    const isClient = useIsClient();
    const t = useTranslations();

    return (
        <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b print:hidden">
            <div className="flex min-h-(--header-height) w-full items-center gap-2 px-4">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Button
                        className="h-8 w-8"
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                    >
                        <SidebarIcon/>
                    </Button>
                    <Separator orientation="vertical" className="mr-2 h-4"/>
                    <h1 className="truncate text-base font-semibold whitespace-nowrap sm:text-lg">
                        {t("Meta.title")}
                    </h1>
                </div>

                <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                    {isClient ? (
                        <>
                            <CommandPalette guideReadable={guideReadable}/>
                            <LanguageToggle/>
                            <ModeToggle/>
                        </>
                    ) : (
                        <div className="h-8 w-8 animate-pulse rounded bg-muted"/>
                    )}
                </div>
            </div>
        </header>
    );
}
