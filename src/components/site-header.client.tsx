"use client";

import {SiteHeader as FgvSiteHeader} from "@bloomper/fgv-web-ui/shell/site-header";
import type {Application} from "@bloomper/fgv-web-ui/shell/applications";
import {LanguageToggle, ModeToggle} from "@bloomper/fgv-web-ui/shell/toggles";
import {CommandPalette} from "@/components/command-palette.client";

/**
 * The FGV header with Nyuppsättning's own control: the command palette, which offers the guide to those who may read it.
 */
export function SiteHeader({guideReadable, applications}: {
    guideReadable: boolean;
    applications: Application[];
}) {
    return (
        <FgvSiteHeader
            applications={applications}
            actions={
                <>
                    <CommandPalette guideReadable={guideReadable}/>
                    <LanguageToggle/>
                    <ModeToggle/>
                </>
            }
        />
    );
}
