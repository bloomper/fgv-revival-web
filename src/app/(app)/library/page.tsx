import {forbidden} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {ShowRetiredSwitch} from "@/components/show-retired-switch.client";
import {LibraryList} from "@/components/library/library-list.client";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getLibraryEntries} from "@/lib/library/library.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";
import {Page, PageHeader} from "@bloomper/fgv-web-ui/shell/page-header";

async function entries(includeRetired: boolean) {
    try {
        return await getLibraryEntries(includeRetired);
    } catch (error) {
        if (error instanceof GraphQLRequestError && error.code === "FORBIDDEN") {
            forbidden();
        }
        throw error;
    }
}

/**
 * The reference library: venues, ticket services, role descriptions and roles to contact. Whoever reads the guide reads
 * it; super admins keep it here, and see retired entries when they ask for them.
 */
export default async function LibraryPage({searchParams}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
    const askedForRetired = (await searchParams).retired === "1";

    return withPolicyPage(Policies.app.requireAccess, async authz => {
        const t = await getTranslations("Library");
        const canEdit = authz.roles.includes("SUPER_ADMIN");
        const retired = canEdit && askedForRetired;
        const list = await entries(retired);

        return (
            <Page variant="content">
                <PageHeader title={t("title")} actions={<>{canEdit && <ShowRetiredSwitch shown={retired} label={t("showRetired")}/>}</>}/>
                <p className="max-w-prose text-sm text-muted-foreground">{t("intro")}</p>
                <LibraryList entries={list} canEdit={canEdit}/>
            </Page>
        );
    });
}
