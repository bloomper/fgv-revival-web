import Link from "next/link";
import {getTranslations} from "next-intl/server";
import {Eye} from "lucide-react";
import type {RevivalStatus} from "@/gql/graphql";
import type {Role} from "@/types/auth";
import {isObserver, isSuperAdmin} from "@/utils/auth";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";

/**
 * Says why a revival's work is read-only when the server does not let the caller change it: only its directeurs and
 * steering group write the log, meetings, checklists and guide suggestions (M3 FR-001, FR-002). Super admins are told
 * how to join the steering group. Renders nothing when the caller may write.
 */
export async function ReadOnlyNotice({revivalId, status, canWrite, roles}: {
    revivalId: string;
    status: RevivalStatus;
    canWrite: boolean;
    roles: Role[];
}) {
    if (canWrite) {
        return null;
    }

    const t = await getTranslations("Revival.readOnly");
    const reason = status === "ARCHIVED" ? "archived" : isSuperAdmin(roles) ? "superAdmin" : isObserver(roles) ? "observer" : "other";

    return (
        <Alert>
            <Eye/>
            <AlertTitle>{t("title")}</AlertTitle>
            <AlertDescription>
                <p>
                    {t(reason)}
                    {reason === "superAdmin" && (
                        <> <Link href={`/revivals/${revivalId}`} className="underline">{t("join")}</Link></>
                    )}
                </p>
            </AlertDescription>
        </Alert>
    );
}
