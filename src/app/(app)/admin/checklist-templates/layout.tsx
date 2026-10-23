import * as React from "react";
import {Suspense} from "react";
import {Skeleton} from "@/components/ui/skeleton";
import {TemplateNav, TemplatePageHeader} from "@/components/checklist/template/template-nav.client";
import {getChecklistTemplates} from "@/lib/checklist/template.server";
import {getGuideLatestVersion} from "@/lib/guide/guide.server";
import {isSuperAdmin} from "@/utils/auth";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * Checklist templates (M3 US5). Super admins get the list of templates beside the one they edit, kept here so moving
 * between templates only reloads the template; others who may read a template see it on its own (FR-003).
 */
export default async function ChecklistTemplatesLayout({children}: { children: React.ReactNode }) {
    return withPolicyPage(Policies.app.requireAccess, async ({roles}) => {
        if (!isSuperAdmin(roles)) {
            return <div className="flex flex-1 flex-col p-4 md:p-8">{children}</div>;
        }

        const [templates, latest] = await Promise.all([getChecklistTemplates(true), getGuideLatestVersion()]);
        const chapters = (latest?.chapters ?? []).map(chapter => ({key: chapter.key, title: chapter.title}));

        return (
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                <Suspense fallback={<Skeleton className="h-8 w-64"/>}>
                    <TemplatePageHeader/>
                </Suspense>
                <div className="flex flex-1 flex-col gap-6 lg:flex-row">
                    <Suspense fallback={<Skeleton className="h-96 lg:w-80 lg:shrink-0"/>}>
                        <TemplateNav templates={templates} chapters={chapters}/>
                    </Suspense>
                    <div className="flex min-w-0 flex-1 flex-col">{children}</div>
                </div>
            </div>
        );
    });
}
