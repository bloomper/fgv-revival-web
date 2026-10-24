import {getTranslations} from "next-intl/server";
import {ShowRetiredSwitch} from "@/components/show-retired-switch.client";
import {LinkServiceEditor} from "@/components/material/link-service-editor.client";
import {getLinkServices} from "@/lib/material/material.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * The services materials' links lead to, for super admins (M8-FR-1): FGV's own applications and services such as
 * Google Drive, with the hosts that recognise them. Retired ones only when asked for.
 */
export default async function LinkServicesPage({searchParams}: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
    const retired = (await searchParams).retired === "1";

    return withPolicyPage(Policies.admin.requireSuperAdmin, async () => {
        const t = await getTranslations();
        const services = await getLinkServices(retired);

        return (
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-bold tracking-tight">{t("LinkServiceAdmin.title")}</h2>
                    <ShowRetiredSwitch shown={retired} label={t("Catalog.showRetired")}/>
                </div>
                <p className="max-w-prose text-sm text-muted-foreground">{t("LinkServiceAdmin.description")}</p>
                <LinkServiceEditor entries={services}/>
            </div>
        );
    });
}
