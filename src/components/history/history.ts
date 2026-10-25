import type {AuditedType, FieldKind} from "@/gql/graphql";
import {formatAmount, formatDate, formatInstant} from "@/utils/format";

type Translator = {
    (key: string): string;
    has: (key: string) => boolean;
};

/**
 * Where the labels of an enum field already live, so the history says what the rest of the page says.
 */
const ENUM_LABELS: Partial<Record<AuditedType, Record<string, string>>> = {
    LOG_ENTRY: {type: "Log.type", status: "Log.status"},
    CHECKLIST_ITEM: {state: "Checklist.state"},
    MATERIAL: {category: "Material.categories", visibility: "Material.visibilities"},
};

function humanize(field: string): string {
    const words = field.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();

    return words.charAt(0).toUpperCase() + words.slice(1);
}

export function historyFieldLabel(t: Translator, type: AuditedType, field: string): string {
    const key = `History.fields.${type}.${field}`;

    return t.has(key) ? t(key) : humanize(field);
}

/**
 * A changed value as the field is shown elsewhere: dates and times as always, amounts in kronor, enums by their
 * label. Null stays null, for the caller to show as empty.
 */
export function historyValue(t: Translator, type: AuditedType, field: string, kind: FieldKind, value: string | null | undefined): string | null {
    if (value === null || value === undefined) {
        return null;
    }

    switch (kind) {
        case "DATE":
            return formatDate(value);
        case "INSTANT":
            return formatInstant(value);
        case "AMOUNT":
            return formatAmount(value);
        case "BOOLEAN":
            return t(value === "true" ? "History.yes" : "History.no");
        case "ENUM": {
            const prefix = ENUM_LABELS[type]?.[field];

            return prefix && t.has(`${prefix}.${value}`) ? t(`${prefix}.${value}`) : value;
        }
        default:
            return value;
    }
}
