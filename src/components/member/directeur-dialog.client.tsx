"use client";

import * as React from "react";
import {Users} from "lucide-react";
import {useTranslations} from "next-intl";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {DirecteurList} from "@/components/member/directeur-list.client";
import type {Member} from "@/components/member/member-list.client";

/**
 * Appointing and removing directeurs straight from the all-revivals list (FR-021).
 */
export function DirecteurDialog({revivalId, workingTitle, members}: { revivalId: string; workingTitle: string; members: Member[] }) {
    const t = useTranslations();
    const title = t("Admin.manageDirecteursFor", {title: workingTitle});

    return (
        <Dialog>
            <DialogTrigger render={<Button variant="outline" size="sm" aria-label={title}/>}>
                <Users/>
                {t("Admin.manageDirecteurs")}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{t("Admin.manageDirecteursDescription")}</DialogDescription>
                </DialogHeader>
                <DirecteurList revivalId={revivalId} members={members} canManage/>
            </DialogContent>
        </Dialog>
    );
}
