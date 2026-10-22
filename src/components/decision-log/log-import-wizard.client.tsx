"use client";

import * as React from "react";
import {useState, useTransition} from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {type ImportChoiceState, LogImportPreview} from "@/components/decision-log/log-import-preview";
import {importLogAction, previewLogImportAction} from "@/app/(app)/revivals/[id]/log/import/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import type {LogImportPreview as Preview} from "@/lib/decision-log/log.server";
import {MAX_IMPORT_BYTES} from "@/lib/decision-log/schema";

/**
 * Imports an Excel log once, into an empty log: choose the file, check the preview and match owners, confirm (M3
 * FR-036–FR-042). The file is sent again on confirm, so nothing is stored in between.
 */
export function LogImportWizard({revivalId}: { revivalId: string }) {
    const t = useTranslations("Log");
    const router = useRouter();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<Preview | null>(null);
    const [choices, setChoices] = useState<ImportChoiceState>({owners: {}, nobelType: "TODO"});

    const form = (extra?: Record<string, string>) => {
        const data = new FormData();

        data.append("file", file!);
        Object.entries(extra ?? {}).forEach(([key, value]) => data.append(key, value));
        return data;
    };

    return (
        <div className="space-y-6">
            <form className="flex flex-col gap-2 sm:flex-row sm:items-end" onSubmit={(event) => {
                event.preventDefault();
                if (!file) {
                    return;
                }
                if (file.size > MAX_IMPORT_BYTES) {
                    toast.error(t("import.tooLarge"));
                    return;
                }
                startTransition(async () => {
                    const result = await previewLogImportAction(revivalId, form());

                    if (feedback(result)) {
                        setPreview(result.data);
                        setChoices({
                            nobelType: "TODO",
                            owners: Object.fromEntries(result.data.owners.map(owner =>
                                [owner.name, owner.suggestedPersonId == null ? null : String(owner.suggestedPersonId)])),
                        });
                    }
                });
            }}>
                <div className="space-y-2">
                    <Label htmlFor="log-import-file">{t("import.file")}</Label>
                    <Input id="log-import-file" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                           onChange={(event) => {
                               setFile(event.target.files?.[0] ?? null);
                               setPreview(null);
                           }}/>
                </div>
                <Button type="submit" variant="outline" disabled={!file || pending}>{t("import.preview")}</Button>
            </form>
            {preview && (
                <>
                    <LogImportPreview preview={preview} choices={choices} onChange={setChoices}/>
                    <Button disabled={pending} onClick={() => startTransition(async () => {
                        const payload = {owners: choices.owners, ...(preview.layout === "NOBEL" ? {nobelType: choices.nobelType} : {})};
                        const result = await importLogAction(revivalId, form({choices: JSON.stringify(payload)}));

                        if (feedback(result, t("import.done", {count: result.ok ? result.data.rowCount : 0}))) {
                            router.push(`/revivals/${revivalId}/log`);
                        }
                    })}>
                        {t("import.confirm", {count: preview.rowCount})}
                    </Button>
                </>
            )}
        </div>
    );
}
