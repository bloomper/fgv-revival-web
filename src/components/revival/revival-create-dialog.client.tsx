"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import {Plus} from "lucide-react";
import {Button} from "@/components/ui/button";
import {RevivalFormSheet} from "@/components/revival/revival-form-sheet.client";

/**
 * The button that records a new revival (FR-006).
 */
export function RevivalCreateDialog({defaultOpen = false}: { defaultOpen?: boolean }) {
    const t = useTranslations("Admin");
    const [open, setOpen] = useState(defaultOpen);

    return (
        <RevivalFormSheet open={open} onOpenChange={setOpen} trigger={
                                                                 <Button size="sm" className="h-8 w-full lg:w-auto">
                                                                     <Plus/>
                                                                     {t("create")}
                                                                 </Button>
                                                             }/>
    );
}
