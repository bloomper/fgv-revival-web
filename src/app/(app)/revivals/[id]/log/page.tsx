import Link from "next/link";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {ArrowLeft, FileUp} from "lucide-react";
import {Button} from "@/components/ui/button";
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
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-1">
                        <Link href={`/revivals/${revival.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
                            <ArrowLeft className="size-4"/>
                            {revival.workingTitle}
                        </Link>
                        <h2 className="text-lg font-bold tracking-tight">{t("title")}</h2>
                    </div>
                    {(revival.permissions.canImportLog || revival.permissions.canWaiveRequirement) && (
                        <Button nativeButton={false} variant="outline" render={<Link href={`/revivals/${revival.id}/log/import`}/>}>
                            <FileUp/>
                            {t("import.title")}
                        </Button>
                    )}
                </div>
                <LogFilters key={JSON.stringify(filter)} filter={filter} tags={tags} meetings={meetings}/>
                <LogTable revivalId={revival.id} entries={entries} members={revival.ownerCandidates} tags={tags}
                          canWrite={revival.permissions.canWriteLog} emptyMessage={filtered ? t("noMatches") : t("empty")}/>
            </div>
        );
    });
}
