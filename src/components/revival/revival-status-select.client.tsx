"use client";

import * as React from "react";
import {useTransition} from "react";
import {useTranslations} from "next-intl";
import {NativeSelect} from "@/components/ui/native-select";
import type {RevivalStatus} from "@/gql/graphql";
import {changeStatusAction} from "@/app/(app)/revivals/[id]/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {track} from "@/utils/umami";

/**
 * Offers exactly the statuses the server allows (`permissions.allowedStatuses`) and sends the status shown as `from`,
 * so a change someone else made in between is refused as a conflict (research R12).
 */
export function RevivalStatusSelect({revivalId, status, allowedStatuses}: {
    revivalId: string;
    status: RevivalStatus;
    allowedStatuses: RevivalStatus[];
}) {
    const t = useTranslations();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();

    if (allowedStatuses.length === 0) {
        return null;
    }

    return (
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
                    startTransition(async () => {
                        if (feedback(await changeStatusAction({id: revivalId, from: status, to}), t("Revival.statusChanged"))) {
                            track("revival-status", {from: status, to});
                        }
                    });
                }}
            >
                <option value="">{t("Revival.changeStatus")}…</option>
                {allowedStatuses.map(allowed => (
                    <option key={allowed} value={allowed}>{t(`Status.${allowed}`)}</option>
                ))}
            </NativeSelect>
        </label>
    );
}
