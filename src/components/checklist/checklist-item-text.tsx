import {useLocale, useTranslations} from "next-intl";
import type {ChecklistItemFieldsFragment} from "@/gql/graphql";
import {GuideMarkdown} from "@/components/guide/guide-markdown";
import {pickText} from "@/components/guide/localized";
import {PlainText} from "@/components/plain-text";

/**
 * A required item's text is the guide's Markdown in the reader's language; any other item's is the
 * steering group's plain text.
 */
export function ChecklistItemText({item}: { item: Pick<ChecklistItemFieldsFragment, "required" | "text"> }) {
    const t = useTranslations("Guide");
    const locale = useLocale();

    if (!item.required) {
        return <PlainText text={item.text.sv}/>;
    }

    const {text, translated} = pickText(item.text, locale);

    return (
        <div>
            <GuideMarkdown>{text}</GuideMarkdown>
            {!translated && <span className="text-xs text-muted-foreground">{t("notTranslated")}</span>}
        </div>
    );
}
