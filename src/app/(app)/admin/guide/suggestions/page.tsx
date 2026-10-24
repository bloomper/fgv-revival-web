import Link from "next/link";
import {getTranslations} from "next-intl/server";
import {ArrowLeft} from "lucide-react";
import type {GuideSuggestionStatus} from "@/gql/graphql";
import {CatalogProvider} from "@/components/catalog/catalog-provider.client";
import {AdminSuggestionList, type DraftItems} from "@/components/guide/suggestion/admin-suggestion-list.client";
import {getGuideItemTypes} from "@/lib/catalog/catalog.server";
import {getGuideDraft, getGuideSuggestions} from "@/lib/guide/guide.server";
import {SUGGESTION_STATUSES} from "@/lib/guide/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * Suggestions for super admins to accept into the draft or reject (US5, FR-033).
 */
export default async function AdminGuideSuggestionsPage({searchParams}: {
    searchParams: Promise<{ status?: string }>
}) {
    const {status} = await searchParams;

    return withPolicyPage(Policies.admin.requireSuperAdmin, async () => {
        const t = await getTranslations("Guide.suggestions");
        const filter = SUGGESTION_STATUSES.find(candidate => candidate === status) ?? "OPEN";
        const [suggestions, draft, itemTypes] = await Promise.all([getGuideSuggestions([filter as GuideSuggestionStatus], null), getGuideDraft(), getGuideItemTypes()]);
        const draftItems: DraftItems = Object.fromEntries((draft?.draft.chapters ?? [])
            .flatMap(chapter => [...chapter.items, ...chapter.sections.flatMap(section => section.items)])
            .map(item => [item.key, {type: item.type, text: item.text}]));

        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
                <Link href="/admin/guide"
                      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
                    <ArrowLeft className="size-4"/>
                    {t("back")}
                </Link>
                <h2 className="text-lg font-bold tracking-tight">{t("title")}</h2>
                <nav aria-label={t("filter")} className="flex flex-wrap gap-3 text-sm">
                    {SUGGESTION_STATUSES.map(candidate => (
                        <Link key={candidate} href={`/admin/guide/suggestions?status=${candidate}`}
                              aria-current={candidate === filter ? "page" : undefined}
                              className={candidate === filter ? "font-semibold" : "underline-offset-2 hover:underline"}>
                            {t(`status.${candidate}`)}
                        </Link>
                    ))}
                </nav>
                <CatalogProvider itemTypes={itemTypes}>
                    <AdminSuggestionList suggestions={suggestions} draftItems={draftItems}/>
                </CatalogProvider>
            </div>
        );
    });
}
