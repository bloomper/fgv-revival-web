"use client";

import * as React from "react";
import {useId, useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Archive, ArchiveRestore, ArrowDown, ArrowUp, Pencil, Plus, Trash2} from "lucide-react";
import type {GuideItemKind} from "@/gql/graphql";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle} from "@/components/ui/sheet";
import type {CatalogEntryValue} from "@/components/catalog/catalog";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import type {ActionResult} from "@/lib/graphql.server";
import {catalogNameSchema, type CatalogNameValues, GUIDE_ITEM_KINDS, MAX_CATALOG_NAME} from "@/lib/catalog/schema";

export type CatalogRow = CatalogEntryValue & { position: number; inUse: boolean; version: number; kind?: GuideItemKind };

type Transition = { id: string; version: number };

export type CatalogActions = {
    create: (input: { name: CatalogNameValues; kind?: GuideItemKind }) => Promise<ActionResult<null>>;
    update: (input: Transition & { name: CatalogNameValues }) => Promise<ActionResult<null>>;
    move: (input: Transition & { position: number }) => Promise<ActionResult<null>>;
    retire: (input: Transition) => Promise<ActionResult<null>>;
    restore: (input: Transition) => Promise<ActionResult<null>>;
    remove: (input: Transition) => Promise<ActionResult<null>>;
};

/**
 * Creating or renaming an entry: its Swedish and English names and, for a new guide item type, its kind, which is
 * fixed from then on.
 */
function EntrySheet({entry, withKind, createLabel, actions, open, onOpenChange}: {
    entry: CatalogRow | null;
    withKind: boolean;
    createLabel: string;
    actions: CatalogActions;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const t = useTranslations();
    const id = useId();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const [kind, setKind] = useState<GuideItemKind>("TIP");
    const form = useForm<CatalogNameValues>({
        resolver: zodResolver(catalogNameSchema),
        defaultValues: {sv: entry?.name.sv ?? "", en: entry?.name.en ?? ""},
    });
    const {errors} = form.formState;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[600px] flex flex-col gap-0 p-0 h-full">
                <SheetHeader className="p-6 pb-4 shrink-0">
                    <SheetTitle>{entry ? t("Catalog.editTitle") : createLabel}</SheetTitle>
                    {withKind && <SheetDescription>{entry ? t("Catalog.kindFixed") : t("Catalog.kindDescription")}</SheetDescription>}
                </SheetHeader>
                <form className="flex min-h-0 flex-1 flex-col overflow-hidden" onSubmit={form.handleSubmit(name => startTransition(async () => {
                    const result = entry
                        ? await actions.update({id: entry.id, version: entry.version, name})
                        : await actions.create({name, kind: withKind ? kind : undefined});

                    if (feedback(result, t("Common.saved"))) {
                        onOpenChange(false);
                    }
                }))}>
                    <ScrollArea className="min-h-0 flex-1 border-t">
                        <div className="space-y-4 px-6 py-6 pb-12">
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-sv`}>{t("Catalog.nameSv")}</Label>
                                <Input id={`${id}-sv`} maxLength={MAX_CATALOG_NAME} aria-invalid={errors.sv ? true : undefined} {...form.register("sv")}/>
                                {errors.sv?.message && <p className="text-sm text-destructive">{t(`Validation.${errors.sv.message}`)}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-en`}>{t("Catalog.nameEn")}</Label>
                                <Input id={`${id}-en`} maxLength={MAX_CATALOG_NAME} {...form.register("en")}/>
                            </div>
                            {withKind && !entry && (
                                <fieldset className="space-y-2">
                                    <legend className="text-sm font-medium">{t("Catalog.kind")}</legend>
                                    {GUIDE_ITEM_KINDS.map(option => (
                                        <label key={option} className="flex items-start gap-2 rounded-md border p-3 text-sm">
                                            <input type="radio" name={`${id}-kind`} className="mt-0.5" value={option} checked={kind === option}
                                                   onChange={() => setKind(option)}/>
                                            <span>
                                                <span className="block font-medium">{t(`Catalog.kinds.${option}.name`)}</span>
                                                <span className="block text-muted-foreground">{t(`Catalog.kinds.${option}.description`)}</span>
                                            </span>
                                        </label>
                                    ))}
                                </fieldset>
                            )}
                        </div>
                    </ScrollArea>
                    <SheetFooter className="p-6 pt-4 border-t bg-muted/30 shrink-0 mt-auto">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("Common.cancel")}</Button>
                        <Button type="submit" disabled={pending}>{t("Common.save")}</Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}

/**
 * A list the super admin keeps, in the order pickers show it: added, renamed, moved, retired and restored. Only an
 * entry nothing uses can be deleted; one in use is retired, so rows that hold it keep it.
 */
export function CatalogEditor({entries, actions, label, createLabel, withKind = false}: {
    entries: CatalogRow[];
    label: string;
    actions: CatalogActions;
    createLabel: string;
    withKind?: boolean;
}) {
    const t = useTranslations();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const [editing, setEditing] = useState<CatalogRow | null>(null);
    const [adding, setAdding] = useState(false);
    const run = (work: () => Promise<ActionResult<null>>, success?: string) => startTransition(async () => {
        feedback(await work(), success);
    });

    return (
        <div className="space-y-3">
            <Button onClick={() => setAdding(true)}><Plus/>{createLabel}</Button>
            {entries.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("Catalog.empty")}</p>
            ) : (
                <ol className="space-y-2" aria-label={label}>
                    {entries.map((entry, index) => {
                        const name = entry.name.sv;
                        // The server orders the whole list, retired entries too, so move to the neighbour's place
                        const above = entries[index - 1];
                        const below = entries[index + 1];

                        return (
                            <li key={entry.id} className="flex gap-3 rounded-lg border p-3">
                                <div className="min-w-0 flex-1 space-y-1">
                                    <p className={entry.retired ? "text-muted-foreground" : undefined}>{name}</p>
                                    {entry.name.en && <p className="text-sm text-muted-foreground">{entry.name.en}</p>}
                                    <div className="flex flex-wrap gap-2 text-sm">
                                        {entry.kind && <Badge variant="secondary">{t(`Catalog.kinds.${entry.kind}.name`)}</Badge>}
                                        {entry.retired && <Badge variant="outline">{t("Catalog.retired")}</Badge>}
                                        {entry.inUse && <Badge variant="outline">{t("Catalog.inUse")}</Badge>}
                                    </div>
                                </div>
                                <div className="flex shrink-0 flex-wrap items-start justify-end gap-1">
                                    <Button size="icon" variant="ghost" aria-label={t("Catalog.moveUp", {name})} disabled={pending || !above}
                                            onClick={() => above && run(() => actions.move({id: entry.id, version: entry.version, position: above.position}))}><ArrowUp/></Button>
                                    <Button size="icon" variant="ghost" aria-label={t("Catalog.moveDown", {name})} disabled={pending || !below}
                                            onClick={() => below && run(() => actions.move({id: entry.id, version: entry.version, position: below.position}))}><ArrowDown/></Button>
                                    <Button size="icon" variant="ghost" aria-label={t("Catalog.edit", {name})} onClick={() => setEditing(entry)}><Pencil/></Button>
                                    {entry.retired ? (
                                        <Button size="icon" variant="ghost" aria-label={t("Catalog.restore", {name})} disabled={pending}
                                                onClick={() => run(() => actions.restore({id: entry.id, version: entry.version}), t("Catalog.restored", {name}))}><ArchiveRestore/></Button>
                                    ) : (
                                        <Button size="icon" variant="ghost" aria-label={t("Catalog.retire", {name})} disabled={pending}
                                                onClick={() => run(() => actions.retire({id: entry.id, version: entry.version}), t("Catalog.retiredDone", {name}))}><Archive/></Button>
                                    )}
                                    {!entry.inUse && (
                                        <AlertDialog>
                                            <AlertDialogTrigger render={<Button size="icon" variant="ghost" aria-label={t("Catalog.delete", {name})} disabled={pending}/>}>
                                                <Trash2/>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>{t("Catalog.deleteTitle", {name: entry.name.sv})}</AlertDialogTitle>
                                                    <AlertDialogDescription>{t("Catalog.deleteDescription")}</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>{t("Common.cancel")}</AlertDialogCancel>
                                                    <AlertDialogAction variant="destructive" disabled={pending}
                                                                       onClick={() => run(() => actions.remove({id: entry.id, version: entry.version}), t("Catalog.deleted", {name}))}>
                                                        {t("Common.delete")}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ol>
            )}
            {(adding || editing) && (
                <EntrySheet key={editing?.id ?? "new"} entry={editing} withKind={withKind} createLabel={createLabel} actions={actions} open
                            onOpenChange={open => {
                                if (!open) {
                                    setAdding(false);
                                    setEditing(null);
                                }
                            }}/>
            )}
        </div>
    );
}
