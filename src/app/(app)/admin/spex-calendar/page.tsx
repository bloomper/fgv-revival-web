import { getTranslations } from "next-intl/server";
import { SpexCalendarEditor } from "@/components/spex-calendar/spex-calendar-editor.client";
import { getSpexCalendarDates } from "@/lib/spex-calendar/spex-calendar.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";

/**
 * The current Chalmersspex's show dates, for super admins, so the timeline of all revivals flags revivals playing the
 * same weekend.
 */
export default async function SpexCalendarPage() {
  return withPolicyPage(Policies.admin.requireSuperAdmin, async () => {
    const t = await getTranslations("SpexCalendar");
    const dates = await getSpexCalendarDates();

    return (
      <Page variant="content">
        <PageHeader
          title={t("title")}
          description={t("description")}
        />
        <SpexCalendarEditor dates={dates} />
      </Page>
    );
  });
}
