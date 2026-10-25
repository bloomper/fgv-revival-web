import {useTranslations} from "next-intl";
import type {GuideItemFieldsFragment} from "@/gql/graphql";
import {GuideItem} from "@/components/guide/guide-item";

/**
 * The chapter's tips from the pinned guide version, shown with its chapter checklist. Collapsed by default.
 */
export function ChecklistTips({tips}: { tips: GuideItemFieldsFragment[] }) {
    const t = useTranslations("Checklist");

    if (tips.length === 0) {
        return null;
    }
    return (
        <details className="rounded-lg border p-3">
            <summary className="cursor-pointer text-sm font-medium">{t("tips", {count: tips.length})}</summary>
            <div className="mt-3 space-y-2 text-sm">{tips.map(tip => <GuideItem key={tip.key} item={tip}/>)}</div>
        </details>
    );
}
