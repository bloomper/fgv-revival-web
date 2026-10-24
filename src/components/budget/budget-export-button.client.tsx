"use client";

import {useTranslations} from "next-intl";
import {FileSpreadsheet} from "lucide-react";
import {buttonVariants} from "@/components/ui/button";
import {track} from "@/utils/umami";

/**
 * Downloads the budget as an Excel workbook through the route handler, which adds the token (M5-FR-11).
 */
export function BudgetExportButton({revivalId}: { revivalId: string }) {
    const t = useTranslations("Budget");

    return (
        <a href={`/api/budget-export/${encodeURIComponent(revivalId)}`} download className={buttonVariants({variant: "outline"})}
           onClick={() => track("budget-export")}>
            <FileSpreadsheet/>
            {t("export")}
        </a>
    );
}
