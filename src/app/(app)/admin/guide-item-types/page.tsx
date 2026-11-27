import { getTranslations } from "next-intl/server";
import { ShowRetiredSwitch } from "@/components/show-retired-switch.client";
import { GuideItemTypeEditor } from "@/components/catalog/guide-item-type-editor.client";
import { getGuideItemTypes } from "@/lib/catalog/catalog.server";
import { Policies } from "@/utils/policy.server";
import { withPolicyPage } from "@/utils/route.server";
import { Page, PageHeader } from "@bloomper/fgv-web-ui/shell/page-header";

/**
 * The types a guide item can have, for super admins. Each type has one of the fixed kinds, which decides what its
 * items do. Retired types only when asked for.
 */
export default async function GuideItemTypesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const retired = (await searchParams).retired === "1";

  return withPolicyPage(Policies.admin.requireSuperAdmin, async () => {
    const t = await getTranslations();
    const types = await getGuideItemTypes(retired);

    return (
      <Page variant="content">
        <PageHeader
          title={t("GuideItemTypeAdmin.title")}
          actions={
            <ShowRetiredSwitch
              shown={retired}
              label={t("Catalog.showRetired")}
            />
          }
        />
        <p className="text-muted-foreground max-w-prose text-sm">{t("GuideItemTypeAdmin.description")}</p>
        <GuideItemTypeEditor entries={types} />
      </Page>
    );
  });
}
