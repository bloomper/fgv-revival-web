import * as React from "react";
import {Suspense} from "react";
import {notFound} from "next/navigation";
import {Skeleton} from "@/components/ui/skeleton";
import {ChecklistNav} from "@/components/checklist/checklist-nav.client";
import type {EventTemplate} from "@/components/checklist/event-checklist-dialog.client";
import {ReadOnlyNotice} from "@/components/revival/read-only-notice";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getRevivalChecklists} from "@/lib/checklist/checklist.server";
import {getEventChecklistTemplates} from "@/lib/checklist/template.server";
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

async function load(id: string) {
    try {
        return await getRevivalChecklists(id, null, true);
    } catch (error) {
        if (error instanceof GraphQLRequestError && (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")) {
            return null;
        }
        throw error;
    }
}

/**
 * A revival's checklists: the list of checklists beside the one open, as the checklist templates are under
 * Administration, kept here so moving between checklists only reloads the checklist. The layout cannot read the query,
 * so it fetches the cancelled event checklists too and the list hides them unless asked for.
 */
export default async function ChecklistsLayout({children, params}: {
    children: React.ReactNode;
    params: Promise<{ id: string }>
}) {
    const {id} = await params;

    return withPolicyPage(Policies.app.requireAccess, async ({roles}) => {
        const loaded = await load(id);

        if (!loaded) {
            notFound();
        }

        const {revival, checklists} = loaded;
        const canWrite = revival.permissions.canWriteLog;
        const templates = canWrite ? await eventTemplates() : [];

        return (
            <div className="flex flex-1 flex-col gap-4">
                <ReadOnlyNotice revivalId={revival.id} status={revival.status} canWrite={canWrite} roles={roles}/>
                <div className="flex flex-1 flex-col gap-6 lg:flex-row">
                    <Suspense fallback={<Skeleton className="h-96 lg:w-80 lg:shrink-0"/>}>
                        <ChecklistNav revivalId={revival.id} checklists={checklists} templates={templates}
                                      canWrite={canWrite}/>
                    </Suspense>
                    <div className="flex min-w-0 flex-1 flex-col">{children}</div>
                </div>
            </div>
        );
    });
}
