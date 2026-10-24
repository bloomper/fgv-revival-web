import * as React from "react";
import Link from "next/link";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {ArrowLeft} from "lucide-react";
import {navChapters} from "@/components/guide/chapters";
import {GuideChapterNav} from "@/components/guide/guide-chapter-nav.client";
import {loadGuideDraft} from "@/app/(app)/admin/guide/draft/load.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

/**
 * The draft's chapters, with the chapter list that stays while moving between them. Super admins only.
 */
export default async function GuideDraftChaptersLayout({children}: { children: React.ReactNode }) {
    return withPolicyPage(Policies.admin.requireSuperAdmin, async () => {
        const t = await getTranslations("Guide");
        const draft = await loadGuideDraft();

        if (!draft) {
            notFound();
        }

        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
                <Link href="/admin/guide/draft"
                      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
                    <ArrowLeft className="size-4"/>
                    {t("admin.draft")}
                </Link>
                <div className="flex flex-col gap-6 lg:flex-row">
                    <GuideChapterNav chapters={navChapters(draft.draft)} basePath="/admin/guide/draft"/>
                    <div className="min-w-0 flex-1 space-y-8">{children}</div>
                </div>
            </div>
        );
    });
}
