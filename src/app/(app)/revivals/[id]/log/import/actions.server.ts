"use server";

import {revalidatePath} from "next/cache";
import {getTranslations} from "next-intl/server";
import {type ActionResult, GraphQLRequestError, toActionResult} from "@/lib/graphql.server";
import {importLog, type LogImportPreview, previewLogImport} from "@/lib/decision-log/log.server";
import {logImportChoicesSchema, MAX_IMPORT_BYTES} from "@/lib/decision-log/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

async function workbook(formData: FormData): Promise<File> {
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0 || file.size > MAX_IMPORT_BYTES) {
        const t = await getTranslations("Log.import");

        throw new GraphQLRequestError("BAD_REQUEST", file instanceof File && file.size > 0 ? t("tooLarge") : t("noFile"));
    }
    return file;
}

export async function previewLogImportAction(revivalId: string, formData: FormData): Promise<ActionResult<LogImportPreview>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => previewLogImport(revivalId, await workbook(formData))));
}

export async function importLogAction(revivalId: string, formData: FormData): Promise<ActionResult<{ rowCount: number }>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const choices = logImportChoicesSchema.parse(JSON.parse(String(formData.get("choices") ?? "{}")));
        const result = await importLog(revivalId, await workbook(formData), choices);

        revalidatePath(`/revivals/${revivalId}`, "layout");
        return result;
    }));
}
