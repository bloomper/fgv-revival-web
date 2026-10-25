import {getTranslations} from "next-intl/server";
import {ShowRetiredSwitch} from "@/components/show-retired-switch.client";
import {MailingTemplateEditor} from "@/components/mailing/mailing-template-editor.client";
import {getEventTypes} from "@/lib/event/event.server";
import {getMailingTemplates} from "@/lib/mailing/mailing.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

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
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-bold tracking-tight">{t("MailingTemplate.title")}</h2>
                    <ShowRetiredSwitch shown={retired} label={t("Catalog.showRetired")}/>
                </div>
                <p className="max-w-prose text-sm text-muted-foreground">{t("MailingTemplate.intro")}</p>
                <MailingTemplateEditor templates={templates} eventTypes={eventTypes}/>
            </div>
        );
    });
}
