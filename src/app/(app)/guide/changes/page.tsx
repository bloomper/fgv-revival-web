import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {GuideChanges} from "@/components/guide/guide-changes.client";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getGuideChanges} from "@/lib/guide/guide.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * What changed between two versions, {@code ?from=&to=} (FR-016).
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
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
                <h2 className="text-lg font-bold tracking-tight">
                    {t("title", {from: changes.from.label ?? "", to: changes.to.label ?? t("draft")})}
                </h2>
                <GuideChanges changes={changes}/>
            </div>
        );
    });
}
