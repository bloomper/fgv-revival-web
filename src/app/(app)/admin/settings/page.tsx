import {getTranslations} from "next-intl/server";
import {ApplicationSettingsForm} from "@/components/settings/application-settings-form.client";
import {getApplicationSettings} from "@/lib/settings/settings.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * The application settings, for super admins: the terms every participant accepts and the fee new revivals start with.
 */
export default async function ApplicationSettingsPage() {
    return withPolicyPage(Policies.admin.requireSuperAdmin, async () => {
        const t = await getTranslations("Settings");
        const settings = await getApplicationSettings();

        return (
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                <h2 className="text-lg font-bold tracking-tight">{t("title")}</h2>
                <p className="max-w-prose text-sm text-muted-foreground">{t("intro")}</p>
                {settings && <ApplicationSettingsForm settings={settings}/>}
            </div>
        );
    });
}
