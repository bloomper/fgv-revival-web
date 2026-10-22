"use client";

import {useTransition} from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {FilePlus2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {startDraftAction} from "@/app/(app)/admin/guide/draft/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {track} from "@/utils/umami";

/**
 * Starts a draft as a copy of the latest version, or empty before the first one (FR-012), then opens the editor.
 */
export function GuideStartDraftButton() {
    const t = useTranslations("Guide.admin");
    const feedback = useActionFeedback();
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    return (
        <Button disabled={pending} onClick={() => startTransition(async () => {
            if (feedback(await startDraftAction(), t("draftStarted"))) {
                track("guide-draft-start");
                router.push("/admin/guide/draft");
            }
        })}>
            <FilePlus2/>
            {t("startDraft")}
        </Button>
    );
}
