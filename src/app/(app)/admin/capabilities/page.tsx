import {getTranslations} from "next-intl/server";
import {ShowRetiredSwitch} from "@/components/show-retired-switch.client";
import {CapabilityEditor} from "@/components/catalog/capability-editor.client";
import {getCapabilities} from "@/lib/catalog/catalog.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * The areas of responsibility steering group members hold, for super admins. Retired ones only when asked for.
 */
export default async function CapabilitiesPage({searchParams}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
    const retired = (await searchParams).retired === "1";

    return withPolicyPage(Policies.admin.requireSuperAdmin, async () => {
        const t = await getTranslations();
        const capabilities = await getCapabilities(retired);

        return (
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-bold tracking-tight">{t("CapabilityAdmin.title")}</h2>
                    <ShowRetiredSwitch shown={retired} label={t("Catalog.showRetired")}/>
                </div>
                <p className="max-w-prose text-sm text-muted-foreground">{t("CapabilityAdmin.description")}</p>
                <CapabilityEditor entries={capabilities}/>
            </div>
        );
    });
}
