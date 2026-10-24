import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {InventoryTable} from "@/components/material/inventory-table.client";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getRevivalInventory} from "@/lib/material/material.server";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

async function load(id: string, includeRemoved: boolean) {
    try {
        return await getRevivalInventory(id, includeRemoved);
    } catch (error) {
        if (error instanceof GraphQLRequestError && (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")) {
            return null;
        }
        throw error;
    }
}

/**
 * The revival's inventory (M8-FR-4). Removed items only with {@code ?removed=1}.
 */
export default async function InventoryPage({params, searchParams}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const {id} = await params;
    const showRemoved = (await searchParams).removed === "1";

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const loaded = await load(id, showRemoved);

        if (!loaded) {
            notFound();
        }

        const t = await getTranslations("Inventory");
        const canWrite = loaded.revival.permissions.canWriteMaterials;

        return (
            <div className="flex flex-col gap-4">
                <h4 className="sr-only">{t("title")}</h4>
                <InventoryTable revivalId={loaded.revival.id} items={loaded.items} members={loaded.revival.ownerCandidates}
                                materials={loaded.materials.filter(material => !material.removed)} canWrite={canWrite} showRemoved={showRemoved && canWrite}/>
            </div>
        );
    });
}
