import {useTranslations} from "next-intl";
import type {LogEntryType} from "@/gql/graphql";
import {Badge} from "@/components/ui/badge";

const VARIANTS: Record<LogEntryType, "default" | "secondary" | "outline"> = {
    DECISION: "default",
    TODO: "secondary",
    QUESTION: "outline",
};

export function LogTypeBadge({type}: { type: LogEntryType }) {
    const t = useTranslations("Log.type");

    return <Badge variant={VARIANTS[type]}>{t(type)}</Badge>;
}
