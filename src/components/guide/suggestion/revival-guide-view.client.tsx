"use client";

import {useTranslations} from "next-intl";
import {MessageSquarePlus, MessageSquareX, Plus} from "lucide-react";
import type {GuideVersionFieldsFragment} from "@/gql/graphql";
import {Button} from "@/components/ui/button";
import {GuideChapterView} from "@/components/guide/guide-view.client";
import {SuggestionDialog} from "@/components/guide/suggestion/suggestion-dialog.client";

/**
 * A chapter of a revival's guide, with suggestion controls for those who may suggest (FR-031).
 */
export function RevivalGuideChapter({chapter, number, versionId, revivalId, canSuggest}: {
    chapter: GuideVersionFieldsFragment["chapters"][number];
    number: number;
    versionId: string;
    revivalId: string;
    canSuggest: boolean;
}) {
    const t = useTranslations("Guide.suggest");

    if (!canSuggest) {
        return <GuideChapterView chapter={chapter} number={number}/>;
    }
    return (
        <GuideChapterView
            chapter={chapter}
            number={number}
            itemActions={item => (
                <>
                    <SuggestionDialog trigger={<Button variant="ghost" size="icon-sm" aria-label={t("change")} title={t("change")}/>}
                                      revivalId={revivalId} versionId={versionId} kind="CHANGE" item={item}>
                        <MessageSquarePlus/>
                    </SuggestionDialog>
                    <SuggestionDialog trigger={<Button variant="ghost" size="icon-sm" aria-label={t("remove")} title={t("remove")}/>}
                                      revivalId={revivalId} versionId={versionId} kind="REMOVE" item={item}>
                        <MessageSquareX/>
                    </SuggestionDialog>
                </>
            )}
            placeActions={place => (
                <SuggestionDialog trigger={<Button variant="ghost" size="sm"/>} revivalId={revivalId} versionId={versionId} kind="ADD" place={place}>
                    <Plus/>
                    {t("add")}
                </SuggestionDialog>
            )}
        />
    );
}
