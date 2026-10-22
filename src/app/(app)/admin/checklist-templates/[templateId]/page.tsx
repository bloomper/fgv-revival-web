import Link from "next/link";
import {notFound} from "next/navigation";
import {getLocale, getTranslations} from "next-intl/server";
import {ArrowLeft} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {pickText} from "@/components/guide/localized";
import {TemplateEditor} from "@/components/checklist/template/template-editor.client";
import {TemplateHeader} from "@/components/checklist/template/template-header.client";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getChecklistTemplate} from "@/lib/checklist/template.server";
import {isSuperAdmin} from "@/utils/auth";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

async function load(id: string) {
    try {
        return await getChecklistTemplate(id);
    } catch (error) {
        if (error instanceof GraphQLRequestError && (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")) {
            return null;
        }
        throw error;
    }
}

/**
 * One checklist template and its items (M3 US5). Super admins edit it; others who may read templates see it read-only
 * (FR-003).
 */
export default async function ChecklistTemplatePage({params}: { params: Promise<{ templateId: string }> }) {
    const {templateId} = await params;

    return withPolicyPage(Policies.app.requireAccess, async ({roles}) => {
        const template = await load(templateId);

        if (!template) {
            notFound();
        }

        const superAdmin = isSuperAdmin(roles);
        const t = await getTranslations();
        const locale = await getLocale();
        const title = template.kind === "PHASE"
            ? t("ChecklistTemplate.phaseTitle", {phase: template.phase ?? ""})
            : template.name ? pickText(template.name, locale).text : "";

        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
                <div className="space-y-1">
                    {superAdmin && (
                        <Link href="/admin/checklist-templates" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
                            <ArrowLeft className="size-4"/>
                            {t("ChecklistTemplate.title")}
                        </Link>
                    )}
                    <h2 className="flex flex-wrap items-center gap-2 text-lg font-bold tracking-tight">
                        {title}
                        {template.retired && <Badge variant="outline">{t("ChecklistTemplate.retired")}</Badge>}
                    </h2>
                </div>
                {superAdmin && !template.retired && <TemplateHeader template={template}/>}
                <TemplateEditor templateId={template.id} kind={template.kind} items={template.items} readOnly={!superAdmin || template.retired}/>
            </div>
        );
    });
}
