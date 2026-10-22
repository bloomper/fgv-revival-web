import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {RevivalDetails} from "@/components/revival/revival-details.client";
import {DirecteurList} from "@/components/member/directeur-list.client";
import {SteeringGroupList} from "@/components/member/steering-group-list.client";
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
 * A revival's overview: details, directeurs and steering group. The layout fetches the same revival, which urql
 * answers from its request cache; both show a revival the user cannot see as not found (FR-017).
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

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle>{t("directeurs")}</CardTitle></CardHeader>
                        <CardContent>
                            <DirecteurList revivalId={revival.id} members={revival.members} canManage={revival.permissions.canManageDirecteurs}/>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>{t("steeringGroup")}</CardTitle></CardHeader>
                        <CardContent>
                            <SteeringGroupList revivalId={revival.id} members={revival.members} canManage={revival.permissions.canManageSteeringGroup}/>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    });
}
