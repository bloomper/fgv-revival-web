"use client";

import {useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {ArrowRightLeft} from "lucide-react";
import type {GuideChangesQuery} from "@/gql/graphql";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {changeGuideVersionAction, guideChangesAction} from "@/app/(app)/revivals/[id]/guide/actions.server";
import {GuideChanges} from "@/components/guide/guide-changes.client";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {track} from "@/utils/umami";

type Version = { id: string; label?: string | null };

/**
 * Moves the revival to another published version, after showing what changed (FR-020). Offered only with versions the
 * server allows.
 */
export function GuideVersionChangeDialog({revivalId, current, allowed}: { revivalId: string; current: Version | null; allowed: Version[] }) {
    const t = useTranslations();
    const feedback = useActionFeedback();
    const [open, setOpen] = useState(false);
    const [target, setTarget] = useState<string>("");
    const [changes, setChanges] = useState<GuideChangesQuery["guideChanges"] | null>(null);
    const [pending, startTransition] = useTransition();

    if (allowed.length === 0) {
        return null;
    }

    const choose = (id: string) => {
        setTarget(id);
        setChanges(null);
        if (id && current) {
            startTransition(async () => {
                const result = await guideChangesAction(current.id, id);

                if (result.ok) {
                    setChanges(result.data);
                }
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
                {changes && (
                    <div className="max-h-96 overflow-y-auto rounded-md border p-3">
                        <GuideChanges changes={changes}/>
                    </div>
                )}
                <DialogFooter>
                    <Button
                        disabled={!target || pending || (!!current && !changes)}
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
