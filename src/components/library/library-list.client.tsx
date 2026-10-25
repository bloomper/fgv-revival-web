"use client";

import {useId, useState, useTransition} from "react";
import {useLocale, useTranslations} from "next-intl";
import {Archive, ArchiveRestore, ExternalLink, Pencil, Plus, X} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {NativeSelect} from "@/components/ui/native-select";
import {PlainText} from "@/components/plain-text";
import {pickText} from "@/components/guide/localized";
import {libraryAnchor, type LibraryEntryRow} from "@/components/library/library";
import {LibraryEntrySheet} from "@/components/library/library-entry-sheet.client";
import {restoreLibraryEntryAction, retireLibraryEntryAction} from "@/app/(app)/library/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import type {ActionResult} from "@/lib/graphql.server";
import {LIBRARY_KINDS, LIBRARY_TEXTS} from "@/lib/library/schema";

function matches(entry: LibraryEntryRow, query: string) {
    const folded = query.trim().toLocaleLowerCase("sv");

    return !folded || [entry.name, entry.description, entry.pros, entry.cons, entry.booking, entry.prices, entry.contact]
        .some(text => text && [text.sv, text.en].some(value => value?.toLocaleLowerCase("sv").includes(folded)));
}

/**
 * The library by kind, each entry a card with the texts its kind has. Super admins add, change, retire and restore
 * entries here; nothing is deleted, since guide items keep the entries they link to.
 */
export function LibraryList({entries, canEdit}: { entries: LibraryEntryRow[]; canEdit: boolean }) {
    const t = useTranslations();
    const locale = useLocale();
    const id = useId();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const [query, setQuery] = useState("");
    const [kind, setKind] = useState("");
    const [editing, setEditing] = useState<LibraryEntryRow | null>(null);
    const [adding, setAdding] = useState(false);
    const run = (work: () => Promise<ActionResult<null>>, success: string) => startTransition(async () => {
        feedback(await work(), success);
    });
    const shown = entries.filter(entry => (!kind || entry.kind === kind) && matches(entry, query));
    const text = (value?: { sv: string; en?: string | null } | null) => value ? pickText(value, locale).text : null;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full max-w-xs">
                    <Input value={query} onChange={event => setQuery(event.target.value)} placeholder={t("Common.search")}
                           aria-label={t("Common.search")} className="h-8 pr-8"/>
                    {query && (
                        <Button variant="ghost" size="icon-sm" className="absolute right-0 top-0"
                                aria-label={t("Common.clearSearch")} onClick={() => setQuery("")}><X/></Button>
                    )}
                </div>
                <label htmlFor={`${id}-kind`} className="sr-only">{t("Library.kind")}</label>
                <NativeSelect id={`${id}-kind`} className="h-8" value={kind} onChange={event => setKind(event.target.value)}>
                    <option value="">{t("Library.allKinds")}</option>
                    {LIBRARY_KINDS.map(value => <option key={value} value={value}>{t(`Library.kindsPlural.${value}`)}</option>)}
                </NativeSelect>
                {canEdit && <Button className="ml-auto" onClick={() => setAdding(true)}><Plus/>{t("Library.create")}</Button>}
            </div>
            {shown.length === 0 && <p className="text-sm text-muted-foreground">{t("Library.empty")}</p>}
            {LIBRARY_KINDS.map(group => {
                const inGroup = shown.filter(entry => entry.kind === group);

                return inGroup.length > 0 && (
                    <section key={group} className="space-y-3" aria-labelledby={`${id}-${group}`}>
                        <h3 id={`${id}-${group}`} className="text-base font-semibold">{t(`Library.kindsPlural.${group}`)}</h3>
                        <ul className="grid gap-4 lg:grid-cols-2">
                            {inGroup.map(entry => {
                                const name = text(entry.name) ?? entry.name.sv;

                                return (
                                    <li key={entry.id} id={libraryAnchor(entry.id)} className="scroll-mt-24">
                                        <Card className="h-full">
                                            <CardHeader className="flex flex-row flex-wrap items-start gap-2">
                                                <CardTitle className={entry.retired ? "text-muted-foreground" : undefined}>{name}</CardTitle>
                                                {entry.retired && <Badge variant="outline">{t("Catalog.retired")}</Badge>}
                                                {canEdit && (
                                                    <div className="ml-auto flex gap-1">
                                                        <Button size="icon-sm" variant="ghost" aria-label={t("Library.edit", {name})}
                                                                onClick={() => setEditing(entry)}><Pencil/></Button>
                                                        {entry.retired ? (
                                                            <Button size="icon-sm" variant="ghost" aria-label={t("Catalog.restore", {name})} disabled={pending}
                                                                    onClick={() => run(() => restoreLibraryEntryAction({id: entry.id, version: entry.version}),
                                                                        t("Catalog.restored", {name}))}><ArchiveRestore/></Button>
                                                        ) : (
                                                            <Button size="icon-sm" variant="ghost" aria-label={t("Catalog.retire", {name})} disabled={pending}
                                                                    onClick={() => run(() => retireLibraryEntryAction({id: entry.id, version: entry.version}),
                                                                        t("Catalog.retiredDone", {name}))}><Archive/></Button>
                                                        )}
                                                    </div>
                                                )}
                                            </CardHeader>
                                            <CardContent className="space-y-3 text-sm">
                                                <dl className="space-y-3">
                                                    {LIBRARY_TEXTS[entry.kind].map(key => {
                                                        const value = text(entry[key]);

                                                        return value && (
                                                            <div key={key} className="space-y-1">
                                                                <dt className="font-medium">{t(`Library.texts.${key}`)}</dt>
                                                                <dd><PlainText text={value}/></dd>
                                                            </div>
                                                        );
                                                    })}
                                                </dl>
                                                {entry.url && (
                                                    <a href={entry.url} target="_blank" rel="noopener noreferrer"
                                                       className="inline-flex items-center gap-1 underline underline-offset-2">
                                                        {t("Library.open", {name})}<ExternalLink className="size-3" aria-hidden/>
                                                    </a>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                );
            })}
            {(adding || editing) && (
                <LibraryEntrySheet key={editing?.id ?? "new"} entry={editing} onOpenChange={open => {
                    if (!open) {
                        setAdding(false);
                        setEditing(null);
                    }
                }}/>
            )}
        </div>
    );
}
