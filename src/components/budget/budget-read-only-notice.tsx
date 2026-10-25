import {getTranslations} from "next-intl/server";
import {Eye} from "lucide-react";
import type {RevivalStatus} from "@/gql/graphql";
import type {Role} from "@/types/auth";
import {isObserver, isSuperAdmin} from "@/utils/auth";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";

/**
 * Says why the budget is read-only: only the directeur and steering group members with the finance area change it.
 * Renders nothing when the caller may write.
 */
export async function BudgetReadOnlyNotice({status, canWrite, roles}: {
    status: RevivalStatus;
    canWrite: boolean;
    roles: Role[]
}) {
    if (canWrite) {
        return null;
    }

    const t = await getTranslations();
    const reason = status === "ARCHIVED" ? "archived" : isSuperAdmin(roles) ? "superAdmin" : isObserver(roles) ? "observer" : "other";

    return (
        <Alert>
            <Eye/>
            <AlertTitle>{t("Revival.readOnly.title")}</AlertTitle>
            <AlertDescription>
                <p>{reason === "archived" ? t("Revival.readOnly.archived") : t(`Budget.readOnly.${reason}`)}</p>
            </AlertDescription>
        </Alert>
    );
}
