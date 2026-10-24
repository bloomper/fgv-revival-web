"use client";

import * as React from "react";
import {useId, useState} from "react";
import {useTranslations} from "next-intl";
import {Input} from "@/components/ui/input";
import {NativeSelect} from "@/components/ui/native-select";

export type OwnerMember = { id: string; displayName?: string | null };
export type OwnerFieldValue = { personId?: string | null; name?: string | null } | null;

const NONE = "";
const OTHER = "__other";
const NAME_MAX_LENGTH = 100;

/**
 * Picks an owner: an active directeur or steering group member, or someone outside the steering group by name, or
 * nobody (M3 FR-009). Produces the server's `OwnerInput`. A current owner who has left the steering group stays a choice,
 * so the row keeps them until someone picks another owner.
 */
export function OwnerField({members, value, onChange, disabled, current, label, noneLabel}: {
    members: OwnerMember[];
    value: OwnerFieldValue;
    onChange: (value: OwnerFieldValue) => void;
    disabled?: boolean;
    current?: OwnerMember | null;
    /** The field's label, when it is not the owner, e.g. who paid a cost. */
    label?: string;
    /** What choosing nobody means there, e.g. paid from the revival's account. */
    noneLabel?: string;
}) {
    const t = useTranslations("Owner");
    const id = useId();
    const [other, setOther] = useState(Boolean(value?.name));
    const selected = value?.personId ? value.personId : other ? OTHER : NONE;

    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-sm font-medium">{label ?? t("label")}</label>
            <NativeSelect
                id={id}
                value={selected}
                disabled={disabled}
                onChange={(event) => {
                    const next = event.target.value;

                    setOther(next === OTHER);
                    if (next === OTHER) {
                        onChange({name: value?.name ?? ""});
                    } else if (next === NONE) {
                        onChange(null);
                    } else {
                        onChange({personId: next});
                    }
                }}
            >
                <option value={NONE}>{noneLabel ?? t("none")}</option>
                {current && !members.some(member => member.id === current.id) && (
                    <option value={current.id}>{current.displayName ?? current.id} ({t("formerMember")})</option>
                )}
                {members.map(member => <option key={member.id} value={member.id}>{member.displayName ?? member.id}</option>)}
                <option value={OTHER}>{t("someoneElse")}</option>
            </NativeSelect>
            {other && (
                <Input
                    aria-label={t("name")}
                    placeholder={t("namePlaceholder")}
                    maxLength={NAME_MAX_LENGTH}
                    value={value?.name ?? ""}
                    disabled={disabled}
                    onChange={(event) => onChange({name: event.target.value})}
                />
            )}
        </div>
    );
}
