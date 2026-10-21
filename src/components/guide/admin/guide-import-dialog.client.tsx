"use client";

import * as React from "react";
import {useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {Upload} from "lucide-react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {importGuideAction} from "@/app/(app)/admin/guide/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {MAX_IMPORT_BYTES} from "@/lib/guide/schema";
import {track} from "@/utils/umami";

/**
 * Uploads guide v5 as the first draft (FR-022). Offered only while no version is published and there is no draft.
 */
export function GuideImportDialog() {
    const t = useTranslations();
    const feedback = useActionFeedback();
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [pending, startTransition] = useTransition();

    const choose = (event: React.ChangeEvent<HTMLInputElement>) => {
        const chosen = event.target.files?.[0] ?? null;

        if (chosen && chosen.size > MAX_IMPORT_BYTES) {
            toast.error(t("Guide.import.tooLarge"));
            event.target.value = "";
            setFile(null);
            return;
        }
        setFile(chosen);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button/>}>
                <Upload/>
                {t("Guide.import.open")}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("Guide.import.title")}</DialogTitle>
                    <DialogDescription>{t("Guide.import.description")}</DialogDescription>
                </DialogHeader>
                <form
                    className="space-y-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        if (!file) {
                            return;
                        }

                        const data = new FormData();

                        data.append("file", file);
                        startTransition(async () => {
                            if (feedback(await importGuideAction(data), t("Guide.import.done"))) {
                                track("guide-import");
                                setOpen(false);
                                setFile(null);
                            }
                        });
                    }}
                >
                    <div className="space-y-2">
                        <Label htmlFor="guide-import-file">{t("Guide.import.file")}</Label>
                        <Input
                            id="guide-import-file"
                            type="file"
                            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={choose}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={!file || pending}>{t("Guide.import.submit")}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
