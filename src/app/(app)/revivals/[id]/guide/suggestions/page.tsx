import Link from "next/link";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {ArrowLeft} from "lucide-react";
import {SuggestionList} from "@/components/guide/suggestion/suggestion-list.client";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getGuideSuggestions, getRevivalGuide} from "@/lib/guide/guide.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * The suggestions made from a revival, with their outcome (FR-035).
 */
export default async function RevivalGuideSuggestionsPage({params}: { params: Promise<{ id: string }> }) {
    const {id} = await params;

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const loaded = await getRevivalGuide(id).catch((error: unknown) => {
            if (error instanceof GraphQLRequestError && (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")) {
                return null;
            }
            throw error;
        });

        if (!loaded) {
            notFound();
        }

        const t = await getTranslations("Guide.suggestions");
        const suggestions = await getGuideSuggestions(null, id);

        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
                <Link href={`/revivals/${id}/guide`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
                    <ArrowLeft className="size-4"/>
                    {t("backToGuide")}
                </Link>
                <h2 className="text-lg font-bold tracking-tight">{t("revivalTitle", {revival: loaded.revival.workingTitle})}</h2>
                <SuggestionList suggestions={suggestions}/>
            </div>
        );
    });
}
