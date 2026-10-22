import {getTranslations} from "next-intl/server";
import {RevivalGrid} from "@/components/revival/revival-grid.client";
import {getMe, getRevivals} from "@/lib/revival/revival.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * The revivals the user can see, with their role in each.
 */
export default async function HomePage() {
    return withPolicyPage(Policies.app.requireAccess, async () => {
        const t = await getTranslations("Home");
        const [revivals, me] = await Promise.all([getRevivals(), getMe()]);
        const roles = Object.fromEntries((me?.revivalRoles ?? []).map(assignment => [assignment.revival.id, assignment.role]));

        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
                {revivals.length === 0 ? (
                    <>
                        <h2 className="text-lg font-bold tracking-tight">{t("myRevivals")}</h2>
                        <p className="text-muted-foreground">{t("empty")}</p>
                    </>
                ) : (
                    <RevivalGrid title={t("myRevivals")} revivals={revivals} roles={roles}/>
                )}
            </div>
        );
    });
}
