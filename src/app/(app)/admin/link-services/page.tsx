import { getTranslations } from "next-intl/server";
import { ShowRetiredSwitch } from "@/components/show-retired-switch.client";
import { LinkServiceEditor } from "@/components/material/link-service-editor.client";
import { getLinkServices } from "@/lib/material/material.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";

/**
 * The services materials' links lead to, for super admins: FGV's own applications and services such as
 * Google Drive, with the hosts that recognise them. Retired ones only when asked for.
 */
export default async function LinkServicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const retired = (await searchParams).retired === "1";

  return withPolicyPage(Policies.admin.requireSuperAdmin, async () => {
    const t = await getTranslations();
    const services = await getLinkServices(retired);

    return (
      <Page variant="content">
        <PageHeader
          title={t("LinkServiceAdmin.title")}
          actions={
            <ShowRetiredSwitch
              shown={retired}
              label={t("Catalog.showRetired")}
            />
          }
        />
        <p className="text-muted-foreground max-w-prose text-sm">{t("LinkServiceAdmin.description")}</p>
        <LinkServiceEditor entries={services} />
      </Page>
    );
  });
}
