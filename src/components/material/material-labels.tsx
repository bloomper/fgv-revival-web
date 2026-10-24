import type * as React from "react";
import {useLocale, useTranslations} from "next-intl";
import {ExternalLink} from "lucide-react";
import type {InventoryLocation, InventoryStatus, MaterialCategory, MaterialVisibility} from "@/gql/graphql";
import {Badge} from "@/components/ui/badge";
import {catalogName} from "@/components/catalog/catalog";
import type {LocalizedTextValue} from "@/components/guide/localized";
import type {PositionValue} from "@/components/participant/participant-labels";
import {hostOf} from "@/lib/material/hosts";
import {cn} from "@/utils/utils";

export type LinkServiceValue = { id: string; name: LocalizedTextValue; hosts: string[]; homeUrl?: string | null; retired: boolean };

/**
 * Where a link leads: the service's name, or the link's host when no service recognises it.
 */
export function ServiceBadge({service, url}: { service?: { name: LocalizedTextValue } | null; url: string }) {
    const t = useTranslations("Material");
    const locale = useLocale();

    if (service) {
        return <Badge variant="secondary">{catalogName(service, locale)}</Badge>;
    }

    const host = hostOf(url);

    return <Badge variant="outline" className="font-mono" title={t("unknownService")}>{host ?? t("unknownService")}</Badge>;
}

export function CategoryBadge({category}: { category: MaterialCategory }) {
    const t = useTranslations("Material");

    return <Badge variant="outline">{t(`categories.${category}`)}</Badge>;
}

/**
 * Who sees a material: the steering group, every participant, or the named positions.
 */
export function VisibilityLabel({visibility, positions}: { visibility: MaterialVisibility; positions: readonly PositionValue[] }) {
    const t = useTranslations("Material");

    if (visibility === "POSITIONS") {
        return <span>{t("visibilityPositions", {positions: positions.map(position => position.name).join(", ")})}</span>;
    }
    return <span>{t(`visibilities.${visibility}`)}</span>;
}

/**
 * A material's link, opening in a new tab without giving the other site a handle on this one. The icon and the hidden
 * text say so for those who cannot see where it opens.
 */
export function MaterialLink({title, url, className, onClick}: {
    title: string;
    url: string;
    className?: string;
    /** Only from client components, e.g. to keep a table row from opening its dialog. */
    onClick?: (click: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
    const t = useTranslations("Material");

    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className={cn("inline-flex items-center gap-1 font-medium underline-offset-2 hover:underline", className)}
           onClick={onClick}>
            <span className="break-words">{title}</span>
            <ExternalLink aria-hidden className="size-3.5 shrink-0"/>
            <span className="sr-only">{t("opensInNewTab")}</span>
        </a>
    );
}

// Statuses that need someone to act stand out; the text always says which it is, so colour is never the only cue
const STATUS_CLASSES: Record<InventoryStatus, string> = {
    HAVE: "border-emerald-600/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
    BORROW: "border-sky-600/40 bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-200",
    MISSING: "border-transparent bg-destructive text-white dark:bg-destructive/60",
    BUY: "border-amber-600/50 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
    BUILD: "border-amber-600/50 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
};

export function InventoryStatusBadge({status}: { status: InventoryStatus }) {
    const t = useTranslations("Inventory");

    return <Badge variant="outline" className={STATUS_CLASSES[status]}>{t(`statuses.${status}`)}</Badge>;
}

/**
 * Where an item is kept: the store and the note, or only the note when the place is OTHER.
 */
export function LocationLabel({location, note}: { location?: InventoryLocation | null; note?: string | null }) {
    const t = useTranslations("Inventory");

    if (!location && !note) {
        return <span className="text-muted-foreground">—</span>;
    }
    return (
        <span className="flex flex-col">
            {location && <span>{t(`locations.${location}`)}</span>}
            {note && <span className="text-xs text-muted-foreground">{note}</span>}
        </span>
    );
}
