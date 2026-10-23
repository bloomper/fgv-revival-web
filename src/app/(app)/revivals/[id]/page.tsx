import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {RevivalDetails} from "@/components/revival/revival-details.client";
import {MemberSummary} from "@/components/member/member-summary";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getRevival} from "@/lib/revival/revival.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

async function loadRevival(id: string) {
    try {
        return await getRevival(id);
    } catch (error) {
        if (error instanceof GraphQLRequestError && error.code === "NOT_FOUND") {
            return null;
        }
        throw error;
    }
}

/**
 * A revival's overview: details, status and who leads it. The layout fetches the same revival, which urql answers from
 * its request cache; both show a revival the user cannot see as not found (FR-017).
 */
export default async function RevivalPage({params}: { params: Promise<{ id: string }> }) {
    const {id} = await params;

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const revival = await loadRevival(id);

        if (!revival) {
            notFound();
        }

        const t = await getTranslations("Revival");

        return (
            <div className="flex flex-1 flex-col gap-6">
                <h3 className="sr-only">{t("overview")}</h3>
                <RevivalDetails key={revival.version} revival={revival}/>
                <MemberSummary revivalId={revival.id} members={revival.members}/>
            </div>
        );
    });
}
