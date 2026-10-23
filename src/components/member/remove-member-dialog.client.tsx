"use client";

import * as React from "react";
import {useTransition} from "react";
import {useTranslations} from "next-intl";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {removeMemberAction} from "@/app/(app)/revivals/[id]/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {track} from "@/utils/umami";

export function RemoveMemberDialog({memberId, name, open, onOpenChange}: {
    memberId: string;
    name: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const t = useTranslations();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("Members.confirmRemoveTitle", {name})}</AlertDialogTitle>
                    <AlertDialogDescription>{t("Members.confirmRemoveText")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t("Common.cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        disabled={pending}
                        onClick={() => startTransition(async () => {
                            if (feedback(await removeMemberAction(memberId), t("Members.removed"))) {
                                track("member-remove");
                                onOpenChange(false);
                            }
                        })}
                    >
                        {t("Common.remove")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
