import {getTranslations} from "next-intl/server";
import {NewsTable} from "@/components/news/news-table.client";
import {getAllNews} from "@/lib/news/news.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * The news on the start page, for super admins: written, scheduled, withdrawn and deleted here.
 */
export default async function NewsAdminPage() {
    return withPolicyPage(Policies.admin.requireSuperAdmin, async () => {
        const t = await getTranslations("News");
        const news = await getAllNews();

        return (
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                <h2 className="text-lg font-bold tracking-tight">{t("title")}</h2>
                <p className="max-w-prose text-sm text-muted-foreground">{t("description")}</p>
                <NewsTable news={news}/>
            </div>
        );
    });
}
