import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {ChecklistFilters} from "@/components/checklist/checklist-filters";
import {ChecklistItemList} from "@/components/checklist/checklist-item-list";
import {ChecklistOverview} from "@/components/checklist/checklist-overview";
import {EventChecklistDialog, type EventTemplate} from "@/components/checklist/event-checklist-dialog.client";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getRevivalChecklists} from "@/lib/checklist/checklist.server";
import {getEventChecklistTemplates} from "@/lib/checklist/template.server";
import {type ChecklistFilterValues, parseChecklistFilter} from "@/lib/checklist/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

async function eventTemplates(): Promise<EventTemplate[]> {
    try {
        return await getEventChecklistTemplates();
    } catch (error) {
        if (error instanceof GraphQLRequestError && error.code === "FORBIDDEN") {
            return [];
        }
        throw error;
    }
}

async function load(id: string, filter: ChecklistFilterValues | null, cancelled: boolean) {
    try {
        return await getRevivalChecklists(id, filter, cancelled);
    } catch (error) {
        if (error instanceof GraphQLRequestError && (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")) {
            return null;
        }
        throw error;
    }
}

/**
 * A revival's checklists: one per guide chapter and its events, or, with a filter, the matching items across them (M3 US4).
 * Cancelled event checklists only when asked for (FR-023).
 */
export default async function ChecklistsPage({params, searchParams}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const {id} = await params;
    const query = await searchParams;
    const filter = parseChecklistFilter(query);
    const cancelled = query.cancelled === "1";

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const loaded = await load(id, filter, cancelled);

        if (!loaded) {
            notFound();
        }

        const t = await getTranslations("Checklist");
        const {revival, checklists, items} = loaded;
        const templates = revival.permissions.canWriteLog ? await eventTemplates() : [];

        return (
            <div className="flex flex-1 flex-col gap-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-1">
                        <h3 className="sr-only">{t("title")}</h3>
                    </div>
                    {revival.permissions.canWriteLog && <EventChecklistDialog revivalId={revival.id} templates={templates}/>}
                </div>
                <ChecklistFilters revivalId={revival.id} filter={filter}/>
                {items ? <ChecklistItemList revivalId={revival.id} items={items}/> : <ChecklistOverview revivalId={revival.id} checklists={checklists} showCancelled={cancelled}/>}
            </div>
        );
    });
}
