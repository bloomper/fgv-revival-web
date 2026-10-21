import {useTranslations} from "next-intl";

/**
 * The spex's title from Spexregister, or a notice while Spexregister is unavailable (FR-008a).
 */
export function SpexTitle({spex}: { spex: { title?: string | null; available: boolean } }) {
    const t = useTranslations("Revival");

    if (!spex.available || !spex.title) {
        return <span className="italic text-muted-foreground">{t("spexUnavailable")}</span>;
    }
    return <span>{spex.title}</span>;
}
