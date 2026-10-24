import Link from "next/link";
import {notFound} from "next/navigation";
import {getLocale, getTranslations} from "next-intl/server";
import {ArrowLeft} from "lucide-react";
import {pickText} from "@/components/guide/localized";
import {MailingEditor} from "@/components/mailing/mailing-editor.client";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getMailingEditorOptions, loadMailingPositions} from "@/lib/mailing/mailing.server";
import type {MailingValues} from "@/lib/mailing/schema";
import {formatDate} from "@/utils/format";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

async function load(id: string) {
    try {
        return await getMailingEditorOptions(id);
    } catch (error) {
        if (error instanceof GraphQLRequestError && (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")) {
            return null;
        }
        throw error;
    }
}

/**
 * A new mailing (M6b). From a plan entry (`?template=&event=`, M6B-FR-12) the audience, subject and body are filled
 * from the template in the reader's language, and the draft remembers the entry; the server prefills nothing.
 */
export default async function NewMailingPage({params, searchParams}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const {id} = await params;
    const query = await searchParams;

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const [options, {positions, unavailable}] = await Promise.all([load(id), loadMailingPositions()]);

        if (!options?.revival.permissions.canDraftMailings) {
            notFound();
        }

        const t = await getTranslations("Mailings");
        const locale = await getLocale();
        const {revival, events} = options;
        const entry = typeof query.template === "string"
            ? revival.mailingPlan.find(candidate => candidate.template.id === query.template && (candidate.event?.id ?? "") === (typeof query.event === "string" ? query.event : ""))
            : undefined;
        const defaults: MailingValues = entry ? {
            audience: {kind: entry.template.audience, positionId: "", eventId: entry.template.audience === "EVENT_ATTENDEES" ? entry.event?.id ?? "" : ""},
            subject: pickText(entry.template.subject, locale).text,
            body: pickText(entry.template.body, locale).text,
        } : {audience: {kind: "PARTICIPANTS", positionId: "", eventId: ""}, subject: "", body: ""};

        return (
            <div className="flex flex-1 flex-col gap-4">
                <Link href={`/revivals/${revival.id}/mailings`} className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="size-4"/>{t("back")}
                </Link>
                <div>
                    <h3 className="text-lg font-semibold">{t("newTitle")}</h3>
                    {entry && (
                        <p className="text-sm text-muted-foreground">
                            {t("fromPlan", {name: pickText(entry.template.name, locale).text, date: formatDate(entry.dueDate) ?? ""})}
                        </p>
                    )}
                </div>
                <MailingEditor revivalId={revival.id} defaults={defaults} events={events} positions={positions} positionsUnavailable={unavailable}
                               planned={entry ? {templateId: entry.template.id, eventId: entry.event?.id ?? null, subject: entry.template.subject, body: entry.template.body} : null}/>
            </div>
        );
    });
}
