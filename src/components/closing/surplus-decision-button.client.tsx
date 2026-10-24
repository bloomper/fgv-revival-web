"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import {Gavel} from "lucide-react";
import {Button} from "@/components/ui/button";
import {LogEntryDialog} from "@/components/decision-log/log-entry-dialog.client";
import type {OwnerMember} from "@/components/owner/owner-field.client";

/**
 * Opens the log entry dialog for a new DECISION tagged "överskott" (or "surplus" in English), which the closing summary
 * then finds as the surplus decision (M7-FR-9).
 */
export function SurplusDecisionButton({revivalId, members}: { revivalId: string; members: OwnerMember[] }) {
    const t = useTranslations("Closing");
    const [open, setOpen] = useState(false);
    const tag = t("surplusTag");

    return (
        <>
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                <Gavel/>
                {t("recordSurplus")}
            </Button>
            {open && (
                <LogEntryDialog revivalId={revivalId} entry={null} initial={{type: "DECISION", tags: [tag]}}
                                members={members} tags={[tag]}
                                open onOpenChange={setOpen}/>
            )}
        </>
    );
}
