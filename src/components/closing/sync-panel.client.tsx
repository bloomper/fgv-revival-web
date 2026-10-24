"use client";

import {useEffect, useState, useTransition} from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {RefreshCw} from "lucide-react";
import type {SyncPreviewQuery, SyncRunFieldsFragment} from "@/gql/graphql";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {startSyncAction, syncFinishedAction, syncRunAction} from "@/app/(app)/revivals/[id]/closing/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {formatInstant} from "@/utils/format";
import {track} from "@/utils/umami";

type Preview = NonNullable<SyncPreviewQuery["syncPreview"]>;

/** How often a running sync is asked for its progress. */
export const SYNC_POLL_MS = 2000;

/** What starting the sync would write: the planned operations, plus creating the revival when Spexregister lacks it. */
export function plannedOperations(preview: Pick<Preview, "participants" | "spexregisterRevivalExists">): number {
    return preview.participants.reduce((sum, entry) => sum + entry.operations.filter(operation => !operation.exists).length, 0)
        + (preview.spexregisterRevivalExists ? 0 : 1);
}

const RUN_VARIANTS = {RUNNING: "secondary", DONE: "default", FAILED: "destructive"} as const;

function SyncRunStatus({run}: { run: SyncRunFieldsFragment }) {
    const t = useTranslations("Closing.sync");
    const percent = run.total > 0 ? Math.round(100 * (run.done + run.failed) / run.total) : 100;

    return (
        <div className="space-y-3 rounded-md border p-4" data-testid="sync-run">
            <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant={RUN_VARIANTS[run.status]}>{t(`runStatus.${run.status}`)}</Badge>
                <span className="text-muted-foreground">
                    {t("startedAt", {at: formatInstant(run.startedAt) ?? "", name: run.startedBy?.displayName ?? "–"})}
                    {run.finishedAt && <> · {t("finishedAt", {at: formatInstant(run.finishedAt) ?? ""})}</>}
                </span>
            </div>
            <div className="space-y-1">
                <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={t("progress")}
                     aria-valuemin={0} aria-valuemax={run.total} aria-valuenow={run.done + run.failed}>
                    <div className={run.failed > 0 ? "h-full bg-destructive" : "h-full bg-primary"} style={{width: `${percent}%`}}/>
                </div>
                <p className="text-sm" aria-live="polite">{t("counts", {done: run.done, failed: run.failed, total: run.total})}</p>
            </div>
            {run.failures.length > 0 && (
                <div className="space-y-1">
                    <h5 className="text-sm font-medium">{t("failures")}</h5>
                    <ul className="list-disc space-y-1 pl-5 text-sm">
                        {run.failures.map((failure, index) => (
                            <li key={`${failure.participant?.id ?? "revival"}-${failure.operation}-${index}`}>
                                {failure.participant?.displayName ?? t("revivalStep")}: {t(`operation.${failure.operation}`)} –{" "}
                                {t.has(`reason.${failure.reason}`) ? t(`reason.${failure.reason}`) : failure.reason}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

/**
 * The participation sync to Spexregister (M7-FR-2..8): what would be written per participant, with what is already there
 * marked, who is left out and why, and the latest run. Starting sends the preview's hash, so the server refuses when
 * the preview has changed since; a run in progress is polled every two seconds, and a run that failed is resumed by
 * starting again, which writes only what is still missing.
 */
export function SyncPanel({revivalId, preview, canSync}: { revivalId: string; preview: Preview; canSync: boolean }) {
    const t = useTranslations("Closing.sync");
    const tc = useTranslations("Common");
    const router = useRouter();
    const feedback = useActionFeedback();
    const [run, setRun] = useState<SyncRunFieldsFragment | null>(preview.lastRun ?? null);
    const [confirming, setConfirming] = useState(false);
    const [pending, startTransition] = useTransition();
    const running = run?.status === "RUNNING";
    const runId = running ? run.id : null;
    const planned = plannedOperations(preview);

    useEffect(() => {
        if (!runId) {
            return;
        }

        let cancelled = false;
        const timer = setInterval(async () => {
            const result = await syncRunAction({id: runId});

            if (cancelled || !result.ok || !result.data) {
                return;
            }
            setRun(result.data);
            if (result.data.status !== "RUNNING") {
                clearInterval(timer);
                await syncFinishedAction(revivalId);
                router.refresh();
            }
        }, SYNC_POLL_MS);

        return () => {
            cancelled = true;
            clearInterval(timer);
        };
    }, [revivalId, runId, router]);

    const start = () => startTransition(async () => {
        const result = await startSyncAction({revivalId, previewHash: preview.hash});

        setConfirming(false);
        if (feedback(result)) {
            setRun(result.data);
            track("sync-start", {participants: preview.participants.length});
        }
    });

    return (
        <div className="space-y-4">
            {!preview.spexregisterRevivalExists && <p className="text-sm">{t("revivalMissing")}</p>}
            {preview.participants.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("noParticipants")}</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("participant")}</TableHead>
                            <TableHead>{t("operations")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {preview.participants.map(entry => (
                            <TableRow key={entry.participant.id}>
                                <TableCell className="align-top">
                                    <div className="font-medium">{entry.participant.displayName}</div>
                                    {entry.participant.position && <div className="text-xs text-muted-foreground">{entry.participant.position.name}</div>}
                                </TableCell>
                                <TableCell>
                                    <ul className="flex flex-wrap gap-1">
                                        {entry.operations.map(operation => (
                                            <li key={operation.operation}>
                                                <Badge variant={operation.exists ? "outline" : "secondary"}
                                                       className={operation.exists ? "text-muted-foreground" : undefined}>
                                                    {t(`operation.${operation.operation}`)}
                                                    {operation.detail && `: ${operation.detail}`}
                                                    {operation.exists && ` (${t("exists")})`}
                                                </Badge>
                                            </li>
                                        ))}
                                    </ul>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
            {preview.excluded.length > 0 && (
                <div className="space-y-1 text-sm">
                    <h5 className="font-medium">{t("excluded", {count: preview.excluded.length})}</h5>
                    <p className="text-muted-foreground">{t("excludedReason")}</p>
                    <ul className="list-disc pl-5">
                        {preview.excluded.map(participant => <li key={participant.id}>{participant.displayName}</li>)}
                    </ul>
                </div>
            )}
            {run && <SyncRunStatus run={run}/>}
            <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm text-muted-foreground">
                    {planned > 0 ? t("planned", {count: planned}) : t("nothingToDo")}
                </p>
                {canSync && (
                    <AlertDialog open={confirming} onOpenChange={setConfirming}>
                        <AlertDialogTrigger render={<Button className="ml-auto" disabled={pending || running || planned === 0}/>}>
                            <RefreshCw className={running ? "animate-spin" : undefined}/>
                            {run?.status === "FAILED" ? t("resume") : t("start")}
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>{t("confirmTitle")}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t("confirmDescription", {count: planned, participants: preview.participants.length})}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>{tc("cancel")}</AlertDialogCancel>
                                <AlertDialogAction disabled={pending} onClick={start}>{run?.status === "FAILED" ? t("resume") : t("start")}</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </div>
    );
}
