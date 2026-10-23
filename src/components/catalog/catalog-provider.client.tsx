"use client";

import {createContext, type ReactNode, useContext} from "react";
import {useLocale, useTranslations} from "next-intl";
import {catalogName, type CatalogEntryValue, type GuideItemTypeValue} from "@/components/catalog/catalog";

const CatalogContext = createContext<{ capabilities: CatalogEntryValue[]; itemTypes: GuideItemTypeValue[] }>({capabilities: [], itemTypes: []});

/**
 * The active areas of responsibility and guide item types, for the pickers below it. Pages that offer a picker fetch
 * the lists and wrap their content in this.
 */
export function CatalogProvider({capabilities = [], itemTypes = [], children}: {
    capabilities?: CatalogEntryValue[];
    itemTypes?: GuideItemTypeValue[];
    children: ReactNode;
}) {
    return <CatalogContext.Provider value={{capabilities, itemTypes}}>{children}</CatalogContext.Provider>;
}

export function useCapabilities(): CatalogEntryValue[] {
    return useContext(CatalogContext).capabilities;
}

export function useGuideItemTypes(): GuideItemTypeValue[] {
    return useContext(CatalogContext).itemTypes;
}

/**
 * A select's options for the entries, retired ones marked as such.
 */
export function CatalogOptions({entries}: { entries: readonly CatalogEntryValue[] }) {
    const t = useTranslations("Catalog");
    const locale = useLocale();

    return entries.map(entry => (
        <option key={entry.id} value={entry.id}>
            {entry.retired ? t("retiredName", {name: catalogName(entry, locale)}) : catalogName(entry, locale)}
        </option>
    ));
}
