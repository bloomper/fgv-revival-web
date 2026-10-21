import Link from "next/link";
import {notFound} from "next/navigation";
import {BookOpen} from "lucide-react";
import {Button} from "@/components/ui/button";
import {getTranslations} from "next-intl/server";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {StatusBadge} from "@/components/revival/status-badge";
import {SpexTitle} from "@/components/revival/spex-title";
import {RevivalStatusSelect} from "@/components/revival/revival-status-select.client";
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
 * One revival: details, status, directeurs and steering group. A revival the user cannot see is shown as not found
 * (FR-017).
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
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight">{revival.workingTitle}</h2>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <SpexTitle spex={revival.spex}/> · {revival.year} · <StatusBadge status={revival.status}/>
                        </div>
                    </div>
                    <RevivalStatusSelect revivalId={revival.id} status={revival.status} allowedStatuses={revival.permissions.allowedStatuses}/>
                </div>

                <RevivalDetails key={revival.version} revival={revival}/>

                <div>
                    <Button variant="outline" render={<Link href={`/revivals/${revival.id}/guide`}/>}>
                        <BookOpen/>
                        {revival.guideVersion ? t("guideVersion", {label: revival.guideVersion.label ?? ""}) : t("guide")}
                    </Button>
                </div>

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
