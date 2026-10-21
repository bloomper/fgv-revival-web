import {getTranslations} from "next-intl/server";
import {RevivalCard} from "@/components/revival/revival-card.client";
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
        const roles = new Map((me?.revivalRoles ?? []).map(assignment => [assignment.revival.id, assignment.role]));

        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
                <h2 className="text-2xl font-bold tracking-tight">{t("myRevivals")}</h2>
                {revivals.length === 0 ? (
                    <p className="text-muted-foreground">{t("empty")}</p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {revivals.map(revival => (
                            <RevivalCard key={revival.id} revival={revival} role={roles.get(revival.id) ?? null}/>
                        ))}
                    </div>
                )}
            </div>
        );
    });
}
