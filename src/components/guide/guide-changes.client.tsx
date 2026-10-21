"use client";

import {useLocale, useTranslations} from "next-intl";
import type {GuideChangesQuery} from "@/gql/graphql";
import {Badge} from "@/components/ui/badge";
import {GuideMarkdown} from "@/components/guide/guide-markdown";
import {GuideTypeBadge} from "@/components/guide/guide-type-badge";
import {pickText} from "@/components/guide/localized";

type Changes = GuideChangesQuery["guideChanges"];
type ItemChange = Changes["items"][number];

const PHASES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"] as const;

/**
 * What changed between two versions, grouped by chapter (FR-016, research R5).
 */
export function GuideChanges({changes}: { changes: Changes }) {
    const t = useTranslations("Guide.changes");
    const locale = useLocale();
    const text = (value: { sv: string; en?: string | null } | null | undefined) => value ? pickText(value, locale).text : "";
    const phaseOf = (change: ItemChange) => change.after?.phase ?? change.before?.phase;
    const empty = changes.introductionChanged.length === 0 && changes.chapters.length === 0 && changes.sections.length === 0 && changes.items.length === 0;

    if (empty) {
        return <p className="text-sm text-muted-foreground">{t("none")}</p>;
    }

    return (
        <div className="space-y-6">
            {changes.introductionChanged.length > 0 && (
                <p className="text-sm"><Badge variant="secondary">{t("introduction")}</Badge></p>
            )}
            {PHASES.map(phase => {
                const chapter = changes.chapters.find(change => change.phase === phase);
                const sections = changes.sections.filter(change => (change.phaseAfter ?? change.phaseBefore) === phase);
                const items = changes.items.filter(change => phaseOf(change) === phase);

                if (!chapter && sections.length === 0 && items.length === 0) {
                    return null;
                }
                return (
                    <section key={phase} className="space-y-3" aria-label={t("chapter", {phase})}>
                        <h3 className="text-lg font-semibold">{t("chapter", {phase})}</h3>
                        {chapter && (
                            <p className="text-sm">
                                <Badge variant="secondary">{t("renamed")}</Badge>{" "}
                                <span className="line-through">{text(chapter.before)}</span> → {text(chapter.after)}
                            </p>
                        )}
                        {sections.map(change => (
                            <p key={change.key} className="flex flex-wrap items-center gap-2 text-sm">
                                <Badge variant={change.kind === "REMOVED" ? "destructive" : change.kind === "ADDED" ? "default" : "secondary"}>
                                    {t(`kind.${change.kind}`)}
                                </Badge>
                                <span>{t("section")} {text(change.after ?? change.before)}</span>
                                {change.renamed.length > 0 && <Badge variant="outline">{t("renamed")}</Badge>}
                                {change.moved && <Badge variant="outline">{t("moved")}</Badge>}
                                {change.reordered && <Badge variant="outline">{t("reordered")}</Badge>}
                            </p>
                        ))}
                        <ul className="space-y-2">
                            {items.map(change => (
                                <li key={change.key} className="space-y-2 rounded-md border p-3" data-testid={`change-${change.key}`}>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant={change.kind === "REMOVED" ? "destructive" : change.kind === "ADDED" ? "default" : "secondary"}>
                                            {t(`kind.${change.kind}`)}
                                        </Badge>
                                        {(change.after ?? change.before) && <GuideTypeBadge type={(change.after ?? change.before)!.type}/>}
                                        {change.reworded.map(language => <Badge key={language} variant="outline">{t("reworded", {language})}</Badge>)}
                                        {change.retyped && <Badge variant="outline">{t("retyped")}</Badge>}
                                        {change.moved && <Badge variant="outline">{t("moved")}</Badge>}
                                    </div>
                                    {change.before && change.after && change.reworded.length > 0 ? (
                                        <div className="grid gap-2 md:grid-cols-2">
                                            <div className="rounded bg-muted/50 p-2 text-sm"><GuideMarkdown>{text(change.before.text)}</GuideMarkdown></div>
                                            <div className="rounded bg-muted/50 p-2 text-sm"><GuideMarkdown>{text(change.after.text)}</GuideMarkdown></div>
                                        </div>
                                    ) : (
                                        <div className="text-sm"><GuideMarkdown>{text((change.after ?? change.before)?.text)}</GuideMarkdown></div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </section>
                );
            })}
        </div>
    );
}
