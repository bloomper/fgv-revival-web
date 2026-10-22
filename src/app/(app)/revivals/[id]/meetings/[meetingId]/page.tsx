import Link from "next/link";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {ArrowLeft} from "lucide-react";
import {MeetingMode, MeetingStatusBadge} from "@/components/meeting/meeting-mode.client";
import {MinutesEmailDialog} from "@/components/meeting/minutes-email-dialog.client";
import {MinutesEmailHistory} from "@/components/meeting/minutes-email-history.client";
import {MinutesView} from "@/components/meeting/minutes-view";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getMeeting} from "@/lib/meeting/meeting.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

async function load(revivalId: string, id: string) {
    try {
        return await getMeeting(revivalId, id);
    } catch (error) {
        if (error instanceof GraphQLRequestError && (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")) {
            return null;
        }
        throw error;
    }
}

/**
 * One meeting: meeting mode while planned or in progress, the minutes once closed (M3 FR-016–FR-021).
 */
export default async function MeetingPage({params}: { params: Promise<{ id: string; meetingId: string }> }) {
    const {id, meetingId} = await params;

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const loaded = await load(id, meetingId);

        if (!loaded) {
            notFound();
        }

        const t = await getTranslations("Meeting");
        const {revival, meeting, tags} = loaded;
        const canWrite = revival.permissions.canWriteLog;

        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
                <div className="space-y-1">
                    <Link href={`/revivals/${revival.id}/meetings`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
                        <ArrowLeft className="size-4"/>
                        {t("title")}
                    </Link>
                    <h2 className="text-lg font-bold tracking-tight">{meeting.title ?? t("untitled")}</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {meeting.date} <MeetingStatusBadge status={meeting.status}/>
                    </div>
                </div>
                {meeting.minutes ? (
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            {meeting.canEmailMinutes && <MinutesEmailDialog revivalId={revival.id} meetingId={meeting.id}/>}
                            <Link href={`/revivals/${revival.id}/log?meeting=${meeting.id}`} className="text-sm hover:underline">{t("logRows")}</Link>
                        </div>
                        <MinutesView minutes={meeting.minutes}/>
                        {meeting.emails.length > 0 && (
                            <MinutesEmailHistory revivalId={revival.id} meetingId={meeting.id} emails={meeting.emails} canSend={meeting.canEmailMinutes}/>
                        )}
                    </div>
                ) : meeting.status === "CANCELLED" ? (
                    <p className="text-sm text-muted-foreground">{t("wasCancelled")}</p>
                ) : (
                    <MeetingMode revivalId={revival.id} meeting={meeting} openEntries={meeting.openEntries} members={revival.ownerCandidates}
                                 tags={tags} canWrite={canWrite} blocking={meeting.blockingEntries}/>
                )}
            </div>
        );
    });
}
