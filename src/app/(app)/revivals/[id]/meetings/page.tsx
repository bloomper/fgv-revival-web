import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {NewMeetingButton} from "@/components/meeting/new-meeting-button.client";
import {MeetingTable} from "@/components/meeting/meeting-table.client";
import {ReadOnlyNotice} from "@/components/revival/read-only-notice";
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

    return withPolicyPage(Policies.app.requireAccess, async ({roles}) => {
        const loaded = await load(id);

        if (!loaded) {
            notFound();
        }

        const t = await getTranslations("Meeting");
        const {revival, meetings} = loaded;

        return (
            <div className="flex flex-1 flex-col gap-4">
                <h3 className="sr-only">{t("title")}</h3>
                <ReadOnlyNotice revivalId={revival.id} status={revival.status}
                                canWrite={revival.permissions.canWriteLog} roles={roles}/>
                <MeetingTable revivalId={revival.id} meetings={meetings}
                              actions={revival.permissions.canWriteLog &&
                                  <NewMeetingButton revivalId={revival.id} members={revival.ownerCandidates}/>}/>
            </div>
        );
    });
}
