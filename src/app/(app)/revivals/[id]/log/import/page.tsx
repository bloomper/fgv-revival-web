import Link from "next/link";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {ArrowLeft} from "lucide-react";
import {LogImportWizard} from "@/components/decision-log/log-import-wizard.client";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getRevivalLogImport} from "@/lib/decision-log/log.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

async function load(id: string) {
    try {
        return await getRevivalLogImport(id);
    } catch (error) {
        if (error instanceof GraphQLRequestError && (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")) {
            return null;
        }
        throw error;
    }
}

/**
 * Imports the revival's existing Excel log, once, by its directeur (M3 US2). A directeur whose log already has rows is
 * told why the import is closed; anyone else gets not found.
 */
export default async function LogImportPage({params}: { params: Promise<{ id: string }> }) {
    const {id} = await params;

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const loaded = await load(id);

        const directeur = loaded?.revival.permissions.canWaiveRequirement ?? false;

        if (!loaded || (!loaded.revival.permissions.canImportLog && !directeur)) {
            notFound();
        }

        const t = await getTranslations("Log.import");
        const {canImportLog} = loaded.revival.permissions;

        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
                <div className="space-y-1">
                    <Link href={`/revivals/${id}/log`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
                        <ArrowLeft className="size-4"/>
                        {loaded.revival.workingTitle}
                    </Link>
                    <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
                    {canImportLog && <p className="max-w-2xl text-sm text-muted-foreground">{t("description")}</p>}
                </div>
                {canImportLog ? <LogImportWizard revivalId={id}/> : (
                    <p className="max-w-2xl text-sm">
                        {loaded.logImport ? t("alreadyImported", {fileName: loaded.logImport.fileName, count: loaded.logImport.rowCount}) : t("logNotEmpty")}
                    </p>
                )}
            </div>
        );
    });
}
