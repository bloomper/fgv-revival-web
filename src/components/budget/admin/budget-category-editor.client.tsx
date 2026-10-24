"use client";

import {useTranslations} from "next-intl";
import {CatalogEditor, type CatalogRow} from "@/components/catalog/catalog-editor.client";
import {
    createBudgetCategoryAction,
    deleteBudgetCategoryAction,
    moveBudgetCategoryAction,
    restoreBudgetCategoryAction,
    retireBudgetCategoryAction,
    updateBudgetCategoryAction,
} from "@/app/(app)/admin/budget-categories/actions.server";
import {BUDGET_CATEGORY_KINDS, BUDGET_CATEGORY_ROLES} from "@/lib/budget/schema";

type Role = typeof BUDGET_CATEGORY_ROLES[number];
type Kind = typeof BUDGET_CATEGORY_KINDS[number];

const ACTIONS = {
    create: (input: { name: { sv: string; en?: string | null }; kind?: string; role?: string }) =>
        createBudgetCategoryAction({
            name: input.name,
            kind: (input.kind ?? "COST") as Kind,
            role: (input.role ?? "") as Role | ""
        }),
    update: (input: { id: string; version: number; name: { sv: string; en?: string | null }; role?: string }) =>
        updateBudgetCategoryAction({...input, role: (input.role ?? "") as Role | ""}),
    move: moveBudgetCategoryAction,
    retire: retireBudgetCategoryAction,
    restore: restoreBudgetCategoryAction,
    remove: deleteBudgetCategoryAction,
};

/**
 * The budget categories as the other lists the super admin keeps, with a kind chosen on create and a role per category:
 * at most one active category per role, which the server checks.
 */
export function BudgetCategoryEditor({entries}: { entries: CatalogRow[] }) {
    const t = useTranslations();

    return (
        <CatalogEditor entries={entries} actions={ACTIONS} label={t("BudgetCategoryAdmin.title")}
                       createLabel={t("BudgetCategoryAdmin.create")}
                       kindOptions={BUDGET_CATEGORY_KINDS.map(kind => ({
                           value: kind,
                           name: t(`Budget.kinds.${kind}`),
                           description: t(`BudgetCategoryAdmin.kindHelp.${kind}`)
                       }))}
                       kindTexts={{
                           label: t("BudgetCategoryAdmin.kind"),
                           choose: t("BudgetCategoryAdmin.kindChoose"),
                           fixed: t("BudgetCategoryAdmin.kindFixed")
                       }}
                       roleOptions={BUDGET_CATEGORY_ROLES.map(role => ({
                           value: role,
                           name: t(`Budget.roles.${role}`)
                       }))}/>
    );
}
