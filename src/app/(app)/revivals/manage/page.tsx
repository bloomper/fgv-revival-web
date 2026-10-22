import {getTranslations} from "next-intl/server";
import {RevivalAdminTable} from "@/components/revival/revival-admin-table.client";
import {RevivalCreateDialog} from "@/components/revival/revival-create-dialog.client";
import {getRevivals} from "@/lib/revival/revival.server";
import {isSuperAdmin} from "@/utils/auth";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * All revivals: super admins create revivals here and open one to manage it; observers see the same list read-only
 * (FR-021, FR-021a).
 */
export default async function ManageRevivalsPage({searchParams}: { searchParams: Promise<{ create?: string }> }) {
    const {create} = await searchParams;

    return withPolicyPage(Policies.revivals.requireReadAll, async ({roles}) => {
        const t = await getTranslations("Admin");
        const revivals = await getRevivals();
        const superAdmin = isSuperAdmin(roles);

        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
                <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-bold tracking-tight">{t("title")}</h2>
                    {!superAdmin && <p className="text-sm text-muted-foreground">{t("readOnly")}</p>}
                </div>
                <RevivalAdminTable revivals={revivals}
                                   actions={superAdmin && <RevivalCreateDialog key={create ?? ""} defaultOpen={create !== undefined}/>}/>
            </div>
        );
    });
}
