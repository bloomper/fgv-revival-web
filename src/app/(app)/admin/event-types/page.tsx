import {getTranslations} from "next-intl/server";
import {ShowRetiredSwitch} from "@/components/show-retired-switch.client";
import {EventTypeEditor} from "@/components/event/event-type-editor.client";
import {getEventChecklistTemplates} from "@/lib/checklist/template.server";
import {getEventTypes} from "@/lib/event/event.server";
import {getBudgetCategories} from "@/lib/budget/reference.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * The kinds of events the guide's example timeline names, for super admins (M4-FR-1): what each is, when it is
 * proposed relative to the premiere, the checklist its events get and the budget lines it proposes. Retired ones only when asked for.
 */
export default async function EventTypesPage({searchParams}: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
    const retired = (await searchParams).retired === "1";

    return withPolicyPage(Policies.admin.requireSuperAdmin, async () => {
        const t = await getTranslations();
        const [types, templates, categories] = await Promise.all([getEventTypes(retired), getEventChecklistTemplates(), getBudgetCategories()]);

        return (
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-bold tracking-tight">{t("EventType.title")}</h2>
                    <ShowRetiredSwitch shown={retired} label={t("Catalog.showRetired")}/>
                </div>
                <p className="max-w-prose text-sm text-muted-foreground">{t("EventType.intro")}</p>
                <EventTypeEditor types={types} templates={templates.filter(template => template.kind === "EVENT")} categories={categories}/>
            </div>
        );
    });
}
