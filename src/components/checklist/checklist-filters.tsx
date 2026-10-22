import Link from "next/link";
import {useTranslations} from "next-intl";
import {Button} from "@/components/ui/button";
import {CHECKLIST_FILTERS, checklistFilterQuery, type ChecklistFilterValues} from "@/lib/checklist/schema";

/**
 * Toggles for the cross-checklist view (M3 FR-028). Each is a link, so a filtered view can be shared.
 */
export function ChecklistFilters({revivalId, filter}: { revivalId: string; filter: ChecklistFilterValues | null }) {
    const t = useTranslations("Checklist.filter");

    return (
        <div className="flex flex-wrap gap-2" role="group" aria-label={t("label")}>
            {CHECKLIST_FILTERS.map(key => (
                <Button nativeButton={false} key={key} size="sm" variant={filter?.[key] ? "default" : "outline"} aria-pressed={!!filter?.[key]}
                        render={<Link href={`/revivals/${revivalId}/checklists${checklistFilterQuery(filter, key)}`}/>}>
                    {t(key)}
                </Button>
            ))}
        </div>
    );
}
