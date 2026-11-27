import {getTranslations} from "next-intl/server";
import {ShowRetiredSwitch} from "@/components/show-retired-switch.client";
import {EventTypeEditor} from "@/components/event/event-type-editor.client";
import {getEventChecklistTemplates} from "@/lib/checklist/template.server";
import {getEventTypes} from "@/lib/event/event.server";
import {getBudgetCategories} from "@/lib/budget/reference.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";
import {Page, PageHeader} from "@bloomper/fgv-web-ui/shell/page-header";

/**
 * The kinds of events the guide's example timeline names, for super admins: what each is, when it is proposed relative
 * to the premiere, the checklist its events get and the budget lines it proposes. Retired ones only when asked for.
 */
export default async function EventTypesPage({searchParams}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
    const retired = (await searchParams).retired === "1";

    return withPolicyPage(Policies.admin.requireSuperAdmin, async () => {
        const t = await getTranslations();
        const [types, templates, categories] = await Promise.all([getEventTypes(retired), getEventChecklistTemplates(), getBudgetCategories()]);

        return (
            <Page variant="content">
                <PageHeader title={t("EventType.title")} actions={<ShowRetiredSwitch shown={retired} label={t("Catalog.showRetired")}/>}/>
                <p className="max-w-prose text-sm text-muted-foreground">{t("EventType.intro")}</p>
                <EventTypeEditor types={types} templates={templates.filter(template => template.kind === "EVENT")}
                                 categories={categories}/>
            </Page>
        );
    });
}
