import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {MailingPlan} from "@/components/mailing/mailing-plan";
import {MailingTable} from "@/components/mailing/mailing-table.client";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getMailings} from "@/lib/mailing/mailing.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

async function load(id: string) {
    try {
        return await getMailings(id);
    } catch (error) {
        if (error instanceof GraphQLRequestError && (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")) {
            return null;
        }
        throw error;
    }
}

/**
 * A revival's mailings: the mailing plan from the super admin's templates, with what is due highlighted,
 * and the mailings themselves. Directeurs and the steering group draft; the directeur and COMMS send.
 */
export default async function MailingsPage({params}: { params: Promise<{ id: string }> }) {
    const {id} = await params;

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const data = await load(id);

        if (!data?.revival.permissions.canReadMailings) {
            notFound();
        }

        const t = await getTranslations("Mailings");
        const {revival, mailings} = data;

        return (
            <div className="flex flex-1 flex-col gap-6">
                <h3 className="sr-only">{t("title")}</h3>
                <section aria-labelledby="mailing-plan" className="flex flex-col gap-3">
                    <div>
                        <h4 id="mailing-plan" className="font-semibold">{t("plan")}</h4>
                        <p className="text-sm text-muted-foreground">{t("planDescription")}</p>
                    </div>
                    <MailingPlan revivalId={revival.id} entries={revival.mailingPlan}
                                 canDraft={revival.permissions.canDraftMailings}/>
                </section>
                <section aria-labelledby="mailing-list" className="flex flex-col gap-3">
                    <h4 id="mailing-list" className="font-semibold">{t("list")}</h4>
                    <MailingTable revivalId={revival.id} mailings={mailings}
                                  canDraft={revival.permissions.canDraftMailings}/>
                </section>
            </div>
        );
    });
}
