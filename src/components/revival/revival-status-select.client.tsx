"use client";

import * as React from "react";
import {useState, useTransition} from "react";
import Link from "next/link";
import {useTranslations} from "next-intl";
import {NativeSelect} from "@/components/ui/native-select";
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
import type {RevivalStatus} from "@/gql/graphql";
import {changeStatusAction} from "@/app/(app)/revivals/[id]/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {track} from "@/utils/umami";

/**
 * Offers exactly the statuses the server allows (`permissions.allowedStatuses`) and sends the status shown as `from`,
 * so a change someone else made in between is refused as a conflict (research R12). Archiving a revival whose
 * participation sync never completed, or failed, asks first (M7-FR-14).
 */
export function RevivalStatusSelect({revivalId, status, allowedStatuses, syncIncomplete = false}: {
    revivalId: string;
    status: RevivalStatus;
    allowedStatuses: RevivalStatus[];
    syncIncomplete?: boolean;
}) {
    const t = useTranslations();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const [confirmArchive, setConfirmArchive] = useState(false);

    if (allowedStatuses.length === 0) {
        return null;
    }

    const change = (to: RevivalStatus) => startTransition(async () => {
        if (feedback(await changeStatusAction({id: revivalId, from: status, to}), t("Revival.statusChanged"))) {
            track("revival-status", {from: status, to});
        }
        setConfirmArchive(false);
    });

    return (
        <>
            <label className="flex items-center gap-2 text-sm">
                <span className="sr-only">{t("Revival.changeStatus")}</span>
                <NativeSelect size="sm"
                              aria-label={t("Revival.changeStatus")}
                              value=""
                              disabled={pending}
                              onChange={(event) => {
                                  const to = event.target.value as RevivalStatus;

                                  if (!to) {
                                      return;
                                  }
                                  if (to === "ARCHIVED" && syncIncomplete) {
                                      setConfirmArchive(true);
                                  } else {
                                      change(to);
                                  }
                              }}
                >
                    <option value="">{t("Revival.changeStatus")}…</option>
                    {allowedStatuses.map(allowed => (
                        <option key={allowed} value={allowed}>{t(`Status.${allowed}`)}</option>
                    ))}
                </NativeSelect>
            </label>
            <AlertDialog open={confirmArchive} onOpenChange={setConfirmArchive}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("Revival.archiveSyncTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("Revival.archiveSyncDescription")}{" "}
                            <Link href={`/revivals/${revivalId}/closing`} className="underline">{t("Revival.archiveSyncLink")}</Link>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("Common.cancel")}</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" disabled={pending} onClick={() => change("ARCHIVED")}>
                            {t("Revival.archiveAnyway")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
