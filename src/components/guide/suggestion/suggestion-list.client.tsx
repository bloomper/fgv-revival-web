"use client";

import type {ReactNode} from "react";
import {useTransition} from "react";
import {useLocale, useTranslations} from "next-intl";
import type {GuideSuggestionFieldsFragment} from "@/gql/graphql";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {withdrawSuggestionAction} from "@/app/(app)/revivals/[id]/guide/actions.server";
import {GuideMarkdown} from "@/components/guide/guide-markdown";
import {GuideTypeBadge} from "@/components/guide/guide-type-badge";
import {pickText} from "@/components/guide/localized";
import {useActionFeedback} from "@/hooks/use-action-feedback";

const STATUS_VARIANTS = {OPEN: "default", ACCEPTED: "secondary", REJECTED: "destructive", WITHDRAWN: "outline"} as const;

/**
 * Suggestions with their outcome (FR-035). The author may withdraw their own open ones; {@code actions} adds the super
 * admin's controls.
 */
export function SuggestionList({suggestions, actions, showRevival = false}: {
    suggestions: GuideSuggestionFieldsFragment[];
    actions?: (suggestion: GuideSuggestionFieldsFragment) => ReactNode;
    showRevival?: boolean;
}) {
    const t = useTranslations("Guide.suggestions");
    const locale = useLocale();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();

    if (suggestions.length === 0) {
        return <p className="text-sm text-muted-foreground">{t("none")}</p>;
    }

    return (
        <ul className="space-y-3">
            {suggestions.map(suggestion => (
                <li key={suggestion.id} className="space-y-2 rounded-md border p-3" data-testid={`suggestion-${suggestion.id}`}>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        <Badge variant={STATUS_VARIANTS[suggestion.status]}>{t(`status.${suggestion.status}`)}</Badge>
                        <span className="font-medium">{t(`kind.${suggestion.kind}`)}</span>
                        <span className="text-muted-foreground">
                            {t("where", {chapter: suggestion.chapterTitle ? pickText(suggestion.chapterTitle, locale).text : "–", version: suggestion.madeOn.label ?? ""})}
                            {showRevival && ` · ${suggestion.revival.title}`}
                            {" · "}{suggestion.author}
                        </span>
                        <div className="ml-auto flex gap-1">
                            {suggestion.mine && suggestion.status === "OPEN" && (
                                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" disabled={pending} onClick={() => startTransition(async () => {
                                    feedback(await withdrawSuggestionAction({id: suggestion.id, version: suggestion.version, revivalId: suggestion.revival.id}), t("withdrawn"));
                                })}>
                                    {t("withdraw")}
                                </Button>
                            )}
                            {actions?.(suggestion)}
                        </div>
                    </div>
                    {suggestion.item && (
                        <div className="rounded bg-muted/40 p-2 text-sm">
                            <span className="text-xs text-muted-foreground">{t("now")}</span>
                            <GuideMarkdown>{pickText(suggestion.item.text, locale).text}</GuideMarkdown>
                        </div>
                    )}
                    {(suggestion.proposedType || suggestion.proposedText) && (
                        <div className="space-y-1 rounded bg-muted/40 p-2 text-sm">
                            <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                {t("proposed")}
                                {suggestion.proposedType && <GuideTypeBadge type={suggestion.proposedType}/>}
                            </span>
                            {suggestion.proposedText && <GuideMarkdown>{pickText(suggestion.proposedText, locale).text}</GuideMarkdown>}
                        </div>
                    )}
                    {suggestion.reason && <p className="text-sm"><span className="text-muted-foreground">{t("reason")}:</span> {suggestion.reason}</p>}
                    {suggestion.decisionReason && (
                        <p className="text-sm"><span className="text-muted-foreground">{t("decision", {name: suggestion.decidedBy ?? ""})}:</span> {suggestion.decisionReason}</p>
                    )}
                    {suggestion.publishedIn && <p className="text-sm text-muted-foreground">{t("publishedIn", {label: suggestion.publishedIn.label ?? ""})}</p>}
                    {suggestion.reopenedAt && suggestion.status === "OPEN" && <p className="text-sm text-muted-foreground">{t("reopened")}</p>}
                </li>
            ))}
        </ul>
    );
}
