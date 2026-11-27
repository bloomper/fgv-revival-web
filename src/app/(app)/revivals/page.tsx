import { getTranslations } from "next-intl/server";
import { RevivalGrid } from "@/components/revival/revival-grid.client";
import { getMe, getRevivals } from "@/lib/revival/revival.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";

/**
 * The revivals the user can see, with their role in each.
 */
export default async function RevivalsPage() {
  return withPolicyPage(Policies.app.requireAccess, async () => {
    const t = await getTranslations("Home");
    const [revivals, me] = await Promise.all([getRevivals(), getMe()]);
    const roles = Object.fromEntries(
      (me?.revivalRoles ?? []).map((assignment) => [assignment.revival.id, assignment.role])
    );

    return (
      <Page>
        <PageHeader title={t("myRevivals")} />
        {revivals.length === 0 ? (
          <p className="text-muted-foreground">{t("empty")}</p>
        ) : (
          <RevivalGrid
            revivals={revivals}
            roles={roles}
          />
        )}
      </Page>
    );
  });
}
