import Link from "next/link";
import {useTranslations} from "next-intl";
import {Info} from "lucide-react";
import {Alert, AlertDescription} from "@/components/ui/alert";

/**
 * Tells readers a newer version exists, with a link to what changed (FR-019).
 */
export function GuideVersionBanner({current, newer}: { current: { id: string; label?: string | null }; newer: { id: string; label?: string | null } }) {
    const t = useTranslations("Guide.version");

    return (
        <Alert>
            <Info/>
            <AlertDescription className="flex flex-wrap items-center gap-x-2">
                {t("newer", {label: newer.label ?? ""})}
                <Link href={`/guide/changes?from=${current.id}&to=${newer.id}`} className="font-medium underline underline-offset-2">
                    {t("whatChanged")}
                </Link>
            </AlertDescription>
        </Alert>
    );
}
