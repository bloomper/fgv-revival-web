import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {ChecklistItemList} from "@/components/checklist/checklist-item-list";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getRevivalChecklists} from "@/lib/checklist/checklist.server";
import {type ChecklistFilterValues, parseChecklistFilter} from "@/lib/checklist/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

async function load(id: string, filter: ChecklistFilterValues) {
    try {
        return await getRevivalChecklists(id, filter, false);
    } catch (error) {
        if (error instanceof GraphQLRequestError && (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")) {
            return null;
        }
        throw error;
    }
}

/**
 * A revival's checklists (M3 US4). The list is in the layout; with a filter, this is the matching items across every
 * checklist (FR-028), otherwise, from {@code lg}, the room beside the list until a checklist is picked.
 */
export default async function ChecklistsPage({params, searchParams}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const {id} = await params;
    const filter = parseChecklistFilter(await searchParams);

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const t = await getTranslations("Checklist");

        if (!filter) {
            return (
                <div className="hidden flex-1 items-center justify-center rounded-lg border border-dashed p-8 text-sm text-muted-foreground lg:flex">
                    <h3 className="sr-only">{t("title")}</h3>
                    {t("choose")}
                </div>
            );
        }

        const loaded = await load(id, filter);

        if (!loaded) {
            notFound();
        }

        return (
            <div className="flex flex-col gap-4">
                <h3 className="text-base font-semibold tracking-tight">{t("matches")}</h3>
                <ChecklistItemList revivalId={loaded.revival.id} items={loaded.items ?? []}/>
            </div>
        );
    });
}
