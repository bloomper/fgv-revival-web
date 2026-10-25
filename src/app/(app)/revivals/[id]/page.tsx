import {notFound, redirect} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {RevivalDetails} from "@/components/revival/revival-details.client";
import {MemberSummary} from "@/components/member/member-summary";
import {UpcomingEvents} from "@/components/event/upcoming-events";
import {BudgetSummaryCard} from "@/components/budget/budget-summary-card";
import {getRevivalBudgetSummary} from "@/lib/budget/budget.server";
import {getRevivalSyncSignal} from "@/lib/closing/closing.server";
import {syncIncomplete} from "@/lib/closing/schema";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getRevival, getRevivalShell, getRevivalWorkSummary} from "@/lib/revival/revival.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

async function loadShell(id: string) {
    try {
        return await getRevivalShell(id);
    } catch (error) {
        if (error instanceof GraphQLRequestError && error.code === "NOT_FOUND") {
            return null;
        }
        throw error;
    }
}

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

// The layout shows the same summary's counts; without it the overview still shows the rest
async function loadUpcoming(id: string) {
    try {
        return (await getRevivalWorkSummary(id))?.upcomingEvents ?? null;
    } catch (error) {
        if (error instanceof GraphQLRequestError) {
            return null;
        }
        throw error;
    }
}

// Null for callers who may not read the budget; without it the overview still shows the rest
async function loadBudget(id: string, canRead: boolean) {
    if (!canRead) {
        return null;
    }
    try {
        return await getRevivalBudgetSummary(id);
    } catch (error) {
        if (error instanceof GraphQLRequestError) {
            return null;
        }
        throw error;
    }
}

// Only asked for when the caller may archive; without it, archiving simply does not warn
async function loadSyncIncomplete(id: string, canArchive: boolean) {
    if (!canArchive) {
        return false;
    }
    try {
        return syncIncomplete(await getRevivalSyncSignal(id));
    } catch (error) {
        if (error instanceof GraphQLRequestError) {
            return false;
        }
        throw error;
    }
}

/**
 * A revival's overview: details, status, the next events, the budget's position and who leads it. The layout fetches
 * the same revival, which urql answers from its request cache; both show a revival the user cannot see as not found.
 * Participants and helpers are sent to their own page.
 */
export default async function RevivalPage({params}: { params: Promise<{ id: string }> }) {
    const {id} = await params;

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const shell = await loadShell(id);

        if (!shell) {
            notFound();
        }
        if (shell.permissions.isParticipant) {
            redirect(`/revivals/${shell.id}/me`);
        }

        const [revival, upcoming] = await Promise.all([loadRevival(id), loadUpcoming(id)]);

        if (!revival) {
            notFound();
        }

        const [budget, incomplete] = await Promise.all([
            loadBudget(revival.id, revival.permissions.canReadBudget),
            loadSyncIncomplete(revival.id, revival.permissions.allowedStatuses.includes("ARCHIVED")),
        ]);

        const t = await getTranslations("Revival");

        return (
            <div className="flex flex-1 flex-col gap-6">
                <h3 className="sr-only">{t("overview")}</h3>
                <RevivalDetails key={revival.version} revival={revival} syncIncomplete={incomplete}/>
                {upcoming && <UpcomingEvents revivalId={revival.id} events={upcoming}/>}
                {budget && <BudgetSummaryCard revivalId={revival.id} totals={budget.totals}/>}
                <MemberSummary revivalId={revival.id} members={revival.members}/>
            </div>
        );
    });
}
