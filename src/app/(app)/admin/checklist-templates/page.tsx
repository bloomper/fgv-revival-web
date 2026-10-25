import {getTranslations} from "next-intl/server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * Checklist templates for super admins. The list is in the layout; from {@code lg} this is the room beside it
 * until a template is picked.
 */
export default async function ChecklistTemplatesPage() {
    return withPolicyPage(Policies.admin.requireSuperAdmin, async () => {
        const t = await getTranslations("ChecklistTemplate");

        return (
            <div
                className="hidden flex-1 items-center justify-center rounded-lg border border-dashed p-8 text-sm text-muted-foreground lg:flex">
                {t("choose")}
            </div>
        );
    });
}
