"use client";

import * as React from "react";
import {useState, useTransition} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {BookOpen, MoreHorizontal, Trash2} from "lucide-react";
import {DataTable, type DataTableColumnDef, SortableHeader} from "@/components/data-table.client";
import {DataEmpty} from "@/components/data-empty";
import {PlainText} from "@/components/plain-text";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {deleteGuideVersionAction} from "@/app/(app)/admin/guide/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {formatInstant} from "@/utils/format";

export type GuideVersion = {
    id: string;
    label: string | null;
    note: string | null;
    publishedAt: string | null;
    publishedBy: string | null;
    revivalCount: number;
    suggestionCount: number;
    deletable: boolean;
    version: number;
};

/**
 * Why a version cannot be deleted, or nothing when it can.
 */
function useInUse() {
    const t = useTranslations("Guide.admin");

    return (version: GuideVersion) => version.deletable ? null
        : version.revivalCount > 0 ? t("inUseRevivals", {count: version.revivalCount})
            : t("inUseSuggestions", {count: version.suggestionCount});
}

function useColumns(onDelete: (version: GuideVersion) => void): DataTableColumnDef<GuideVersion>[] {
    const t = useTranslations();
    const inUse = useInUse();

    return [
        {
            id: "label",
            accessorFn: version => version.label ?? undefined,
            sortFn: "alphanumeric",
            sortUndefined: "last",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("Guide.admin.versionLabel")}/>,
            cell: ({row}) => <span className="font-medium">{row.original.label}</span>,
        },
        {
            id: "note",
            enableSorting: false,
            header: () => t("Guide.admin.note"),
            cell: ({row}) => <span className="line-clamp-1 text-muted-foreground">{row.original.note}</span>,
            meta: {className: "max-w-0 w-full"},
        },
        {
            id: "publishedAt",
            accessorFn: version => version.publishedAt ?? undefined,
            sortFn: "basic",
            sortUndefined: "last",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("Guide.admin.publishedAt")}/>,
            cell: ({row}) => formatInstant(row.original.publishedAt)?.slice(0, 10),
            meta: {className: "whitespace-nowrap"},
        },
        {
            id: "revivalCount",
            accessorFn: version => version.revivalCount,
            sortFn: "basic",
            header: ({column}) => <SortableHeader column={column} sorted={column.getIsSorted()} title={t("Guide.admin.revivals")}/>,
            meta: {className: "text-right"},
        },
        {
            id: "actions",
            header: () => <span className="sr-only">{t("Admin.actions")}</span>,
            cell: ({row}) => {
                const reason = inUse(row.original);

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0"
                                                             aria-label={t("Admin.openMenu", {title: row.original.label ?? ""})}/>}>
                            <MoreHorizontal className="h-4 w-4"/>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem render={<Link href={`/guide/versions/${row.original.id}`}/>}>
                                <BookOpen/>
                                {t("Guide.admin.view")}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" disabled={!row.original.deletable} onClick={() => onDelete(row.original)}>
                                <Trash2/>
                                <span className="flex flex-col">
                                    {t("Guide.admin.delete")}
                                    {reason && <span className="text-xs text-muted-foreground">{reason}</span>}
                                </span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
            meta: {className: "w-12 text-right"},
        },
    ];
}

/**
 * A summary of a published version, read only, as Spexregister shows a row it opens. The menu's View opens all of it.
 */
function GuideVersionViewDialog({version, onClose}: { version: GuideVersion | null; onClose: () => void }) {
    const t = useTranslations();
    const inUse = useInUse();
    const field = (label: string, value: React.ReactNode) => (
        <div className="space-y-1">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{label}</p>
            <div className="text-sm">{value || "–"}</div>
        </div>
    );

    return (
        <Dialog open={!!version} onOpenChange={open => !open && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="pr-6 text-xl">{version?.label}</DialogTitle>
                    <DialogDescription className="sr-only">{t("Guide.admin.versionDetails")}</DialogDescription>
                </DialogHeader>
                {version && (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {field(t("Guide.admin.publishedAt"), formatInstant(version.publishedAt))}
                        {field(t("Guide.admin.publishedBy"), version.publishedBy)}
                        {field(t("Guide.admin.revivals"), version.revivalCount)}
                        {field(t("Guide.admin.suggestions"), version.suggestionCount)}
                        <div className="sm:col-span-2">{field(t("Guide.admin.note"), version.note && <PlainText text={version.note}/>)}</div>
                        {!version.deletable && <p className="text-sm text-muted-foreground sm:col-span-2">{inUse(version)}</p>}
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>{t("Common.close")}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/**
 * The published versions of the guide, newest first, with how many revivals follow each (US3). A row opens the version's
 * summary; its menu opens the whole version in the guide, or deletes a version nothing uses.
 */
export function GuideVersionTable({versions}: { versions: GuideVersion[] }) {
    const t = useTranslations();
    const router = useRouter();
    const feedback = useActionFeedback();
    const [viewing, setViewing] = useState<GuideVersion | null>(null);
    const [deleting, setDeleting] = useState<GuideVersion | null>(null);
    const [pending, startTransition] = useTransition();
    const columns = useColumns(setDeleting);

    return (
        <>
            <DataTable columns={columns} data={versions} initialSorting={[{id: "publishedAt", desc: true}]} onRowClick={setViewing}
                       empty={<DataEmpty icon={BookOpen} title={t("Guide.notPublished")} description={t("Guide.admin.notPublishedHint")}/>}/>
            <GuideVersionViewDialog version={viewing} onClose={() => setViewing(null)}/>
            <AlertDialog open={!!deleting} onOpenChange={open => !open && setDeleting(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("Guide.admin.deleteTitle", {label: deleting?.label ?? ""})}</AlertDialogTitle>
                        <AlertDialogDescription>{t("Guide.admin.deleteDescription")}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("Common.cancel")}</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" disabled={pending} onClick={() => deleting && startTransition(async () => {
                            if (feedback(await deleteGuideVersionAction({id: deleting.id, version: deleting.version}), t("Guide.admin.deleted"))) {
                                setDeleting(null);
                                router.refresh();
                            }
                        })}>
                            {t("Guide.admin.delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
