import Link from "next/link";
import {useLocale, useTranslations} from "next-intl";
import type {ChecklistItemFieldsFragment} from "@/gql/graphql";
import {Badge} from "@/components/ui/badge";
import {OwnerLabel} from "@/components/owner/owner-label";
import {OverdueBadge} from "@/components/decision-log/overdue-badge";
import {ChecklistItemText} from "@/components/checklist/checklist-item-text";
import {pickText} from "@/components/guide/localized";

/**
 * Items from several checklists, each with a link to its own checklist, where it is changed (M3 FR-028).
 */
export function ChecklistItemList({revivalId, items}: { revivalId: string; items: ChecklistItemFieldsFragment[] }) {
    const t = useTranslations("Checklist");
    const locale = useLocale();

    if (items.length === 0) {
        return <p className="text-sm text-muted-foreground">{t("noMatches")}</p>;
    }
    return (
        <ul className="space-y-2" aria-label={t("matches")}>
            {items.map(item => (
                <li key={item.id} className="space-y-1 rounded-lg border p-3">
                    <Link href={`/revivals/${revivalId}/checklists/${item.checklist.id}`} className="text-sm text-muted-foreground hover:underline">
                        {item.checklist.kind === "CHAPTER"
                            ? item.checklist.chapterTitle ? pickText(item.checklist.chapterTitle, locale).text : item.checklist.chapterKey
                            : item.checklist.name}
                    </Link>
                    <ChecklistItemText item={item}/>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        {item.required && <Badge>{t("required")}</Badge>}
                        {item.state !== "OPEN" && <Badge variant="outline">{t(`state.${item.state}`)}</Badge>}
                        {item.overdue && <OverdueBadge/>}
                        <span>{t("owner")}: <OwnerLabel owner={item.owner}/></span>
                        {item.deadline && <span>{t("deadline")}: {item.deadline}</span>}
                    </div>
                </li>
            ))}
        </ul>
    );
}
