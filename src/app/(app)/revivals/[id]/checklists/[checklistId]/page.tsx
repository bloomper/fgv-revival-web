import Link from "next/link";
import {notFound} from "next/navigation";
import {getLocale, getTranslations} from "next-intl/server";
import {ArrowLeft} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {ChecklistActions} from "@/components/checklist/checklist-actions.client";
import {ChecklistTips} from "@/components/checklist/checklist-tips";
import {EventChecklistDialog} from "@/components/checklist/event-checklist-dialog.client";
import {ChecklistView} from "@/components/checklist/checklist-view.client";
import {pickText} from "@/components/guide/localized";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getChecklist} from "@/lib/checklist/checklist.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

async function load(revivalId: string, id: string) {
    try {
        return await getChecklist(revivalId, id);
    } catch (error) {
        if (error instanceof GraphQLRequestError && (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")) {
            return null;
        }
        throw error;
    }
}

/**
 * One checklist: a guide chapter's with the chapter's tips (M3 FR-029), or an event's.
 */
export default async function ChecklistPage({params}: { params: Promise<{ id: string; checklistId: string }> }) {
    const {id, checklistId} = await params;

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const loaded = await load(id, checklistId);

        if (!loaded) {
            notFound();
        }

        const t = await getTranslations("Checklist");
        const locale = await getLocale();
        const {revival, checklist} = loaded;
        const title = checklist.kind === "CHAPTER"
            ? checklist.chapterTitle ? pickText(checklist.chapterTitle, locale).text : checklist.chapterKey ?? ""
            : checklist.name ?? "";

        return (
            <div className="flex flex-1 flex-col gap-4">
                <div className="space-y-1">
                    <Link href={`/revivals/${revival.id}/checklists`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
                        <ArrowLeft className="size-4"/>
                        {t("title")}
                    </Link>
                    <h3 className="flex flex-wrap items-center gap-2 text-lg font-bold tracking-tight">
                        {title}
                        {checklist.date && <span className="text-base font-normal text-muted-foreground">{checklist.date}</span>}
                        {checklist.cancelled && <Badge variant="outline">{t("cancelled")}</Badge>}
                    </h3>
                    {checklist.template && (
                        <Link href={`/admin/checklist-templates/${checklist.template.id}`} className="text-sm text-muted-foreground hover:underline">
                            {t("fromTemplate", {name: checklist.template.name ? pickText(checklist.template.name, locale).text : ""})}
                        </Link>
                    )}
                </div>
                <ChecklistTips tips={checklist.tips}/>
                <ChecklistView revivalId={revival.id} checklistId={checklist.id} items={checklist.items} members={revival.ownerCandidates}
                               canWrite={revival.permissions.canWriteLog} canWaive={revival.permissions.canWaiveRequirement}
                               cancelled={checklist.cancelled} actions={(
                    <>
                        {checklist.kind === "EVENT" && <EventChecklistDialog revivalId={revival.id} templates={[]} checklist={checklist}/>}
                        <ChecklistActions revivalId={revival.id} checklist={checklist} templates={checklist.templatesAvailable}/>
                    </>
                )}/>
            </div>
        );
    });
}
