import {getTranslations} from "next-intl/server";
import {ApplicationSettingsForm} from "@/components/settings/application-settings-form.client";
import {getApplicationSettings} from "@/lib/settings/settings.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";
import {Page, PageHeader} from "@bloomper/fgv-web-ui/shell/page-header";

/**
 * The application settings, for super admins: the terms every participant accepts and the fee new revivals start with.
 */
export default async function ApplicationSettingsPage() {
    return withPolicyPage(Policies.admin.requireSuperAdmin, async () => {
        const t = await getTranslations("Settings");
        const settings = await getApplicationSettings();

        return (
            <Page variant="content">
                <PageHeader title={t("title")} description={t("intro")}/>
                {settings && <ApplicationSettingsForm settings={settings}/>}
            </Page>
        );
    });
}
