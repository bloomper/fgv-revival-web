import Link from "next/link";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {ArrowLeft} from "lucide-react";
import {NewMeetingButton} from "@/components/meeting/new-meeting-button.client";
import {MeetingStatusBadge} from "@/components/meeting/meeting-mode.client";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getRevivalMeetings} from "@/lib/meeting/meeting.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

async function load(id: string) {
    try {
        return await getRevivalMeetings(id);
    } catch (error) {
        if (error instanceof GraphQLRequestError && (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")) {
            return null;
        }
        throw error;
    }
}

/**
 * A revival's meetings, newest first (M3 US3).
 */
export default async function MeetingsPage({params}: { params: Promise<{ id: string }> }) {
    const {id} = await params;

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const loaded = await load(id);

        if (!loaded) {
            notFound();
        }

        const t = await getTranslations("Meeting");
        const {revival, meetings} = loaded;

        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-1">
                        <Link href={`/revivals/${revival.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
                            <ArrowLeft className="size-4"/>
                            {revival.workingTitle}
                        </Link>
                        <h2 className="text-lg font-bold tracking-tight">{t("title")}</h2>
                    </div>
                    {revival.permissions.canWriteLog && <NewMeetingButton revivalId={revival.id} members={revival.ownerCandidates}/>}
                </div>
                {meetings.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("empty")}</p>
                ) : (
                    <ul className="divide-y rounded-lg border">
                        {meetings.map(meeting => (
                            <li key={meeting.id}>
                                <Link href={`/revivals/${revival.id}/meetings/${meeting.id}`} className="flex items-center justify-between gap-2 p-3 hover:bg-accent">
                                    <span>{meeting.title ?? t("untitled")} <span className="text-muted-foreground">{meeting.date}</span></span>
                                    <MeetingStatusBadge status={meeting.status}/>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    });
}
