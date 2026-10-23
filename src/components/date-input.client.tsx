"use client";

import * as React from "react";
import {useRef, useState} from "react";
import {useLocale, useTranslations} from "next-intl";
import {CalendarIcon} from "lucide-react";
import {enGB, sv} from "date-fns/locale";
import {Button} from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar";
import {Input} from "@/components/ui/input";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {cn} from "@/utils/utils";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function toIso(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function fromIso(value: string): Date | undefined {
    if (!ISO_DATE.test(value)) {
        return undefined;
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return date.getMonth() === month - 1 ? date : undefined;
}

/**
 * A date field that always reads and writes yyyy-mm-dd, whatever the browser's language, with a calendar beside it.
 * It takes the props of an `<input>`, so `form.register()` works unchanged: picking a day sets the input's value and
 * fires an input event, as typing would.
 */
export function DateInput({className, ref, disabled, "aria-label": ariaLabel, ...props}: React.ComponentProps<"input">) {
    const t = useTranslations("Common");
    const locale = useLocale();
    const input = useRef<HTMLInputElement | null>(null);
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<Date | undefined>();

    const setRef = (element: HTMLInputElement | null) => {
        input.current = element;
        if (typeof ref === "function") {
            ref(element);
        } else if (ref) {
            ref.current = element;
        }
    };

    const pick = (date: Date | undefined) => {
        const element = input.current;

        if (element && date) {
            // Through the native setter, so React and react-hook-form see the change as user input
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(element, toIso(date));
            element.dispatchEvent(new Event("input", {bubbles: true}));
            element.focus();
        }
        setOpen(false);
    };

    return (
        <div className={cn("flex w-fit items-center gap-1", className)}>
            <Input {...props} ref={setRef} type="text" inputMode="numeric" autoComplete="off" placeholder={t("datePlaceholder")}
                   pattern="\d{4}-\d{2}-\d{2}" maxLength={10} className="w-32 tabular-nums" disabled={disabled} aria-label={ariaLabel}/>
            <Popover open={open} onOpenChange={(next) => {
                if (next) {
                    setSelected(fromIso(input.current?.value ?? ""));
                }
                setOpen(next);
            }}>
                <PopoverTrigger render={<Button type="button" variant="outline" size="icon" disabled={disabled}
                                                aria-label={ariaLabel ? `${t("pickDate")}: ${ariaLabel}` : t("pickDate")}/>}>
                    <CalendarIcon/>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" locale={locale === "sv" ? sv : enGB} weekStartsOn={1} selected={selected}
                              defaultMonth={selected} onSelect={pick} autoFocus/>
                </PopoverContent>
            </Popover>
        </div>
    );
}
