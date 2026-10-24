import Link from "next/link";
import {notFound} from "next/navigation";
import {getLocale, getTranslations} from "next-intl/server";
import {ArrowLeft} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {pickText} from "@/components/guide/localized";
import {CatalogProvider} from "@/components/catalog/catalog-provider.client";
import {TemplateEditor} from "@/components/checklist/template/template-editor.client";
import {TemplateNameForm, TemplateRetirement} from "@/components/checklist/template/template-header.client";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getCapabilities} from "@/lib/catalog/catalog.server";
import {getChecklistTemplate} from "@/lib/checklist/template.server";
import {isSuperAdmin} from "@/utils/auth";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";
import {cn} from "@/utils/utils";

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
 * (FR-003). The list of templates beside it is in the layout.
 */
export default async function ChecklistTemplatePage({params, searchParams}: {
    params: Promise<{ templateId: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const {templateId} = await params;
    const retired = (await searchParams).retired === "1";

    return withPolicyPage(Policies.app.requireAccess, async ({roles}) => {
        const template = await load(templateId);

        if (!template) {
            notFound();
        }

        const superAdmin = isSuperAdmin(roles);
        // Under the page heading the layout gives super admins; on its own otherwise.
        const Heading = superAdmin ? "h3" : "h2";
        const capabilities = superAdmin && !template.retired ? await getCapabilities() : [];
        const t = await getTranslations();
        const locale = await getLocale();
        const title = template.kind === "CHAPTER"
            ? template.chapterTitle
                ? t("ChecklistTemplate.chapterTitle", {chapter: pickText(template.chapterTitle, locale).text})
                : t("ChecklistTemplate.chapterGone")
            : template.name ? pickText(template.name, locale).text : "";

        return (
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-end justify-between gap-2">
                    <div className="space-y-1">
                        {superAdmin && (
                            <Link href={`/admin/checklist-templates${retired ? "?retired=1" : ""}`}
                                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline lg:hidden">
                                <ArrowLeft className="size-4"/>
                                {t("ChecklistTemplate.title")}
                            </Link>
                        )}
                        <Heading
                            className={cn("flex flex-wrap items-center gap-2 tracking-tight", superAdmin ? "text-base font-semibold" : "text-lg font-bold")}>
                            {title}
                            {template.retired && <Badge variant="outline">{t("ChecklistTemplate.retired")}</Badge>}
                        </Heading>
                    </div>
                    {superAdmin && <TemplateRetirement template={template}/>}
                </div>
                {superAdmin && !template.retired && template.kind === "EVENT" &&
                    <TemplateNameForm key={template.id} template={template}/>}
                <CatalogProvider capabilities={capabilities}>
                    <TemplateEditor key={template.id} templateId={template.id} kind={template.kind}
                                    items={template.items} retiredItems={template.retiredItems}
                                    showRetired={retired} readOnly={!superAdmin || template.retired}/>
                </CatalogProvider>
            </div>
        );
    });
}
