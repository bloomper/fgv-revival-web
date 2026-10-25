"use client";

import {useId, useTransition} from "react";
import {useTranslations} from "next-intl";
import {useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {NativeSelect} from "@/components/ui/native-select";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle} from "@/components/ui/sheet";
import {Textarea} from "@/components/ui/textarea";
import type {LocalizedTextValue} from "@/components/guide/localized";
import type {LibraryEntryRow} from "@/components/library/library";
import {createLibraryEntryAction, updateLibraryEntryAction} from "@/app/(app)/library/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {
    LIBRARY_KINDS,
    LIBRARY_TEXTS,
    type LibraryEntryValues,
    libraryEntryValuesSchema,
    MAX_LIBRARY_NAME,
    MAX_LIBRARY_TEXT,
    MAX_LIBRARY_URL,
} from "@/lib/library/schema";

function initialValues(entry: LibraryEntryRow | null): LibraryEntryValues {
    const text = (value?: LocalizedTextValue | null) => ({sv: value?.sv ?? "", en: value?.en ?? ""});

    return {
        kind: entry?.kind ?? "VENUE",
        name: text(entry?.name),
        description: text(entry?.description),
        pros: text(entry?.pros),
        cons: text(entry?.cons),
        booking: text(entry?.booking),
        prices: text(entry?.prices),
        contact: text(entry?.contact),
        url: entry?.url ?? "",
    };
}

/**
 * Creating or changing a library entry: its kind (fixed once made), names, the texts its kind has and a link.
 */
export function LibraryEntrySheet({entry, onOpenChange}: { entry: LibraryEntryRow | null; onOpenChange: (open: boolean) => void }) {
    const t = useTranslations();
    const id = useId();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const form = useForm<LibraryEntryValues>({
        resolver: zodResolver(libraryEntryValuesSchema),
        defaultValues: initialValues(entry),
    });
    const kind = useWatch({control: form.control, name: "kind"});
    const {errors} = form.formState;
    const error = (message?: string) => message &&
        <p className="text-sm text-destructive">{t(`Validation.${message}`)}</p>;

    return (
        <Sheet open onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[600px] flex flex-col gap-0 p-0 h-full">
                <SheetHeader className="p-6 pb-4 shrink-0">
                    <SheetTitle>{entry ? t("Library.editTitle") : t("Library.create")}</SheetTitle>
                    <SheetDescription>{t("Library.dialogDescription")}</SheetDescription>
                </SheetHeader>
                <form className="flex min-h-0 flex-1 flex-col overflow-hidden"
                      onSubmit={form.handleSubmit(values => startTransition(async () => {
                          const result = entry
                              ? await updateLibraryEntryAction({id: entry.id, version: entry.version, values})
                              : await createLibraryEntryAction({values});

                          if (feedback(result, t("Common.saved"))) {
                              onOpenChange(false);
                          }
                      }))}>
                    <ScrollArea className="min-h-0 flex-1 border-t">
                        <div className="space-y-4 px-6 py-6 pb-12">
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-kind`}>{t("Library.kind")}</Label>
                                <NativeSelect className="w-full" id={`${id}-kind`} disabled={entry !== null} {...form.register("kind")}>
                                    {LIBRARY_KINDS.map(value => <option key={value} value={value}>{t(`Library.kinds.${value}`)}</option>)}
                                </NativeSelect>
                                {entry && <p className="text-xs text-muted-foreground">{t("Library.kindFixed")}</p>}
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-name-sv`}>{t("Catalog.nameSv")}</Label>
                                    <Input id={`${id}-name-sv`} maxLength={MAX_LIBRARY_NAME} {...form.register("name.sv")}/>
                                    {error(errors.name?.sv?.message)}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-name-en`}>{t("Catalog.nameEn")}</Label>
                                    <Input id={`${id}-name-en`} maxLength={MAX_LIBRARY_NAME} {...form.register("name.en")}/>
                                    {error(errors.name?.en?.message)}
                                </div>
                            </div>
                            {LIBRARY_TEXTS[kind].map(key => (
                                <fieldset key={key} className="space-y-2">
                                    <legend className="text-sm font-medium">{t(`Library.texts.${key}`)}</legend>
                                    <Label htmlFor={`${id}-${key}-sv`} className="text-muted-foreground">{t("Library.swedish")}</Label>
                                    <Textarea id={`${id}-${key}-sv`} rows={3} maxLength={MAX_LIBRARY_TEXT} {...form.register(`${key}.sv`)}/>
                                    <Label htmlFor={`${id}-${key}-en`} className="text-muted-foreground">{t("Library.english")}</Label>
                                    <Textarea id={`${id}-${key}-en`} rows={3} maxLength={MAX_LIBRARY_TEXT} {...form.register(`${key}.en`)}/>
                                    {error(errors[key]?.sv?.message ?? errors[key]?.en?.message)}
                                </fieldset>
                            ))}
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-url`}>{t("Library.url")}</Label>
                                <Input id={`${id}-url`} type="url" inputMode="url" placeholder="https://" maxLength={MAX_LIBRARY_URL}
                                       {...form.register("url")}/>
                                {error(errors.url?.message)}
                            </div>
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
