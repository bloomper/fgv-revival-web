import * as React from "react";
import Link from "next/link";
import {notFound} from "next/navigation";
import {CalendarCheck} from "lucide-react";
import {getTranslations} from "next-intl/server";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {RevivalTabs} from "@/components/revival/revival-tabs.client";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getRevival, getRevivalWorkSummary} from "@/lib/revival/revival.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

async function loadRevival(id: string) {
    try {
        return await getRevival(id);
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
 * revival the user cannot see is shown as not found (FR-017).
 */
export default async function RevivalLayout({children, params}: {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}) {
    const {id} = await params;

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const [revival, work] = await Promise.all([loadRevival(id), loadWorkSummary(id)]);

        if (!revival) {
            notFound();
        }

        const t = await getTranslations("Revival");

        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
                <h2 className="text-lg font-bold tracking-tight">{revival.title}</h2>

                {work?.meetingInProgress && (
                    <Alert>
                        <CalendarCheck/>
                        <AlertTitle>{t("meetingInProgress")}</AlertTitle>
                        <AlertDescription>
                            <Link href={`/revivals/${revival.id}/meetings/${work.meetingInProgress.id}`} className="underline">
                                {work.meetingInProgress.title ?? work.meetingInProgress.date}
                            </Link>
                        </AlertDescription>
                    </Alert>
                )}

                <RevivalTabs revivalId={revival.id} work={work} />

                {children}
            </div>
        );
    });
}
