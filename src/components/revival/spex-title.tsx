import {useTranslations} from "next-intl";

/**
 * The spex's title from Spexipedia, or a notice while Spexipedia is unavailable.
 */
export function SpexTitle({spex}: { spex: { title?: string | null; available: boolean } }) {
    const t = useTranslations("Revival");

    if (!spex.available || !spex.title) {
        return <span className="italic text-muted-foreground">{t("spexUnavailable")}</span>;
    }
    return <span>{spex.title}</span>;
}
