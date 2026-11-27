import { getTranslations } from "next-intl/server";
import { ShowRetiredSwitch } from "@/components/show-retired-switch.client";
import { CapabilityEditor } from "@/components/catalog/capability-editor.client";
import { getCapabilities } from "@/lib/catalog/catalog.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";

/**
 * The areas of responsibility steering group members hold, for super admins. Retired ones only when asked for.
 */
export default async function CapabilitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const retired = (await searchParams).retired === "1";

  return withPolicyPage(Policies.admin.requireSuperAdmin, async () => {
    const t = await getTranslations();
    const capabilities = await getCapabilities(retired);

    return (
      <Page variant="content">
        <PageHeader
          title={t("CapabilityAdmin.title")}
          actions={
            <ShowRetiredSwitch
              shown={retired}
              label={t("Catalog.showRetired")}
            />
          }
        />
        <p className="text-muted-foreground max-w-prose text-sm">{t("CapabilityAdmin.description")}</p>
        <CapabilityEditor entries={capabilities} />
      </Page>
    );
  });
}
