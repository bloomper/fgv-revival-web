import {useTranslations} from "next-intl";
import {Badge} from "@/components/ui/badge";
import {premiereDistance} from "@/components/event/timeline";

/**
 * How far from the premiere a day is, in weeks: "−8 v." / "8 wk before". Nothing without a premiere.
 */
export function PremiereDistanceLabel({days}: { days: number | null | undefined }) {
    const t = useTranslations("Event");
    const distance = premiereDistance(days);

    if (!distance) {
        return null;
    }
    return (
        <span className="whitespace-nowrap tabular-nums">
            {distance.key === "weeksBefore" || distance.key === "weeksAfter" ? t(distance.key, {weeks: distance.weeks}) : t(distance.key)}
        </span>
    );
}

export function CancelledBadge() {
    const t = useTranslations("Event");

    return <Badge variant="outline">{t("cancelledBadge")}</Badge>;
}
