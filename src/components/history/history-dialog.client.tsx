"use client";

import {useEffect, useState} from "react";
import {useTranslations} from "next-intl";
import {History, Pencil, PlusCircle, Trash2} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Skeleton} from "@/components/ui/skeleton";
import {getRevisionsAction, type Revision} from "@/app/(app)/history/actions.server";
import type {AuditedType} from "@/gql/graphql";
import {historyFieldLabel, historyValue} from "@/components/history/history";
import {formatInstant} from "@/utils/format";
import {cn} from "@/utils/utils";

export type HistoryTarget = { type: AuditedType; id: string; title: string };

const ICONS = {
    ADD: <PlusCircle className="size-4 text-green-700 dark:text-green-500" aria-hidden/>,
    MOD: <Pencil className="size-4 text-blue-700 dark:text-blue-400" aria-hidden/>,
    DEL: <Trash2 className="size-4 text-destructive" aria-hidden/>,
};

const CELL = "min-w-0 bg-background px-2 py-1 whitespace-pre-wrap break-words";
const HEADING = "bg-muted/60 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground";

function Changes({type, revision}: { type: AuditedType; revision: Revision }) {
    const t = useTranslations();
    const created = revision.revisionType === "ADD";
    const value = (change: Revision["changes"][number], side: "old" | "new") => {
        const shown = historyValue(t, type, change.field, change.kind, side === "old" ? change.oldValue : change.newValue);

        return shown === null ? <span className="text-muted-foreground">{t("History.emptyValue")}</span> : shown;
    };

    if (revision.changes.length === 0) {
        return null;
    }

    // A creation has nothing before it: field and value only
    return (
        <dl className={cn("grid gap-px overflow-hidden rounded-md border bg-border text-sm",
            created ? "sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)]" : "sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)_minmax(0,1fr)]")}>
            <div className={cn(HEADING, "hidden sm:block")}>{t("History.field")}</div>
            {!created && <div className={cn(HEADING, "hidden sm:block")}>{t("History.before")}</div>}
            <div className={cn(HEADING, "hidden sm:block")}>{created ? t("History.value") : t("History.after")}</div>
            {revision.changes.map(change => (
                <div key={change.field} className="contents">
                    <dt className={cn(CELL, "font-medium")}>{historyFieldLabel(t, type, change.field)}</dt>
                    {!created && (
                        <dd className={cn(CELL, "text-muted-foreground")}>
                            <span className="sr-only">{t("History.before")}: </span>
                            <span className="line-through decoration-destructive/50">{value(change, "old")}</span>
                        </dd>
                    )}
                    <dd className={CELL}>
                        {!created && <span className="sr-only">{t("History.after")}: </span>}
                        {value(change, "new")}
                    </dd>
                </div>
            ))}
        </dl>
    );
}

/**
 * Who changed a record, when and how, newest first, fetched when it opens. Read only: nothing is restored from here.
 */
export function HistoryDialog({target, onOpenChange}: { target: HistoryTarget; onOpenChange: (open: boolean) => void }) {
    const t = useTranslations();
    const [revisions, setRevisions] = useState<Revision[] | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;

        getRevisionsAction({type: target.type, id: target.id})
            .then(result => {
                if (!cancelled) {
                    if (result.ok) {
                        setRevisions(result.data);
                    } else {
                        setFailed(true);
                    }
                }
            })
            .catch(() => !cancelled && setFailed(true));
        return () => {
            cancelled = true;
        };
    }, [target.type, target.id]);

    return (
        <Dialog open onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><History className="size-5" aria-hidden/>
                        {t("History.titleOf", {title: target.title})}
                    </DialogTitle>
                    <DialogDescription>{t("History.description")}</DialogDescription>
                </DialogHeader>
                {failed ? (
                    <p className="text-sm text-destructive" role="alert">{t("History.failed")}</p>
                ) : revisions === null ? (
                    <div className="space-y-3" aria-busy="true" aria-label={t("Common.loading")}>
                        <Skeleton className="h-16"/>
                        <Skeleton className="h-16"/>
                    </div>
                ) : revisions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("History.empty")}</p>
                ) : (
                    <ol className="space-y-5" aria-label={t("History.title")}>
                        {revisions.map(revision => (
                            <li key={revision.revision} className="space-y-2">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                                    {ICONS[revision.revisionType]}
                                    <span className="font-medium">{t(`History.revisionTypes.${revision.revisionType}`)}</span>
                                    <span>{revision.modifiedBy}</span>
                                    <time className="tabular-nums text-muted-foreground" dateTime={revision.modifiedAt}>
                                        {formatInstant(revision.modifiedAt)}
                                    </time>
                                    {revision.source && revision.source !== "WEB" &&
                                        <Badge variant="outline">{t(`History.sources.${revision.source}`)}</Badge>}
                                </div>
                                {revision.comment && <p className="text-sm text-muted-foreground">{revision.comment}</p>}
                                <Changes type={target.type} revision={revision}/>
                            </li>
                        ))}
                    </ol>
                )}
            </DialogContent>
        </Dialog>
    );
}
