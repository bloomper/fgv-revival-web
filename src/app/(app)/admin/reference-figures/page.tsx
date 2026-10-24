import {getTranslations} from "next-intl/server";
import {ReferenceRevivalEditor} from "@/components/budget/admin/reference-revival-editor.client";
import {getBudgetCategories, getReferenceRevivals} from "@/lib/budget/reference.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * Earlier revivals' budgets and outcomes, kept as reference by the super admin (M5-FR-2): every revival's budget shows
 * them beside its categories. Revivals that were deleted are added here automatically.
 */
export default async function ReferenceFiguresPage() {
    return withPolicyPage(Policies.admin.requireSuperAdmin, async () => {
        const t = await getTranslations("ReferenceAdmin");
        const [references, categories] = await Promise.all([getReferenceRevivals(), getBudgetCategories(true)]);

        return (
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                <h2 className="text-lg font-bold tracking-tight">{t("title")}</h2>
                <p className="max-w-prose text-sm text-muted-foreground">{t("description")}</p>
                <ReferenceRevivalEditor references={references} categories={categories}/>
            </div>
        );
    });
}
