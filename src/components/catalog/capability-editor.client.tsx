"use client";

import {useTranslations} from "next-intl";
import {CatalogEditor, type CatalogRow} from "@/components/catalog/catalog-editor.client";
import {
    createCapabilityAction,
    deleteCapabilityAction,
    moveCapabilityAction,
    restoreCapabilityAction,
    retireCapabilityAction,
    updateCapabilityAction,
} from "@/app/(app)/admin/capabilities/actions.server";

const ACTIONS = {
    create: createCapabilityAction,
    update: updateCapabilityAction,
    move: moveCapabilityAction,
    retire: retireCapabilityAction,
    restore: restoreCapabilityAction,
    remove: deleteCapabilityAction,
};

export function CapabilityEditor({entries}: { entries: CatalogRow[] }) {
    const t = useTranslations("CapabilityAdmin");

    return <CatalogEditor entries={entries} actions={ACTIONS} label={t("title")} createLabel={t("create")}/>;
}
