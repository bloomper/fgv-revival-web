"use client";

import * as React from "react";
import {useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {MessageSquareReply, Pencil, Plus} from "lucide-react";
import type {LogEntryFieldsFragment, LogEntryStatus} from "@/gql/graphql";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {OwnerLabel} from "@/components/owner/owner-label";
import type {OwnerMember} from "@/components/owner/owner-field.client";
import {PlainText} from "@/components/plain-text";
import {LogAnswerDialog} from "@/components/decision-log/log-answer-dialog.client";
import {LogEntryDialog} from "@/components/decision-log/log-entry-dialog.client";
import {LogStatusBadge} from "@/components/decision-log/log-status-badge";
import {LogTypeBadge} from "@/components/decision-log/log-type-badge";
import {OverdueBadge} from "@/components/decision-log/overdue-badge";
import {updateLogEntryAction} from "@/app/(app)/revivals/[id]/log/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {LOG_ENTRY_STATUSES} from "@/lib/decision-log/schema";
import {cn} from "@/utils/utils";

type Entry = LogEntryFieldsFragment;

function StatusSelect({entry, revivalId, meetingId}: { entry: Entry; revivalId: string; meetingId?: string | null }) {
    const t = useTranslations("Log");
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();

    return (
        <select
            aria-label={t("statusOf", {number: entry.number})}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm disabled:opacity-50"
            value={entry.status}
            disabled={pending}
            onChange={(event) => {
                const status = event.target.value as LogEntryStatus;

                startTransition(async () => {
                    feedback(await updateLogEntryAction({id: entry.id, version: entry.version, revivalId, meetingId, values: {status}}));
                });
            }}
        >
            {LOG_ENTRY_STATUSES.map(status => <option key={status} value={status}>{t(`status.${status}`)}</option>)}
        </select>
    );
}

function closed(entry: Entry) {
    return entry.status === "DONE" || entry.status === "CANCELLED";
}

function Links({entry}: { entry: Entry }) {
    const t = useTranslations("Log");

    return (
        <>
            {entry.answers && <span className="text-xs text-muted-foreground">{t("answersRow", {number: entry.answers.number})}</span>}
            {entry.answeredBy && <span className="text-xs text-muted-foreground">{t("answeredByRow", {number: entry.answeredBy.number})}</span>}
            {entry.meeting && <span className="text-xs text-muted-foreground">{t("fromMeeting", {date: entry.meeting.date})}</span>}
        </>
    );
}

/**
 * The decision log in number order, as a table on wide screens and as cards on phones. A closed row is greyed, as in
 * the Excel log. There is no delete (M3 FR-010).
 */
export function LogTable({revivalId, entries, members, tags, canWrite, meetingId, emptyMessage}: {
    revivalId: string;
    entries: Entry[];
    members: OwnerMember[];
    tags: string[];
    canWrite: boolean;
    meetingId?: string | null;
    emptyMessage?: string;
}) {
    const t = useTranslations("Log");
    const [editing, setEditing] = useState<Entry | null>(null);
    const [adding, setAdding] = useState(false);
    const [answering, setAnswering] = useState<Entry | null>(null);

    const actions = (entry: Entry) => canWrite && (
        <div className="flex flex-wrap items-center gap-1">
            <StatusSelect entry={entry} revivalId={revivalId} meetingId={meetingId}/>
            <Button size="icon" variant="ghost" aria-label={t("editRow", {number: entry.number})} onClick={() => setEditing(entry)}>
                <Pencil/>
            </Button>
            {entry.type === "QUESTION" && (entry.status === "OPEN" || entry.status === "WAITING") && !entry.answeredBy && (
                <Button size="icon" variant="ghost" aria-label={t("answerRow", {number: entry.number})} onClick={() => setAnswering(entry)}>
                    <MessageSquareReply/>
                </Button>
            )}
        </div>
    );

    return (
        <div className="space-y-3">
            {canWrite && (
                <Button onClick={() => setAdding(true)}><Plus/>{t("add")}</Button>
            )}
            {entries.length === 0 ? (
                <p className="text-sm text-muted-foreground">{emptyMessage ?? t("empty")}</p>
            ) : (
                <>
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">{t("number")}</TableHead>
                                    <TableHead>{t("date")}</TableHead>
                                    <TableHead>{t("typeLabel")}</TableHead>
                                    <TableHead className="w-2/5">{t("text")}</TableHead>
                                    <TableHead>{t("owner")}</TableHead>
                                    <TableHead>{t("deadline")}</TableHead>
                                    <TableHead>{t("statusLabel")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {entries.map(entry => (
                                    <TableRow key={entry.id} className={cn(closed(entry) && "text-muted-foreground")}>
                                        <TableCell className="font-medium">{entry.number}</TableCell>
                                        <TableCell className="whitespace-nowrap">{entry.date}</TableCell>
                                        <TableCell><LogTypeBadge type={entry.type}/></TableCell>
                                        <TableCell className="whitespace-normal">
                                            <div className="flex flex-col gap-1">
                                                <PlainText text={entry.text}/>
                                                {entry.comment && <PlainText className="text-xs text-muted-foreground" text={entry.comment}/>}
                                                {entry.tags.length > 0 && <span className="text-xs text-muted-foreground">{entry.tags.join(", ")}</span>}
                                                <Links entry={entry}/>
                                            </div>
                                        </TableCell>
                                        <TableCell><OwnerLabel owner={entry.owner}/></TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex flex-col items-start gap-1">
                                                {entry.deadline ?? "—"}
                                                {entry.overdue && <OverdueBadge/>}
                                            </div>
                                        </TableCell>
                                        <TableCell>{canWrite ? actions(entry) : <LogStatusBadge status={entry.status}/>}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <ul className="space-y-3 md:hidden">
                        {entries.map(entry => (
                            <li key={entry.id} className={cn("space-y-2 rounded-lg border p-3", closed(entry) && "text-muted-foreground")}>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-medium">#{entry.number}</span>
                                    <LogTypeBadge type={entry.type}/>
                                    <LogStatusBadge status={entry.status}/>
                                    {entry.overdue && <OverdueBadge/>}
                                    <span className="text-xs text-muted-foreground">{entry.date}</span>
                                </div>
                                <PlainText text={entry.text}/>
                                {entry.comment && <PlainText className="block text-sm text-muted-foreground" text={entry.comment}/>}
                                <div className="flex flex-wrap gap-x-4 text-sm">
                                    <span>{t("owner")}: <OwnerLabel owner={entry.owner}/></span>
                                    {entry.deadline && <span>{t("deadline")}: {entry.deadline}</span>}
                                </div>
                                <Links entry={entry}/>
                                {actions(entry)}
                            </li>
                        ))}
                    </ul>
                </>
            )}
            {(adding || editing) && (
                <LogEntryDialog revivalId={revivalId} entry={editing} members={members} tags={tags} meetingId={meetingId} open
                                onOpenChange={(open) => {
                                    if (!open) {
                                        setAdding(false);
                                        setEditing(null);
                                    }
                                }}/>
            )}
            {answering && (
                <LogAnswerDialog revivalId={revivalId} question={answering} members={members} meetingId={meetingId} open
                                 onOpenChange={(open) => !open && setAnswering(null)}/>
            )}
        </div>
    );
}
