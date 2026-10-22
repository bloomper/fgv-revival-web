import {useTranslations} from "next-intl";
import type {LogEntryStatus} from "@/gql/graphql";
import {Badge} from "@/components/ui/badge";

const VARIANTS: Record<LogEntryStatus, "default" | "secondary" | "outline" | "ghost"> = {
    OPEN: "secondary",
    WAITING: "outline",
    DONE: "ghost",
    CANCELLED: "ghost",
};

export function LogStatusBadge({status}: { status: LogEntryStatus }) {
    const t = useTranslations("Log.status");

    return <Badge variant={VARIANTS[status]}>{t(status)}</Badge>;
}
