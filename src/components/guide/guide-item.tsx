import type {ReactNode} from "react";
import {useLocale, useTranslations} from "next-intl";
import type {GuideItemFieldsFragment} from "@/gql/graphql";
import {GuideMarkdown} from "@/components/guide/guide-markdown";
import {GuideTypeBadge} from "@/components/guide/guide-type-badge";
import {pickText} from "@/components/guide/localized";

/**
 * One item: its type, unless it is plain text, and its Markdown in the reader's language.
 */
export function GuideItem({item, actions}: { item: GuideItemFieldsFragment, actions?: ReactNode }) {
    const t = useTranslations("Guide");
    const locale = useLocale();
    const {text, translated} = pickText(item.text, locale);

    return (
        <div id={`item-${item.key}`} className="scroll-mt-24 space-y-2 rounded-md border p-3">
            <div className="flex flex-wrap items-center gap-2">
                {item.type !== "TEXT" && <GuideTypeBadge type={item.type}/>}
                {!translated && <span className="text-xs text-muted-foreground">{t("notTranslated")}</span>}
                {actions && <div className="ml-auto flex gap-1">{actions}</div>}
            </div>
            <GuideMarkdown>{text}</GuideMarkdown>
        </div>
    );
}
