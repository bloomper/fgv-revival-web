"use client";

import * as React from "react";
import {useState} from "react";
import {useTranslations} from "next-intl";
import {Plus} from "lucide-react";
import {Button} from "@/components/ui/button";
import {MeetingDialog} from "@/components/meeting/meeting-dialog.client";

export function NewMeetingButton({revivalId, members}: { revivalId: string; members: { id: string; displayName?: string | null }[] }) {
    const t = useTranslations("Meeting");
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setOpen(true)}><Plus/>{t("new")}</Button>
            {open && <MeetingDialog revivalId={revivalId} meeting={null} members={members} open onOpenChange={setOpen}/>}
        </>
    );
}
