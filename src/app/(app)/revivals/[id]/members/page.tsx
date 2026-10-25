import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {MemberTable} from "@/components/member/member-table.client";
import {CatalogProvider} from "@/components/catalog/catalog-provider.client";
import {getCapabilities} from "@/lib/catalog/catalog.server";
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
 * A revival's directeurs and steering group. The layout fetches the same revival, which urql answers from its request
 * cache; both show a revival the user cannot see as not found.
 */
export default async function RevivalMembersPage({params}: { params: Promise<{ id: string }> }) {
    const {id} = await params;

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const revival = await loadRevival(id);

        if (!revival) {
            notFound();
        }

        const t = await getTranslations("Revival");
        // Only those who manage the steering group pick areas of responsibility; members already carry their names
        const capabilities = revival.permissions.canManageSteeringGroup ? await getCapabilities() : [];

        return (
            <div className="flex flex-1 flex-col gap-4">
                <h3 className="sr-only">{t("members")}</h3>
                <CatalogProvider capabilities={capabilities}>
                    <MemberTable revivalId={revival.id} members={revival.members}
                                 canManageDirecteurs={revival.permissions.canManageDirecteurs}
                                 canManageSteeringGroup={revival.permissions.canManageSteeringGroup}/>
                </CatalogProvider>
            </div>
        );
    });
}
