import * as React from "react";
import Link from "next/link";
import {notFound} from "next/navigation";
import {CalendarCheck, UserX} from "lucide-react";
import {getTranslations} from "next-intl/server";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {RevivalTabs} from "@/components/revival/revival-tabs.client";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getRevivalShell, getRevivalWorkSummary} from "@/lib/revival/revival.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";
import {formatInstant} from "@/utils/format";

async function loadRevival(id: string) {
    try {
        return await getRevivalShell(id);
    } catch (error) {
        if (error instanceof GraphQLRequestError && error.code === "NOT_FOUND") {
            return null;
        }
        throw error;
    }
}

async function loadWorkSummary(id: string) {
    try {
        return await getRevivalWorkSummary(id);
    } catch (error) {
        if (error instanceof GraphQLRequestError) {
            return null;
        }
        throw error;
    }
}

/**
 * Everything under one revival: its title and a tab per section, so the sections are one click apart. A
 * revival the user cannot see is shown as not found (FR-017). Participants and helpers see only their own page
 * (`/me`, M6a), without the steering group's tabs; it shows the title itself.
 */
export default async function RevivalLayout({children, params}: {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}) {
    const {id} = await params;

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const revival = await loadRevival(id);

        if (!revival) {
            notFound();
        }
        if (revival.permissions.isParticipant) {
            return <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">{children}</div>;
        }

        const work = revival.permissions.canReadWork ? await loadWorkSummary(id) : null;

        const t = await getTranslations("Revival");

        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
                <h2 className="text-lg font-bold tracking-tight">{revival.title}</h2>

                {revival.anonymizedAt && (
                    <Alert className="print:hidden">
                        <UserX/>
                        <AlertTitle>{t("anonymized", {date: formatInstant(revival.anonymizedAt)?.slice(0, 10) ?? ""})}</AlertTitle>
                        <AlertDescription>{t("anonymizedDescription")}</AlertDescription>
                    </Alert>
                )}

                {work?.meetingInProgress && (
                    <Alert className="print:hidden">
                        <CalendarCheck/>
                        <AlertTitle>{t("meetingInProgress")}</AlertTitle>
                        <AlertDescription>
                            <Link href={`/revivals/${revival.id}/meetings/${work.meetingInProgress.id}`} className="underline">
                                {work.meetingInProgress.title ?? work.meetingInProgress.date}
                            </Link>
                        </AlertDescription>
                    </Alert>
                )}

                <RevivalTabs revivalId={revival.id} work={work} canReadBudget={revival.permissions.canReadBudget}
                             canReadParticipants={revival.permissions.canReadParticipants}
                             canReadStaffing={revival.permissions.canReadStaffing} canReadMailings={revival.permissions.canReadMailings}
                             canReadMaterials={revival.permissions.canReadMaterials}
                             closingProminent={["CLOSING", "SETTLING"].includes(revival.status)}/>

                {children}
            </div>
        );
    });
}
