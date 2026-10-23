import type {GuideItemKind} from "@/gql/graphql";
import {type LocalizedTextValue, pickText} from "@/components/guide/localized";

/**
 * An entry of a list the super admin keeps: an area of responsibility or a guide item type.
 */
export type CatalogEntryValue = { id: string; name: LocalizedTextValue; retired: boolean };

export type GuideItemTypeValue = CatalogEntryValue & { kind: GuideItemKind };

/**
 * The entry's name in the reader's language, falling back to Swedish.
 */
export function catalogName(entry: { name: LocalizedTextValue }, locale: string): string {
    return pickText(entry.name, locale).text;
}

/**
 * What a picker offers: the active entries, plus those a row already holds although they are retired, so saving
 * keeps them. Retired entries the row does not hold are never offered.
 */
export function catalogChoices<T extends CatalogEntryValue>(entries: readonly T[], held: readonly (T | null | undefined)[] = []): T[] {
    const active = entries.filter(entry => !entry.retired);
    const ids = new Set(active.map(entry => entry.id));
    const kept = held.filter((entry): entry is T => !!entry && entry.retired && !ids.has(entry.id));

    return [...active, ...kept.filter((entry, index) => kept.findIndex(other => other.id === entry.id) === index)];
}

/**
 * The type a new item starts with: the first active one of the kind, otherwise the first active one.
 */
export function defaultItemType(types: readonly GuideItemTypeValue[], kind: GuideItemKind = "TIP"): string {
    const active = types.filter(type => !type.retired);

    return (active.find(type => type.kind === kind) ?? active[0])?.id ?? "";
}
