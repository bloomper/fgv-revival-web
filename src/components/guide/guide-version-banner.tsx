import Link from "next/link";
import { useTranslations } from "next-intl";
import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@bloomper/fgv-web-ui/ui/alert";

/**
 * Tells readers a newer version exists, with a link to what changed.
 */
export function GuideVersionBanner({
  current,
  newer,
}: {
  current: { id: string; label?: string | null };
  newer: { id: string; label?: string | null };
}) {
  const t = useTranslations("Guide.version");

  return (
    <Alert>
      <Info />
      <AlertDescription className="flex flex-wrap items-center gap-x-2">
        {t("newer", { label: newer.label ?? "" })}
        <Link
          href={`/guide/changes?from=${current.id}&to=${newer.id}`}
          className="text-link hover:text-link/80 font-medium"
        >
          {t("whatChanged")}
        </Link>
      </AlertDescription>
    </Alert>
  );
}
