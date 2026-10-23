import {useLocale} from "next-intl";
import type {GuideItemKind} from "@/gql/graphql";
import {Badge} from "@/components/ui/badge";
import {catalogName, type GuideItemTypeValue} from "@/components/catalog/catalog";

const VARIANTS: Record<GuideItemKind, "default" | "secondary" | "outline"> = {
    REQUIREMENT: "default",
    QUESTION: "secondary",
    TIP: "outline",
    TEXT: "outline",
};

/**
 * The item type's name, styled by its kind, so types of the same kind look alike.
 */
export function GuideTypeBadge({type}: { type: GuideItemTypeValue }) {
    const locale = useLocale();

    return <Badge variant={VARIANTS[type.kind]}>{catalogName(type, locale)}</Badge>;
}
