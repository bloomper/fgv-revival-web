import {getTranslations} from "next-intl/server";
import {SpexCalendarEditor} from "@/components/spex-calendar/spex-calendar-editor.client";
import {getSpexCalendarDates} from "@/lib/spex-calendar/spex-calendar.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * The current Chalmersspex's show dates, for super admins, so the timeline of all revivals flags revivals playing the
 * same weekend (product spec 5.1).
 */
export default async function SpexCalendarPage() {
    return withPolicyPage(Policies.admin.requireSuperAdmin, async () => {
        const t = await getTranslations("SpexCalendar");
        const dates = await getSpexCalendarDates();

        return (
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                <h2 className="text-lg font-bold tracking-tight">{t("title")}</h2>
                <p className="max-w-prose text-sm text-muted-foreground">{t("description")}</p>
                <SpexCalendarEditor dates={dates}/>
            </div>
        );
    });
}
