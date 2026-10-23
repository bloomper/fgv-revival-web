"use client";

import {useTranslations} from "next-intl";
import {CatalogEditor, type CatalogRow} from "@/components/catalog/catalog-editor.client";
import {
    createGuideItemTypeAction,
    deleteGuideItemTypeAction,
    moveGuideItemTypeAction,
    restoreGuideItemTypeAction,
    retireGuideItemTypeAction,
    updateGuideItemTypeAction,
} from "@/app/(app)/admin/guide-item-types/actions.server";

const ACTIONS = {
    create: createGuideItemTypeAction,
    update: updateGuideItemTypeAction,
    move: moveGuideItemTypeAction,
    retire: retireGuideItemTypeAction,
    restore: restoreGuideItemTypeAction,
    remove: deleteGuideItemTypeAction,
};

export function GuideItemTypeEditor({entries}: { entries: CatalogRow[] }) {
    const t = useTranslations("GuideItemTypeAdmin");

    return <CatalogEditor entries={entries} actions={ACTIONS} label={t("title")} createLabel={t("create")} withKind/>;
}
