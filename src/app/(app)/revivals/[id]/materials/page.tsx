import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {MaterialTable} from "@/components/material/material-table.client";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getRevivalMaterials} from "@/lib/material/material.server";
import {getPositions} from "@/lib/participant/participant.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

async function load(id: string, includeRemoved: boolean) {
    try {
        return await getRevivalMaterials(id, includeRemoved);
    } catch (error) {
        if (error instanceof GraphQLRequestError && (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")) {
            return null;
        }
        throw error;
    }
}

// Positions come from Spexregister; without them a material is not given new positions, the rest works
async function loadPositions() {
    try {
        return {positions: (await getPositions()).positions, unavailable: false};
    } catch (error) {
        if (error instanceof GraphQLRequestError) {
            return {positions: [], unavailable: true};
        }
        throw error;
    }
}

/**
 * The revival's materials (M8-FR-3): links to where its files are kept. Removed ones only with {@code ?removed=1}.
 */
export default async function MaterialsPage({params, searchParams}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const {id} = await params;
    const showRemoved = (await searchParams).removed === "1";

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const [loaded, positions] = await Promise.all([load(id, showRemoved), loadPositions()]);

        if (!loaded) {
            notFound();
        }

        const t = await getTranslations("Material");
        const canWrite = loaded.revival.permissions.canWriteMaterials;

        return (
            <div className="flex flex-col gap-4">
                <h4 className="sr-only">{t("materials")}</h4>
                <MaterialTable revivalId={loaded.revival.id} materials={loaded.materials} services={loaded.services}
                               positions={positions.positions}
                               positionsUnavailable={positions.unavailable} canWrite={canWrite}
                               showRemoved={showRemoved && canWrite}/>
            </div>
        );
    });
}
