import Link from "next/link";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {Card, CardContent} from "@/components/ui/card";
import {GuidePdfButton} from "@/components/guide/guide-pdf-button.client";
import {GuideSearch} from "@/components/guide/guide-search.client";
import {GuideView} from "@/components/guide/guide-view.client";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getGuideLatestVersion, getGuideVersion, getGuideVersions} from "@/lib/guide/guide.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

async function load(version: string | undefined) {
    try {
        const versions = await getGuideVersions();
        const shown = version ? await getGuideVersion(version) : await getGuideLatestVersion();

        return {versions, shown, refused: false};
    } catch (error) {
        if (error instanceof GraphQLRequestError && error.code === "FORBIDDEN") {
            return {versions: [], shown: null, refused: true};
        }
        if (error instanceof GraphQLRequestError && error.code === "NOT_FOUND") {
            notFound();
        }
        throw error;
    }
}

/**
 * The guide: the latest published version, or the one in {@code ?version=} (FR-001–FR-003, US2).
 */
export default async function GuidePage({searchParams}: { searchParams: Promise<{ version?: string }> }) {
    const {version} = await searchParams;

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const t = await getTranslations("Guide");
        const {versions, shown, refused} = await load(version);

        if (refused) {
            return (
                <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
                    <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
                    <Card><CardContent className="pt-6 text-sm">{t("refused")}</CardContent></Card>
                </div>
            );
        }

        return (
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="text-2xl font-bold tracking-tight">
                        {t("title")}{shown?.label ? ` ${shown.label}` : shown?.status === "DRAFT" ? ` (${t("draft")})` : ""}
                    </h2>
                    {versions.length > 1 && (
                        <nav aria-label={t("versions")} className="flex flex-wrap gap-2 text-sm">
                            <span className="text-muted-foreground">{t("versions")}:</span>
                            {versions.map(entry => (
                                <Link key={entry.id} href={`/guide?version=${entry.id}`}
                                      aria-current={entry.id === shown?.id ? "page" : undefined}
                                      className={entry.id === shown?.id ? "font-semibold" : "underline-offset-2 hover:underline"}>
                                    {entry.label}
                                </Link>
                            ))}
                        </nav>
                    )}
                </div>
                {shown ? (
                    <>
                        <div><GuidePdfButton versionId={shown.id}/></div>
                        <GuideSearch versionId={shown.id}/>
                        <GuideView version={shown}/>
                    </>
                ) : (
                    <Card><CardContent className="pt-6 text-sm">{t("notPublished")}</CardContent></Card>
                )}
            </div>
        );
    });
}
