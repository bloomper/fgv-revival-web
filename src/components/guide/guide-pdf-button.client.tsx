"use client";

import {useTranslations} from "next-intl";
import {Download} from "lucide-react";
import {Button} from "@/components/ui/button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {track} from "@/utils/umami";

/**
 * Downloads the guide as a PDF in Swedish or English (FR-028, FR-030): a version, or a revival's guide.
 */
export function GuidePdfButton({versionId, revivalId}: { versionId?: string; revivalId?: string }) {
    const t = useTranslations("Guide.pdf");
    const target = revivalId ? `revival=${revivalId}` : `version=${versionId}`;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline"/>}>
                <Download/>
                {t("download")}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {(["sv", "en"] as const).map(lang => (
                    <DropdownMenuItem key={lang} render={<a href={`/api/guide-pdf?${target}&lang=${lang}`} download onClick={() => track("guide-pdf")}/>}>
                        {t(lang)}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
