import {useTranslations} from "next-intl";
import {Badge} from "@/components/ui/badge";

export type OwnerValue = {
    person?: { id: string; displayName?: string | null; active: boolean } | null;
    name?: string | null;
} | null | undefined;

/**
 * Who owns a row or an item: a member by display name, or a free-text name marked as not a member (M3 FR-009).
 */
export function OwnerLabel({owner}: { owner: OwnerValue }) {
    const t = useTranslations("Owner");

    if (owner?.person) {
        return (
            <span className="inline-flex flex-wrap items-center gap-1">
                <span>{owner.person.displayName ?? "—"}</span>
                {!owner.person.active && <Badge variant="outline">{t("formerMember")}</Badge>}
            </span>
        );
    }
    if (owner?.name) {
        return (
            <span className="inline-flex flex-wrap items-center gap-1">
                <span>{owner.name}</span>
                <Badge variant="outline">{t("notMember")}</Badge>
            </span>
        );
    }
    return <span className="text-muted-foreground">{t("none")}</span>;
}
