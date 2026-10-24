"use client";

import {useId} from "react";
import {usePathname, useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {Label} from "@/components/ui/label";
import {NativeSelect} from "@/components/ui/native-select";
import {formatDate} from "@/utils/format";

type PickerEvent = { id: string; title: string; startDate: string; endDate: string };

export function eventLabel(event: PickerEvent) {
    const dates = event.startDate === event.endDate ? formatDate(event.startDate) : `${formatDate(event.startDate)} – ${formatDate(event.endDate)}`;

    return `${event.title} (${dates})`;
}

/**
 * The event whose staffing is shown, kept in the URL (`?event=`) so each event has its own link.
 */
export function StaffingEventPicker({events, selected, view}: {
    events: PickerEvent[];
    selected: string;
    view: string | null
}) {
    const t = useTranslations("Staffing");
    const id = useId();
    const router = useRouter();
    const pathname = usePathname();

    return (
        <div className="flex flex-col gap-1">
            <Label htmlFor={id}>{t("event")}</Label>
            <NativeSelect id={id} className="w-full md:w-96" value={selected}
                          onChange={change => router.push(`${pathname}?${new URLSearchParams({event: change.target.value, ...(view ? {view} : {})})}`)}>
                {events.map(event => <option key={event.id} value={event.id}>{eventLabel(event)}</option>)}
            </NativeSelect>
        </div>
    );
}
