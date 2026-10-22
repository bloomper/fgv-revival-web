"use client";

import * as React from "react";
import {useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {Pencil, Play} from "lucide-react";
import type {LogEntryFieldsFragment, MeetingStatus} from "@/gql/graphql";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {LogTable} from "@/components/decision-log/log-table.client";
import {MeetingCloseDialog} from "@/components/meeting/meeting-close-dialog.client";
import {type EditableMeeting, MeetingDialog} from "@/components/meeting/meeting-dialog.client";
import {cancelMeetingAction, startMeetingAction} from "@/app/(app)/revivals/[id]/meetings/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";

export function MeetingStatusBadge({status}: { status: MeetingStatus }) {
    const t = useTranslations("Meeting.status");

    return <Badge variant={status === "IN_PROGRESS" ? "default" : status === "PLANNED" ? "secondary" : "outline"}>{t(status)}</Badge>;
}

/**
 * Meeting mode (M3 FR-018): the agenda is the open rows, then the extra points. While the meeting is in progress, every
 * row change made here is recorded as made in it; while it is planned, none is.
 */
export function MeetingMode({revivalId, meeting, openEntries, members, tags, canWrite, blocking}: {
    revivalId: string;
    meeting: EditableMeeting & { status: MeetingStatus; recorder?: { displayName?: string | null } | null };
    openEntries: LogEntryFieldsFragment[];
    members: { id: string; displayName?: string | null }[];
    tags: string[];
    canWrite: boolean;
    blocking: { id: string; number: number }[];
}) {
    const t = useTranslations();
    const feedback = useActionFeedback();
    const [editing, setEditing] = useState(false);
    const [editingRow, setEditingRow] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();
    const inProgress = meeting.status === "IN_PROGRESS";

    return (
        <div className="space-y-6">
            {canWrite && (
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => setEditing(true)}><Pencil/>{t("Common.edit")}</Button>
                    {meeting.status === "PLANNED" && (
                        <>
                            <Button disabled={pending} onClick={() => startTransition(async () => {
                                feedback(await startMeetingAction({id: meeting.id, version: meeting.version, revivalId}), t("Meeting.started"));
                            })}><Play/>{t("Meeting.start")}</Button>
                            <Button variant="outline" disabled={pending} onClick={() => startTransition(async () => {
                                feedback(await cancelMeetingAction({id: meeting.id, version: meeting.version, revivalId}), t("Meeting.cancelled"));
                            })}>{t("Meeting.cancel")}</Button>
                        </>
                    )}
                    {inProgress && <MeetingCloseDialog revivalId={revivalId} meeting={meeting} blocking={blocking} onOpenRow={setEditingRow}/>}
                </div>
            )}
            {meeting.recorder?.displayName && <p className="text-sm">{t("Meeting.recorder")}: {meeting.recorder.displayName}</p>}
            <section className="space-y-2">
                <h3 className="font-medium">{t("Meeting.openRows")}</h3>
                <LogTable revivalId={revivalId} entries={openEntries} members={members} tags={tags} canWrite={canWrite}
                          meetingId={inProgress ? meeting.id : null} emptyMessage={t("Meeting.noOpenRows")}
                          editingId={editingRow} onEditingIdChange={setEditingRow}/>
            </section>
            <section className="space-y-2">
                <h3 className="font-medium">{t("Meeting.agendaPoints")}</h3>
                {meeting.agendaPoints.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("Meeting.noAgendaPoints")}</p>
                ) : (
                    <ol className="list-decimal space-y-1 pl-5 text-sm">{meeting.agendaPoints.map((point, index) => <li key={index}>{point}</li>)}</ol>
                )}
            </section>
            {editing && <MeetingDialog revivalId={revivalId} meeting={meeting} members={members} open onOpenChange={setEditing}/>}
        </div>
    );
}
