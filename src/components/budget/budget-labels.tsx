import type {ComponentProps} from "react";
import {useLocale, useTranslations} from "next-intl";
import {Badge} from "@/components/ui/badge";
import {NativeSelect} from "@/components/ui/native-select";
import {catalogChoices, catalogName} from "@/components/catalog/catalog";
import type {LocalizedTextValue} from "@/components/guide/localized";
import {formatAmount} from "@/utils/format";
import {cn} from "@/utils/utils";

export type BudgetCategoryKind = "INCOME" | "COST";

export type BudgetCategoryValue = {
    id: string;
    kind: BudgetCategoryKind;
    role?: string | null;
    name: LocalizedTextValue;
    retired: boolean;
};

/**
 * An amount in kronor, right-aligned in tables, never wrapping. A negative result is shown in the destructive colour.
 */
export function AmountText({value, className, signed = false}: { value: string | null | undefined; className?: string; signed?: boolean }) {
    const negative = signed && !!value && value.startsWith("-") && !/^-0*(\.0*)?$/.test(value);

    return (
        <span className={cn("whitespace-nowrap tabular-nums", negative && "text-destructive", className)}>
            {formatAmount(value) ?? "—"}
        </span>
    );
}

export function KindBadge({kind}: { kind: BudgetCategoryKind }) {
    const t = useTranslations("Budget");

    return <Badge variant={kind === "INCOME" ? "secondary" : "outline"}>{t(`kinds.${kind}`)}</Badge>;
}

/**
 * Picks a category, income and costs apart. Retired categories are offered only when the row already holds one.
 */
export function CategorySelect({categories, held, ...props}: {
    categories: BudgetCategoryValue[];
    held?: BudgetCategoryValue | null;
} & Omit<ComponentProps<"select">, "size">) {
    const t = useTranslations();
    const locale = useLocale();
    const choices = catalogChoices(categories, held ? [held] : []);

    return (
        <NativeSelect className="w-full" {...props}>
            <option value="">{t("Budget.chooseCategory")}</option>
            {(["INCOME", "COST"] as const).map(kind => (
                <optgroup key={kind} label={t(`Budget.kinds.${kind}`)}>
                    {choices.filter(category => category.kind === kind).map(category => (
                        <option key={category.id} value={category.id}>
                            {category.retired ? t("Catalog.retiredName", {name: catalogName(category, locale)}) : catalogName(category, locale)}
                        </option>
                    ))}
                </optgroup>
            ))}
        </NativeSelect>
    );
}
