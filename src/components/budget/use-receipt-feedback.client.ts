"use client";

import {useCallback} from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {toast} from "sonner";
import type {ReceiptResult} from "@/components/budget/receipt";

const OWN_MESSAGES = new Set(["receiptTooLarge", "receiptType"]);

/**
 * Shows the outcome of a receipt upload or removal, as {@code useActionFeedback} does for server actions.
 */
export function useReceiptFeedback() {
    const t = useTranslations();
    const router = useRouter();

    return useCallback((result: ReceiptResult, success?: string): boolean => {
        if (result.ok) {
            if (success) {
                toast.success(success);
            }
            router.refresh();
            return true;
        }
        if (result.message && OWN_MESSAGES.has(result.message)) {
            toast.error(t(`Validation.${result.message}`));
        } else if (result.status === 413) {
            toast.error(t("Validation.receiptTooLarge"));
        } else if (result.code === "BAD_REQUEST" && result.message) {
            toast.error(result.message);
        } else {
            toast.error(t(`Errors.${result.code && t.has(`Errors.${result.code}`) ? result.code : "INTERNAL_ERROR"}`));
        }
        return false;
    }, [router, t]);
}
