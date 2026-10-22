import Link from "next/link";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {ArrowLeft} from "lucide-react";
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

async function load(id: string, filter: ChecklistFilterValues | null) {
    try {
        return await getRevivalChecklists(id, filter);
    } catch (error) {
        if (error instanceof GraphQLRequestError && (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")) {
            return null;
        }
        throw error;
    }
}

/**
 * A revival's checklists: the phases A–J and its events, or, with a filter, the matching items across them (M3 US4).
 */
export default async function ChecklistsPage({params, searchParams}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const {id} = await params;
    const filter = parseChecklistFilter(await searchParams);

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const loaded = await load(id, filter);

        if (!loaded) {
            notFound();
        }

        const t = await getTranslations("Checklist");
        const {revival, checklists, items} = loaded;
        const templates = revival.permissions.canWriteLog ? await eventTemplates() : [];

        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-1">
                        <Link href={`/revivals/${revival.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
                            <ArrowLeft className="size-4"/>
                            {revival.workingTitle}
                        </Link>
                        <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
                    </div>
                    {revival.permissions.canWriteLog && <EventChecklistDialog revivalId={revival.id} templates={templates}/>}
                </div>
                <ChecklistFilters revivalId={revival.id} filter={filter}/>
                {items ? <ChecklistItemList revivalId={revival.id} items={items}/> : <ChecklistOverview revivalId={revival.id} checklists={checklists}/>}
            </div>
        );
    });
}
