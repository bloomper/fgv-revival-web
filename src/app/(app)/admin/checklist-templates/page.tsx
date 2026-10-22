import Link from "next/link";
import {getTranslations} from "next-intl/server";
import {buttonVariants} from "@/components/ui/button";
import {TemplateList} from "@/components/checklist/template/template-list.client";
import {getChecklistTemplates} from "@/lib/checklist/template.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * Checklist templates for super admins (M3 US5). Retired templates only when asked for.
 */
export default async function ChecklistTemplatesPage({searchParams}: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
    const retired = (await searchParams).retired === "1";

    return withPolicyPage(Policies.admin.requireSuperAdmin, async () => {
        const t = await getTranslations("ChecklistTemplate");
        const templates = await getChecklistTemplates(retired);

        return (
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-bold tracking-tight">{t("title")}</h2>
                    <Link href={retired ? "/admin/checklist-templates" : "/admin/checklist-templates?retired=1"} aria-pressed={retired} className={buttonVariants({variant: "outline", size: "sm"})}>
                        {retired ? t("hideRetired") : t("showRetired")}
                    </Link>
                </div>
                <TemplateList templates={templates}/>
            </div>
        );
    });
}
