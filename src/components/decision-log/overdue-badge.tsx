import {useTranslations} from "next-intl";
import {Badge} from "@/components/ui/badge";

/**
 * A deadline that has passed while the row or item is unfinished.
 */
export function OverdueBadge() {
    const t = useTranslations("Log");

    return <Badge variant="destructive">{t("overdue")}</Badge>;
}
