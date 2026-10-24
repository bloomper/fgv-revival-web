"use client";

import * as React from "react";
import {useId, useRef, useState} from "react";
import {useTranslations} from "next-intl";
import {FileUp} from "lucide-react";
import {Button} from "@/components/ui/button";
import {cn} from "@/utils/utils";

/**
 * A file field in the application's language. The browser's own control says "Choose file" / "No file chosen" in the
 * browser's language, whatever the locale cookie says, so the native input is hidden and a translated button opens it.
 * The input keeps the `id`, so a `Label` with `htmlFor` still names it. `current` shows the file already saved, until
 * another is chosen.
 */
export function FileInput({id, accept, disabled, className, current, chooseLabel, onChange}: {
    id: string;
    accept?: string;
    disabled?: boolean;
    className?: string;
    current?: React.ReactNode;
    chooseLabel?: string;
    onChange: (file: File | null) => void;
}) {
    const t = useTranslations("Common");
    const input = useRef<HTMLInputElement>(null);
    const nameId = useId();
    const [name, setName] = useState<string | null>(null);

    return (
        <div className={cn("flex h-9 w-full min-w-0 items-center gap-3 rounded-md border border-input bg-transparent pl-1 pr-3 shadow-xs md:text-sm dark:bg-input/30",
            disabled && "opacity-50", className)}>
            <input ref={input} id={id} type="file" accept={accept} disabled={disabled} tabIndex={-1} className="sr-only"
                   onChange={(change) => {
                       const chosen = change.target.files?.[0] ?? null;

                       setName(chosen?.name ?? null);
                       onChange(chosen);
                   }}/>
            <Button type="button" variant="secondary" size="sm" className="h-7" disabled={disabled} aria-describedby={nameId}
                    onClick={() => input.current?.click()}>
                <FileUp/>
                {chooseLabel ?? t("chooseFile")}
            </Button>
            <span id={nameId} className={cn("truncate", !name && !current && "text-muted-foreground")}>{name ?? current ?? t("noFileChosen")}</span>
        </div>
    );
}
