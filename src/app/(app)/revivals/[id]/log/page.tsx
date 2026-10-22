import Link from "next/link";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {FileUp} from "lucide-react";
import {buttonVariants} from "@/components/ui/button";
import {LogFilters} from "@/components/decision-log/log-filters.client";
import {LogTable} from "@/components/decision-log/log-table.client";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getRevivalLog} from "@/lib/decision-log/log.server";
import {parseLogFilter} from "@/lib/decision-log/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

async function load(id: string, filter: ReturnType<typeof parseLogFilter>) {
    try {
        return await getRevivalLog(id, filter);
    } catch (error) {
        if (error instanceof GraphQLRequestError && (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")) {
            return null;
        }
        throw error;
    }
}

/**
 * A revival's decision log, filtered by the URL query (M3 FR-012). A revival the user cannot see is not found.
 */
export default async function RevivalLogPage({params, searchParams}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const {id} = await params;
    const filter = parseLogFilter(await searchParams);

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const loaded = await load(id, filter);

        if (!loaded) {
            notFound();
        }

        const t = await getTranslations("Log");
        const {revival, entries, tags, meetings} = loaded;
        const filtered = Object.values(filter).some(value => value !== undefined);

        return (
            <div className="flex flex-1 flex-col gap-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-1">
                        <h3 className="sr-only">{t("title")}</h3>
                    </div>
                    {(revival.permissions.canImportLog || revival.permissions.canWaiveRequirement) && (
                        <Link href={`/revivals/${revival.id}/log/import`} className={buttonVariants({variant: "outline"})}>
                            <FileUp/>
                            {t("import.title")}
                        </Link>
                    )}
                </div>
                <LogFilters key={JSON.stringify(filter)} filter={filter} tags={tags} meetings={meetings}/>
                <LogTable revivalId={revival.id} entries={entries} members={revival.ownerCandidates} tags={tags}
                          canWrite={revival.permissions.canWriteLog} emptyMessage={filtered ? t("noMatches") : t("empty")}/>
            </div>
        );
    });
}
