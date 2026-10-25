import Link from "next/link";
import {useLocale, useTranslations} from "next-intl";
import {BookMarked} from "lucide-react";
import {pickText} from "@/components/guide/localized";
import {libraryAnchor, type LibraryLinkValue} from "@/components/library/library";

/**
 * The reference library entries a guide item links to, each a link to its place in the library.
 */
export function LibraryLinks({entries}: { entries?: readonly LibraryLinkValue[] | null }) {
    const t = useTranslations("Library");
    const locale = useLocale();

    if (!entries?.length) {
        return null;
    }
    return (
        <ul className="flex flex-wrap gap-2" aria-label={t("linkedEntries")}>
            {entries.map(entry => (
                <li key={entry.id}>
                    <Link href={`/library#${libraryAnchor(entry.id)}`}
                          className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs hover:bg-accent">
                        <BookMarked className="size-3" aria-hidden/>
                        <span>{pickText(entry.name, locale).text}</span>
                        <span className="text-muted-foreground">· {t(`kinds.${entry.kind}`)}</span>
                    </Link>
                </li>
            ))}
        </ul>
    );
}
