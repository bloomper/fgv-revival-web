"use client";

import {useTransition} from "react";
import {useTranslations} from "next-intl";
import {Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {discardGuideAction} from "@/app/(app)/admin/guide/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {track} from "@/utils/umami";

/**
 * Discards the draft after explicit confirmation, saying how many accepted suggestions will reopen (FR-015).
 */
export function GuideDiscardDialog({draftId, version, acceptedSuggestionCount}: {
    draftId: string;
    version: number;
    acceptedSuggestionCount: number
}) {
    const t = useTranslations();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();

    return (
        <AlertDialog>
            <AlertDialogTrigger render={<Button variant="outline" className="text-destructive hover:text-destructive"/>}>
                <Trash2/>
                {t("Guide.discard.open")}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("Guide.discard.title")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t("Guide.discard.description")}
                        {acceptedSuggestionCount > 0 && <> {t("Guide.discard.reopens", {count: acceptedSuggestionCount})}</>}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t("Common.cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        disabled={pending}
                        onClick={() => startTransition(async () => {
                            if (feedback(await discardGuideAction({id: draftId, version}), t("Guide.discard.done"))) {
                                track("guide-discard");
                            }
                        })}
                    >
                        {t("Guide.discard.confirm")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
