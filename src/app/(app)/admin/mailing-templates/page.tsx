import {getTranslations} from "next-intl/server";
import {ShowRetiredSwitch} from "@/components/show-retired-switch.client";
import {MailingTemplateEditor} from "@/components/mailing/mailing-template-editor.client";
import {getEventTypes} from "@/lib/event/event.server";
import {getMailingTemplates} from "@/lib/mailing/mailing.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";
import {Page, PageHeader} from "@bloomper/fgv-web-ui/shell/page-header";

/**
 * The mailing plan for super admins: the mailings every revival should send, each relative to an event
 * type's events or to the premiere, in order. Retired ones only when asked for.
 */
export default async function MailingTemplatesPage({searchParams}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
    const retired = (await searchParams).retired === "1";

    return withPolicyPage(Policies.admin.requireSuperAdmin, async () => {
        const t = await getTranslations();
        const [templates, eventTypes] = await Promise.all([getMailingTemplates(retired), getEventTypes()]);

        return (
            <Page variant="content">
                <PageHeader title={t("MailingTemplate.title")} actions={<ShowRetiredSwitch shown={retired} label={t("Catalog.showRetired")}/>}/>
                <p className="max-w-prose text-sm text-muted-foreground">{t("MailingTemplate.intro")}</p>
                <MailingTemplateEditor templates={templates} eventTypes={eventTypes}/>
            </Page>
        );
    });
}
