import {getTranslations} from "next-intl/server";
import {NewsTable} from "@/components/news/news-table.client";
import {getAllNews} from "@/lib/news/news.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";
import {Page, PageHeader} from "@bloomper/fgv-web-ui/shell/page-header";

/**
 * The news on the start page, for super admins: written, scheduled, withdrawn and deleted here.
 */
export default async function NewsAdminPage() {
    return withPolicyPage(Policies.admin.requireSuperAdmin, async () => {
        const t = await getTranslations("News");
        const news = await getAllNews();

        return (
            <Page variant="content">
                <PageHeader title={t("title")} description={t("description")}/>
                <NewsTable news={news}/>
            </Page>
        );
    });
}
