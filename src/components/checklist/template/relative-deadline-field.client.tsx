"use client";

import {useId} from "react";
import {useFormatter, useTranslations} from "next-intl";
import type {RelativeDeadlineKind, Weekday} from "@/gql/graphql";
import {Input} from "@/components/ui/input";
import {NativeSelect} from "@/components/ui/native-select";
import {formatDate} from "@/utils/format";
import {AMOUNT_LIMIT, applyRelativeDeadline, type RelativeDeadlineValue, validRelativeDeadline, WEEKDAYS} from "@/lib/checklist/relative-deadline";

const NONE = "";

function nextSaturday(today = new Date()) {
    const date = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

    date.setUTCDate(date.getUTCDate() + ((6 - date.getUTCDay() + 7) % 7 || 7));
    return date.toISOString().slice(0, 10);
}

/**
 * A template item's deadline relative to the checklist's date (FR-031), with a live example so the rule can be checked
 * while it is written.
 */
export function RelativeDeadlineField({value, onChange, exampleDate}: {
    value: RelativeDeadlineValue | null;
    onChange: (value: RelativeDeadlineValue | null) => void;
    exampleDate?: string;
}) {
    const t = useTranslations("ChecklistTemplate.deadline");
    const format = useFormatter();
    const id = useId();
    const example = exampleDate ?? nextSaturday();
    const before = (value?.amount ?? 0) <= 0;
    const amount = Math.abs(value?.amount ?? 0);
    const asDate = (date: string) => `${format.dateTime(new Date(`${date}T12:00:00`), {weekday: "long"})} ${formatDate(date)}`;
    const changeKind = (kind: RelativeDeadlineKind | typeof NONE) => onChange(kind === NONE ? null
        : kind === "WEEKDAY_WEEK_BEFORE" ? {kind, amount: null, weekday: value?.weekday ?? "MONDAY"} : {kind, amount: value?.amount ?? -1, weekday: null});

    return (
        <fieldset className="space-y-2">
            <legend className="text-sm font-medium">{t("label")}</legend>
            <div className="flex flex-wrap items-center gap-2">
                <NativeSelect aria-label={t("kind")} value={value?.kind ?? NONE}
                        onChange={event => changeKind(event.target.value as RelativeDeadlineKind | typeof NONE)}>
                    <option value={NONE}>{t("none")}</option>
                    <option value="DAYS">{t("DAYS")}</option>
                    <option value="WORKING_DAYS">{t("WORKING_DAYS")}</option>
                    <option value="WEEKDAY_WEEK_BEFORE">{t("WEEKDAY_WEEK_BEFORE")}</option>
                </NativeSelect>
                {value && value.kind !== "WEEKDAY_WEEK_BEFORE" && (
                    <>
                        <Input id={`${id}-amount`} aria-label={t("amount")} type="number" min={0} max={AMOUNT_LIMIT} className="w-24" value={amount}
                               onChange={event => onChange({...value, amount: (before ? -1 : 1) * Math.min(AMOUNT_LIMIT, Math.abs(Number(event.target.value) || 0))})}/>
                        <NativeSelect aria-label={t("direction")} value={before ? "before" : "after"}
                                onChange={event => onChange({...value, amount: (event.target.value === "before" ? -1 : 1) * amount})}>
                            <option value="before">{t("before")}</option>
                            <option value="after">{t("after")}</option>
                        </NativeSelect>
                    </>
                )}
                {value?.kind === "WEEKDAY_WEEK_BEFORE" && (
                    <NativeSelect aria-label={t("weekday")} value={value.weekday ?? "MONDAY"}
                            onChange={event => onChange({...value, weekday: event.target.value as Weekday})}>
                        {WEEKDAYS.map(weekday => <option key={weekday} value={weekday}>{t(`weekdays.${weekday}`)}</option>)}
                    </NativeSelect>
                )}
            </div>
            {value && validRelativeDeadline(value) && (
                <p className="text-sm text-muted-foreground" aria-live="polite">
                    {t("example", {date: asDate(example), deadline: asDate(applyRelativeDeadline(value, example))})}
                </p>
            )}
        </fieldset>
    );
}
