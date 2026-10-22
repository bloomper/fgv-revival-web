"use client";

import {useState, useTransition} from "react";
import {useLocale, useTranslations} from "next-intl";
import {ArrowRightLeft} from "lucide-react";
import type {GuideChangesQuery, RevivalGuideVersionChangeImpactQuery} from "@/gql/graphql";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {changeGuideVersionAction, guideChangesAction, guideVersionChangeImpactAction} from "@/app/(app)/revivals/[id]/guide/actions.server";
import {GuideChanges} from "@/components/guide/guide-changes.client";
import {pickText} from "@/components/guide/localized";
import {RemovalWarning} from "@/components/guide/removal-warning.client";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {track} from "@/utils/umami";

type Version = { id: string; label?: string | null };
type Removal = NonNullable<RevivalGuideVersionChangeImpactQuery["revival"]>["guideVersionChangeImpact"][number];

/**
 * Moves the revival to another published version, after showing what changed (FR-020). When the version lacks
 * chapters the revival has checklists for, those checklists are deleted with the move, so they are listed and the user
 * must confirm. Offered only with versions the server allows.
 */
export function GuideVersionChangeDialog({revivalId, current, allowed}: { revivalId: string; current: Version | null; allowed: Version[] }) {
    const t = useTranslations();
    const locale = useLocale();
    const feedback = useActionFeedback();
    const [open, setOpen] = useState(false);
    const [target, setTarget] = useState<string>("");
    const [changes, setChanges] = useState<GuideChangesQuery["guideChanges"] | null>(null);
    const [removals, setRemovals] = useState<Removal[] | null>(null);
    const [confirmed, setConfirmed] = useState(false);
    const [pending, startTransition] = useTransition();

    if (allowed.length === 0) {
        return null;
    }

    const choose = (id: string) => {
        setTarget(id);
        setChanges(null);
        setRemovals(null);
        setConfirmed(false);
        if (id) {
            startTransition(async () => {
                const [changed, removed] = await Promise.all([
                    current ? guideChangesAction(current.id, id) : null,
                    guideVersionChangeImpactAction(revivalId, id),
                ]);

                if (changed?.ok) {
                    setChanges(changed.data);
                }
                setRemovals(removed.ok ? removed.data : []);
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button variant="outline"/>}>
                <ArrowRightLeft/>
                {t("Guide.version.change")}
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{t("Guide.version.changeTitle")}</DialogTitle>
                    <DialogDescription>{t("Guide.version.changeDescription", {label: current?.label ?? "–"})}</DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    <Label htmlFor="guide-version-target">{t("Guide.version.target")}</Label>
                    <select id="guide-version-target" value={target} onChange={event => choose(event.target.value)}
                            className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-xs">
                        <option value="">{t("Guide.version.choose")}</option>
                        {allowed.map(version => <option key={version.id} value={version.id}>{version.label}</option>)}
                    </select>
                </div>
                {removals && removals.length > 0 && (
                    <RemovalWarning title={t("Guide.version.removalTitle", {count: removals.length})} confirmLabel={t("Guide.version.removalConfirm")}
                                    confirmed={confirmed} onConfirmedChange={setConfirmed}>
                        <p>{t("Guide.version.removalDescription")}</p>
                        <ul className="mt-2 list-disc space-y-1 pl-5">
                            {removals.map(removal => (
                                <li key={removal.checklistId}>
                                    <span className="font-medium">{removal.chapterTitle ? pickText(removal.chapterTitle, locale).text : removal.chapterKey}</span>
                                    {": "}
                                    {t("Guide.version.removalCounts", {items: removal.itemCount, done: removal.doneCount, log: removal.linkedLogEntryCount})}
                                </li>
                            ))}
                        </ul>
                    </RemovalWarning>
                )}
                {changes && (
                    <div className="max-h-96 overflow-y-auto rounded-md border p-3">
                        <GuideChanges changes={changes}/>
                    </div>
                )}
                <DialogFooter>
                    <Button
                        variant={removals && removals.length > 0 ? "destructive" : "default"}
                        disabled={!target || pending || (!!current && !changes) || !removals || (removals.length > 0 && !confirmed)}
                        onClick={() => startTransition(async () => {
                            const result = await changeGuideVersionAction({revivalId, fromVersionId: current?.id ?? null, toVersionId: target});

                            if (feedback(result, t("Guide.version.changed"))) {
                                track("guide-version-change");
                                setOpen(false);
                            }
                        })}
                    >
                        {t("Guide.version.confirm")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
