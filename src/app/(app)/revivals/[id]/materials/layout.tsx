import * as React from "react";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {MaterialNav} from "@/components/material/material-nav.client";
import {ReadOnlyNotice} from "@/components/revival/read-only-notice";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getMaterialsAccess} from "@/lib/material/material.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

async function load(id: string) {
    try {
        return await getMaterialsAccess(id);
    } catch (error) {
        if (error instanceof GraphQLRequestError && (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")) {
            return null;
        }
        throw error;
    }
}

/**
 * A revival's materials and inventory (M8), each its own route. Only those the server lets read them (`canReadMaterials`:
 * super admins, directeurs and the steering group, not observers) find them;
 * participants see the materials meant for them on their own page.
 */
export default async function MaterialsLayout({children, params}: {
    children: React.ReactNode;
    params: Promise<{ id: string }>
}) {
    const {id} = await params;

    return withPolicyPage(Policies.app.requireAccess, async ({roles}) => {
        const revival = await load(id);

        if (!revival?.permissions.canReadMaterials) {
            notFound();
        }

        const t = await getTranslations("Material");

        return (
            <div className="flex flex-1 flex-col gap-4">
                <h3 className="sr-only">{t("title")}</h3>
                <ReadOnlyNotice revivalId={revival.id} status={revival.status}
                                canWrite={revival.permissions.canWriteMaterials} roles={roles}/>
                <MaterialNav revivalId={revival.id}/>
                {children}
            </div>
        );
    });
}
