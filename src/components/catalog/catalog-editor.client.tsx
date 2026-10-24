"use client";

import * as React from "react";
import {useId, useState, useTransition} from "react";
import {useTranslations} from "next-intl";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Archive, ArchiveRestore, ArrowDown, ArrowUp, Pencil, Plus, Trash2} from "lucide-react";
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
import {NativeSelect} from "@/components/ui/native-select";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle} from "@/components/ui/sheet";
import type {CatalogEntryValue} from "@/components/catalog/catalog";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import type {ActionResult} from "@/lib/graphql.server";
import {catalogNameSchema, type CatalogNameValues, GUIDE_ITEM_KINDS, MAX_CATALOG_NAME} from "@/lib/catalog/schema";

export type CatalogRow = CatalogEntryValue & { position: number; inUse: boolean; version: number; kind?: string; role?: string | null };

type Transition = { id: string; version: number };

/** A choice of kind or role, with its name and, for kinds, what it means. */
export type CatalogOption = { value: string; name: string; description?: string };

/** What the sheet says about a list's kinds: the field's legend, and the hints when choosing and once fixed. */
export type CatalogKindTexts = { label: string; choose: string; fixed: string };

/**
 * What a list's entries hold beyond their names, e.g. a link service's hosts: the sheet shows its fields below the names
 * and sends the value with {@code extra}; the list shows {@code summary} under each entry.
 */
export type CatalogExtra<R extends CatalogRow, V> = {
    initial(entry: R | null): V;
    render(props: { id: string; value: V; onChange: (value: V) => void; error: string | null }): React.ReactNode;
    /** A key under "Validation" when the value cannot be saved. */
    validate?(value: V): string | null;
    summary?(entry: R): React.ReactNode;
};

// Method syntax, so each list's actions may take its own narrower kinds, roles and extra values
export type CatalogActions<V = never> = {
    create(input: { name: CatalogNameValues; kind?: string; role?: string; extra?: V }): Promise<ActionResult<null>>;
    update(input: Transition & { name: CatalogNameValues; role?: string; extra?: V }): Promise<ActionResult<null>>;
    move(input: Transition & { position: number }): Promise<ActionResult<null>>;
    retire(input: Transition): Promise<ActionResult<null>>;
    restore(input: Transition): Promise<ActionResult<null>>;
    remove(input: Transition): Promise<ActionResult<null>>;
};

/**
 * Creating or renaming an entry: its Swedish and English names and, for a new guide item type or budget category, its
 * kind, which is fixed from then on. A list with roles picks one, or none, on create and edit.
 */
function EntrySheet<R extends CatalogRow, V>({entry, kinds, kindTexts, roles, extra, createLabel, editLabel, actions, open, onOpenChange}: {
    entry: R | null;
    kinds: CatalogOption[] | null;
    kindTexts?: CatalogKindTexts;
    roles: CatalogOption[] | null;
    extra?: CatalogExtra<R, V>;
    createLabel: string;
    editLabel?: string;
    actions: CatalogActions<V>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const t = useTranslations();
    const id = useId();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const [kind, setKind] = useState(kinds?.[0]?.value ?? "");
    const [role, setRole] = useState(entry?.role ?? "");
    const [extraValue, setExtraValue] = useState<V | undefined>(() => extra?.initial(entry));
    const [extraError, setExtraError] = useState<string | null>(null);
    const withKind = kinds !== null;
    const form = useForm<CatalogNameValues>({
        resolver: zodResolver(catalogNameSchema),
        defaultValues: {sv: entry?.name.sv ?? "", en: entry?.name.en ?? ""},
    });
    const {errors} = form.formState;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[600px] flex flex-col gap-0 p-0 h-full">
                <SheetHeader className="p-6 pb-4 shrink-0">
                    <SheetTitle>{entry ? editLabel ?? t("Catalog.editTitle") : createLabel}</SheetTitle>
                    {withKind && (
                        <SheetDescription>
                            {entry ? kindTexts?.fixed ?? t("Catalog.kindFixed") : kindTexts?.choose ?? t("Catalog.kindDescription")}
                        </SheetDescription>
                    )}
                </SheetHeader>
                <form className="flex min-h-0 flex-1 flex-col overflow-hidden" onSubmit={form.handleSubmit(name => startTransition(async () => {
                    const invalid = extra?.validate?.(extraValue as V) ?? null;

                    setExtraError(invalid);
                    if (invalid) {
                        return;
                    }

                    const withRole = roles ? {role} : {};
                    const withExtra = extra ? {extra: extraValue as V} : {};
                    const result = entry
                        ? await actions.update({id: entry.id, version: entry.version, name, ...withRole, ...withExtra})
                        : await actions.create({name, kind: withKind ? kind : undefined, ...withRole, ...withExtra});

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
                            {kinds && !entry && (
                                <fieldset className="space-y-2">
                                    <legend className="text-sm font-medium">{kindTexts?.label ?? t("Catalog.kind")}</legend>
                                    {kinds.map(option => (
                                        <label key={option.value} className="flex items-start gap-2 rounded-md border p-3 text-sm">
                                            <input type="radio" name={`${id}-kind`} className="mt-0.5" value={option.value} checked={kind === option.value}
                                                   onChange={() => setKind(option.value)}/>
                                            <span>
                                                <span className="block font-medium">{option.name}</span>
                                                {option.description && <span className="block text-muted-foreground">{option.description}</span>}
                                            </span>
                                        </label>
                                    ))}
                                </fieldset>
                            )}
                            {roles && (
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-role`}>{t("Catalog.role")}</Label>
                                    <NativeSelect className="w-full" id={`${id}-role`} value={role} onChange={change => setRole(change.target.value)}>
                                        <option value="">{t("Catalog.noRole")}</option>
                                        {roles.map(option => <option key={option.value} value={option.value}>{option.name}</option>)}
                                    </NativeSelect>
                                    <p className="text-xs text-muted-foreground">{t("Catalog.roleHelp")}</p>
                                </div>
                            )}
                            {extra?.render({
                                id: `${id}-extra`,
                                value: extraValue as V,
                                onChange: value => {
                                    setExtraValue(value);
                                    setExtraError(null);
                                },
                                error: extraError,
                            })}
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
 * entry nothing uses can be deleted; one in use is retired, so rows that hold it keep it. {@code withKind} offers the
 * guide item kinds, {@code kindOptions} another list's kinds, {@code roleOptions} a role per entry and {@code extra}
 * fields of the list's own, e.g. a link service's hosts.
 */
export function CatalogEditor<R extends CatalogRow, V = never>({entries, actions, label, createLabel, editLabel, withKind = false, kindOptions, kindTexts, roleOptions, extra}: {
    entries: R[];
    label: string;
    actions: CatalogActions<V>;
    createLabel: string;
    /** The sheet's title when changing an entry; "Rename" by default. */
    editLabel?: string;
    withKind?: boolean;
    kindOptions?: CatalogOption[];
    kindTexts?: CatalogKindTexts;
    roleOptions?: CatalogOption[];
    extra?: CatalogExtra<R, V>;
}) {
    const t = useTranslations();
    const kinds = kindOptions ?? (withKind
        ? GUIDE_ITEM_KINDS.map(kind => ({value: kind, name: t(`Catalog.kinds.${kind}.name`), description: t(`Catalog.kinds.${kind}.description`)}))
        : null);
    const nameOf = (options: CatalogOption[] | null | undefined, value: string | null | undefined) =>
        options?.find(option => option.value === value)?.name ?? value;
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const [editing, setEditing] = useState<R | null>(null);
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
                                        {entry.kind && <Badge variant="secondary">{nameOf(kinds, entry.kind)}</Badge>}
                                        {entry.role && <Badge variant="secondary">{nameOf(roleOptions, entry.role)}</Badge>}
                                        {entry.retired && <Badge variant="outline">{t("Catalog.retired")}</Badge>}
                                        {entry.inUse && <Badge variant="outline">{t("Catalog.inUse")}</Badge>}
                                    </div>
                                    {extra?.summary?.(entry)}
                                </div>
                                <div className="flex shrink-0 flex-wrap items-start justify-end gap-1">
                                    <Button size="icon" variant="ghost" aria-label={t("Catalog.moveUp", {name})} disabled={pending || !above}
                                            onClick={() => above && run(() => actions.move({id: entry.id, version: entry.version, position: above.position}))}><ArrowUp/></Button>
                                    <Button size="icon" variant="ghost" aria-label={t("Catalog.moveDown", {name})} disabled={pending || !below}
                                            onClick={() => below && run(() => actions.move({id: entry.id, version: entry.version, position: below.position}))}><ArrowDown/></Button>
                                    <Button size="icon" variant="ghost" aria-label={extra ? t("Catalog.editEntry", {name}) : t("Catalog.edit", {name})} onClick={() => setEditing(entry)}><Pencil/></Button>
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
                <EntrySheet key={editing?.id ?? "new"} entry={editing} kinds={kinds} kindTexts={kindTexts} roles={roleOptions ?? null} extra={extra}
                            createLabel={createLabel} editLabel={editLabel} actions={actions} open
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
