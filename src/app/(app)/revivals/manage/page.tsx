import {getTranslations} from "next-intl/server";
import {GanttChart, List} from "lucide-react";
import {RevivalAdminTable} from "@/components/revival/revival-admin-table.client";
import {RevivalCreateDialog} from "@/components/revival/revival-create-dialog.client";
import {RevivalTimeline} from "@/components/revival/revival-timeline";
import {buildCrossTimeline} from "@/components/revival/timeline-clashes";
import {ViewLink} from "@/components/view-link";
import {getRevivals} from "@/lib/revival/revival.server";
import {getRevivalTimeline} from "@/lib/spex-calendar/spex-calendar.server";
import {isSuperAdmin} from "@/utils/auth";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * All revivals: super admins create revivals here and open one to manage it; observers see the same list read-only
 * (FR-021, FR-021a). With {@code ?view=timeline}, every revival's shows and the Chalmersspex dates by month, with
 * clashing show weekends flagged (product spec 5.1).
 */
export default async function ManageRevivalsPage({searchParams}: { searchParams: Promise<{ create?: string; view?: string }> }) {
    const {create, view} = await searchParams;
    const timeline = view === "timeline";

    return withPolicyPage(Policies.revivals.requireReadAll, async ({roles}) => {
        const t = await getTranslations();
        const superAdmin = isSuperAdmin(roles);
        let content;

        if (timeline) {
            const {revivals, spexDates} = await getRevivalTimeline();

            content = <RevivalTimeline {...buildCrossTimeline(revivals, spexDates)}/>;
        } else {
            content = <RevivalAdminTable revivals={await getRevivals()}
                                         actions={superAdmin && <RevivalCreateDialog key={create ?? ""} defaultOpen={create !== undefined}/>}/>;
        }

        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
                <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-bold tracking-tight">{t("Admin.title")}</h2>
                    {!superAdmin && <p className="text-sm text-muted-foreground">{t("Admin.readOnly")}</p>}
                </div>
                <nav aria-label={t("RevivalTimeline.views")} className="flex w-fit gap-1 rounded-lg bg-muted p-1">
                    <ViewLink href="/revivals/manage" active={!timeline} icon={List}>{t("Event.list")}</ViewLink>
                    <ViewLink href="/revivals/manage?view=timeline" active={timeline} icon={GanttChart}>{t("RevivalTimeline.title")}</ViewLink>
                </nav>
                {content}
            </div>
        );
    });
}
