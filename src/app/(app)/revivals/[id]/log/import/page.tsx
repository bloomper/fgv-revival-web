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
 * Imports the revival's existing Excel log, once, by its directeur (M3 US2). Anyone else gets not found.
 */
export default async function LogImportPage({params}: { params: Promise<{ id: string }> }) {
    const {id} = await params;

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const loaded = await load(id);

        if (!loaded?.revival.permissions.canImportLog) {
            notFound();
        }

        const t = await getTranslations("Log.import");

        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
                <div className="space-y-1">
                    <Link href={`/revivals/${id}/log`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
                        <ArrowLeft className="size-4"/>
                        {loaded.revival.workingTitle}
                    </Link>
                    <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
                    <p className="max-w-2xl text-sm text-muted-foreground">{t("description")}</p>
                </div>
                <LogImportWizard revivalId={id}/>
            </div>
        );
    });
}
