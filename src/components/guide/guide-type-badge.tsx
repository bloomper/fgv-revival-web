import {useTranslations} from "next-intl";
import type {GuideItemType} from "@/gql/graphql";
import {Badge} from "@/components/ui/badge";

const VARIANTS: Record<GuideItemType, "default" | "secondary" | "outline"> = {
    REQUIREMENT: "default",
    QUESTION: "secondary",
    TIP: "outline",
    TEXT: "outline",
};

export function GuideTypeBadge({type}: { type: GuideItemType }) {
    const t = useTranslations("Guide.type");

    return <Badge variant={VARIANTS[type]}>{t(type)}</Badge>;
}
