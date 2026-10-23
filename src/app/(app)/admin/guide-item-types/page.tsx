import {getTranslations} from "next-intl/server";
import {ShowRetiredSwitch} from "@/components/show-retired-switch.client";
import {GuideItemTypeEditor} from "@/components/catalog/guide-item-type-editor.client";
import {getGuideItemTypes} from "@/lib/catalog/catalog.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * The types a guide item can have, for super admins. Each type has one of the fixed kinds, which decides what its
 * items do. Retired types only when asked for.
 */
export default async function GuideItemTypesPage({searchParams}: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
    const retired = (await searchParams).retired === "1";

    return withPolicyPage(Policies.admin.requireSuperAdmin, async () => {
        const t = await getTranslations();
        const types = await getGuideItemTypes(retired);

        return (
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-bold tracking-tight">{t("GuideItemTypeAdmin.title")}</h2>
                    <ShowRetiredSwitch shown={retired} label={t("Catalog.showRetired")}/>
                </div>
                <p className="max-w-prose text-sm text-muted-foreground">{t("GuideItemTypeAdmin.description")}</p>
                <GuideItemTypeEditor entries={types}/>
            </div>
        );
    });
}
