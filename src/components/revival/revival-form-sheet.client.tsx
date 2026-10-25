"use client";

import * as React from "react";
import {useEffect, useState, useTransition} from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import type {RevivalSummaryFragment} from "@/gql/graphql";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet";
import {
    createRevivalAction,
    searchSpexAction,
    type SpexOption,
    updateRevivalAction
} from "@/app/(app)/revivals/manage/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {revivalCreateSchema, type RevivalCreateValues, revivalYears} from "@/lib/revival/schema";
import {track} from "@/utils/umami";

function SpexPicker({value, onChange}: { value: SpexOption | null; onChange: (spex: SpexOption | null) => void }) {
    const t = useTranslations("CreateDialog");
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SpexOption[]>([]);
    const [unavailable, setUnavailable] = useState(false);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const handle = setTimeout(async () => {
            const result = await searchSpexAction(query);

            if (cancelled) {
                return;
            }
            if (result.ok) {
                setUnavailable(false);
                setResults(result.data);
            } else {
                setUnavailable(result.code === "SPEXREGISTER_UNAVAILABLE");
                setResults([]);
            }
            setSearched(true);
        }, 250);

        return () => {
            cancelled = true;
            clearTimeout(handle);
        };
    }, [query]);

    if (value) {
        return (
            <div className="flex items-center justify-between rounded-md border p-2 text-sm">
                <span>{t("selected")}: <strong>{value.title}</strong> ({value.year})</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>×</Button>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <Input value={query} onChange={event => setQuery(event.target.value)} placeholder={t("searchSpex")}
                   aria-label={t("searchSpex")}/>
            {unavailable ? (
                <p className="text-sm text-destructive" role="alert">{t("spexregisterUnavailable")}</p>
            ) : searched && results.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("noResults")}</p>
            ) : (
                <ul className="max-h-48 overflow-y-auto rounded-md border" role="listbox" aria-label={t("searchSpex")}>
                    {results.map(spex => (
                        <li key={spex.id}>
                            <button
                                type="button"
                                role="option"
                                aria-selected={false}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                                onClick={() => onChange(spex)}
                            >
                                {spex.title} <span className="text-muted-foreground">({spex.year})</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/**
 * Creates a revival in PROPOSED, or with {@code revival} changes its spex and year. The year is chosen from
 * the years the spex allows.
 */
export function RevivalFormSheet({revival, open, onOpenChange, trigger}: {
    revival?: RevivalSummaryFragment;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trigger?: React.ReactElement;
}) {
    const t = useTranslations();
    const router = useRouter();
    const feedback = useActionFeedback();
    const [spex, setSpex] = useState<SpexOption | null>(revival ? {
        id: revival.spex.id,
        title: revival.spex.title ?? null,
        year: revival.spex.year ?? null
    } : null);
    const [pending, startTransition] = useTransition();
    const form = useForm<RevivalCreateValues>({
        resolver: zodResolver(revivalCreateSchema),
        defaultValues: {spexId: revival?.spex.id ?? "", year: revival?.year},
    });
    const {errors} = form.formState;
    const years = spex ? revivalYears(spex.year, {fromThisYear: !revival, include: revival?.year}) : [];

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            {trigger && <SheetTrigger render={trigger}/>}
            <SheetContent className="w-full sm:max-w-[600px] flex flex-col gap-0 p-0 h-full">
                <SheetHeader className="p-6 pb-4 shrink-0">
                    <SheetTitle>{revival ? t("CreateDialog.editTitle") : t("CreateDialog.title")}</SheetTitle>
                    <SheetDescription>{revival ? t("CreateDialog.editDescription") : t("CreateDialog.description")}</SheetDescription>
                </SheetHeader>
                <form
                    className="flex min-h-0 flex-1 flex-col overflow-hidden"
                    onSubmit={form.handleSubmit(values => startTransition(async () => {
                        if (revival) {
                            if (feedback(await updateRevivalAction({
                                id: revival.id,
                                version: revival.version, ...values
                            }), t("CreateDialog.saved"))) {
                                onOpenChange(false);
                                router.refresh();
                            }
                            return;
                        }

                        const result = await createRevivalAction(values);

                        if (feedback(result, t("CreateDialog.created"))) {
                            track("revival-create");
                            onOpenChange(false);
                            setSpex(null);
                            form.reset();
                            router.push(`/revivals/${result.data.id}`);
                        }
                    }))}
                >
                    <ScrollArea className="min-h-0 flex-1 border-t">
                        <div className="space-y-4 px-6 py-6 pb-12">
                            <div className="space-y-2">
                                <Label>{t("Revival.spex")}</Label>
                                <SpexPicker value={spex} onChange={picked => {
                                    setSpex(picked);
                                    form.setValue("spexId", picked?.id ?? "", {shouldValidate: !!picked});
                                    if (picked && picked.year && form.getValues("year") < picked.year) {
                                        form.resetField("year");
                                    }
                                }}/>
                                {errors.spexId &&
                                    <p className="text-sm text-destructive">{t(`Validation.${errors.spexId.message}`)}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="revival-year">{t("Revival.year")}</Label>
                                <Controller control={form.control} name="year" render={({field}) => (
                                    <Select value={field.value ? String(field.value) : null}
                                            onValueChange={value => field.onChange(Number(value))} disabled={!spex}>
                                        <SelectTrigger id="revival-year" className="w-full">
                                            <SelectValue
                                                placeholder={spex ? t("CreateDialog.selectYear") : t("CreateDialog.selectSpexFirst")}/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {years.map(year => <SelectItem key={year}
                                                                           value={String(year)}>{year}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                )}/>
                                {errors.year &&
                                    <p className="text-sm text-destructive">{t(`Validation.${errors.year.message}`)}</p>}
                            </div>
                        </div>
                    </ScrollArea>
                    <SheetFooter className="p-6 pt-4 border-t bg-muted/30 shrink-0 mt-auto">
                        <SheetClose render={<Button type="button" variant="outline"
                                                    disabled={pending}/>}>{t("Common.cancel")}</SheetClose>
                        <Button type="submit"
                                disabled={pending}>{revival ? t("CreateDialog.save") : t("CreateDialog.submit")}</Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
