"use client";

import {useTranslations} from "next-intl";
import {Printer} from "lucide-react";
import {Button} from "@/components/ui/button";

/** Opens the browser's print dialog; never printed itself. */
export function PrintButton() {
    const t = useTranslations("Staffing");

    return <Button className="print:hidden" onClick={() => window.print()}><Printer/>{t("print")}</Button>;
}
