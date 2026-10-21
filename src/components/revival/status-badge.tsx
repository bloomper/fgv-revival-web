import {useTranslations} from "next-intl";
import type {RevivalStatus} from "@/gql/graphql";
import {Badge} from "@/components/ui/badge";

const VARIANTS: Record<RevivalStatus, "default" | "secondary" | "outline" | "destructive"> = {
    PROPOSED: "outline",
    APPROVED: "secondary",
    ORGANISING: "default",
    OPEN: "default",
    CLOSING: "default",
    SETTLING: "secondary",
    ARCHIVED: "outline",
    REJECTED: "destructive",
};

export function StatusBadge({status}: { status: RevivalStatus }) {
    const t = useTranslations("Status");

    return <Badge variant={VARIANTS[status]}>{t(status)}</Badge>;
}
