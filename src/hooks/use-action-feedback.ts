"use client";

import {useCallback} from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {toast} from "sonner";
import type {ActionResult} from "@/lib/graphql.server";

/**
 * Shows the outcome of a server action. A conflict offers to reload; a validation error shows the
 * server's own, already localised, message.
 */
export function useActionFeedback() {
    const t = useTranslations();
    const router = useRouter();

    return useCallback(<T, >(result: ActionResult<T>, success?: string): result is { ok: true; data: T } => {
        if (result.ok) {
            if (success) {
                toast.success(success);
            }
            router.refresh();
            return true;
        }

        if (result.code === "CONFLICT") {
            toast.error(t("Errors.CONFLICT"), {action: {label: t("Common.reload"), onClick: () => router.refresh()}});
        } else if (result.code === "BAD_REQUEST" && result.message) {
            toast.error(result.message);
        } else {
            toast.error(t(`Errors.${result.code}`));
        }
        return false;
    }, [router, t]);
}
