import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {GuideChanges} from "@/components/guide/guide-changes.client";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getGuideChanges} from "@/lib/guide/guide.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";
import {Page, PageHeader} from "@bloomper/fgv-web-ui/shell/page-header";

/**
 * What changed between two versions, {@code ?from=&to=}.
 */
export default async function GuideChangesPage({searchParams}: {
    searchParams: Promise<{ from?: string; to?: string }>
}) {
    const {from, to} = await searchParams;

    return withPolicyPage(Policies.app.requireAccess, async () => {
        if (!from || !to) {
            notFound();
        }

        const t = await getTranslations("Guide.changes");
        const changes = await getGuideChanges(from, to).catch((error: unknown) => {
            if (error instanceof GraphQLRequestError && (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")) {
                return null;
            }
            throw error;
        });

        if (!changes) {
            notFound();
        }

        return (
            <Page>
                <PageHeader title={t("title", {from: changes.from.label ?? "", to: changes.to.label ?? t("draft")})}/>
                <GuideChanges changes={changes}/>
            </Page>
        );
    });
}
