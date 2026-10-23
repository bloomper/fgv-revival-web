import Link from "next/link";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {ArrowLeft, MessageSquarePlus} from "lucide-react";
import {Button} from "@/components/ui/button";
import {CatalogProvider} from "@/components/catalog/catalog-provider.client";
import {SuggestionDialog} from "@/components/guide/suggestion/suggestion-dialog.client";
import {SuggestionList} from "@/components/guide/suggestion/suggestion-list.client";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getGuideItemTypes} from "@/lib/catalog/catalog.server";
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
        const tGuide = await getTranslations("Guide");
        const {revival, version} = loaded;
        const canSuggest = revival.permissions.canSuggestGuideChange && !!version;
        const [suggestions, itemTypes] = await Promise.all([getGuideSuggestions(null, id), canSuggest ? getGuideItemTypes() : []]);

        return (
            <div className="flex flex-1 flex-col gap-4">
                <Link href={`/revivals/${id}/guide`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
                    <ArrowLeft className="size-4"/>
                    {t("backToGuide")}
                </Link>
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-semibold tracking-tight">{t("revivalTitle", {revival: revival.title})}</h3>
                    {canSuggest && version && (
                        <CatalogProvider itemTypes={itemTypes}>
                            <SuggestionDialog trigger={<Button/>} revivalId={revival.id} versionId={version.id} kind="ADD"
                                              chapters={version.chapters.map(chapter => ({key: chapter.key, title: chapter.title}))}>
                                <MessageSquarePlus/>
                                {tGuide("suggest.add")}
                            </SuggestionDialog>
                        </CatalogProvider>
                    )}
                </div>
                <SuggestionList suggestions={suggestions}/>
            </div>
        );
    });
}
