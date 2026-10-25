"use client";

import {type ReactElement, type ReactNode, useState, useTransition} from "react";
import {useLocale, useTranslations} from "next-intl";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {ScrollArea} from "@/components/ui/scroll-area";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {NativeSelect} from "@/components/ui/native-select";
import {suggestAction} from "@/app/(app)/revivals/[id]/guide/actions.server";
import {catalogChoices, defaultItemType, type GuideItemTypeValue} from "@/components/catalog/catalog";
import {CatalogOptions, useGuideItemTypes} from "@/components/catalog/catalog-provider.client";
import {GuideMarkdown} from "@/components/guide/guide-markdown";
import {pickText} from "@/components/guide/localized";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {guideSuggestionSchema, type GuideSuggestionValues, MAX_ITEM_TEXT, MAX_REASON} from "@/lib/guide/schema";
import {track} from "@/utils/umami";

type Place = { chapterKey: string; sectionKey: string | null };
type Chapter = { key: string; title: { sv: string; en?: string | null } };

/**
 * Suggests new text or type for an item, removing it, or a new item in a chapter or section. The super admin
 * decides; nothing in the guide changes now. A new item without a {@code place} is suggested for one of
 * {@code chapters}, picked in the form.
 */
export function SuggestionDialog({trigger, children, revivalId, versionId, kind, item, place, chapters = []}: {
    trigger: ReactElement;
    children: ReactNode;
    revivalId: string;
    versionId: string;
    kind: "CHANGE" | "REMOVE" | "ADD";
    item?: { key: string; type: GuideItemTypeValue; text: { sv: string; en?: string | null } };
    place?: Place;
    chapters?: Chapter[];
}) {
    const t = useTranslations();
    const locale = useLocale();
    const [chapterKey, setChapterKey] = useState(chapters[0]?.key ?? "");
    const target: Place | undefined = place ?? (kind === "ADD" && chapterKey ? {
        chapterKey,
        sectionKey: null
    } : undefined);
    const feedback = useActionFeedback();
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();
    const types = useGuideItemTypes();
    const form = useForm<GuideSuggestionValues>({
        resolver: zodResolver(guideSuggestionSchema),
        values: {
            kind,
            proposedType: kind === "ADD" ? defaultItemType(types) : kind === "CHANGE" ? item?.type.id ?? defaultItemType(types) : null,
            proposedTextSv: kind === "CHANGE" ? item?.text.sv ?? "" : "",
            proposedTextEn: kind === "CHANGE" ? item?.text.en ?? "" : "",
            reason: "",
        },
    });
    const {errors} = form.formState;
    // The sheet stays mounted and `values` rarely changes, so start each opening afresh.
    const change = (next: boolean) => {
        if (next) {
            form.reset();
        }
        setOpen(next);
    };

    return (
        <Sheet open={open} onOpenChange={change}>
            <SheetTrigger render={trigger}>{children}</SheetTrigger>
            <SheetContent className="w-full sm:max-w-[600px] flex flex-col gap-0 p-0 h-full">
                <SheetHeader className="p-6 pb-4 shrink-0">
                    <SheetTitle>{t(`Guide.suggest.title.${kind}`)}</SheetTitle>
                    <SheetDescription>{t("Guide.suggest.description")}</SheetDescription>
                </SheetHeader>
                <form
                    className="flex min-h-0 flex-1 flex-col overflow-hidden"
                    onSubmit={form.handleSubmit(values => startTransition(async () => {
                        const changedType = kind === "CHANGE" && values.proposedType === item?.type.id ? null : values.proposedType;
                        const result = await suggestAction({
                            revivalId,
                            versionId,
                            itemKey: item?.key ?? null,
                            chapterKey: target?.chapterKey ?? null,
                            sectionKey: target?.sectionKey ?? null,
                            values: {
                                ...values,
                                proposedType: changedType,
                                proposedTextSv: kind === "CHANGE" && values.proposedTextSv === item?.text.sv ? null : values.proposedTextSv,
                                proposedTextEn: kind === "CHANGE" && values.proposedTextEn === (item?.text.en ?? "") ? null : values.proposedTextEn,
                            },
                        });

                        if (feedback(result, t("Guide.suggest.done"))) {
                            track("guide-suggest");
                            setOpen(false);
                        }
                    }))}
                >
                    <ScrollArea className="min-h-0 flex-1 border-t">
                        <div className="space-y-4 px-6 py-6 pb-12">
                            {item && (
                                <div className="rounded-md border bg-muted/40 p-3 text-sm">
                                    <GuideMarkdown>{item.text.sv}</GuideMarkdown></div>
                            )}
                            {kind === "ADD" && !place && (
                                <div className="space-y-2">
                                    <Label htmlFor="suggest-chapter">{t("Guide.suggest.chapter")}</Label>
                                    <NativeSelect className="w-full" id="suggest-chapter"
                                                  value={chapterKey}
                                                  onChange={event => setChapterKey(event.target.value)}>
                                        {chapters.map((chapter, index) => (
                                            <option key={chapter.key}
                                                    value={chapter.key}>{index + 1}. {pickText(chapter.title, locale).text}</option>
                                        ))}
                                    </NativeSelect>
                                </div>
                            )}
                            {kind !== "REMOVE" && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="suggest-type">{t("Guide.editor.type")}</Label>
                                        <NativeSelect className="w-full" id="suggest-type"
                                                      {...form.register("proposedType")}>
                                            <CatalogOptions entries={catalogChoices(types, [item?.type])}/>
                                        </NativeSelect>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="suggest-sv">{t("Guide.editor.swedish")}</Label>
                                        <Textarea id="suggest-sv" rows={5}
                                                  maxLength={MAX_ITEM_TEXT} {...form.register("proposedTextSv")}/>
                                        {errors.proposedTextSv &&
                                            <p className="text-sm text-destructive">{t(`Validation.${errors.proposedTextSv.message}`)}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="suggest-en">{t("Guide.editor.english")}</Label>
                                        <Textarea id="suggest-en" rows={4}
                                                  maxLength={MAX_ITEM_TEXT} {...form.register("proposedTextEn")}/>
                                    </div>
                                </>
                            )}
                            <div className="space-y-2">
                                <Label
                                    htmlFor="suggest-reason">{t(kind === "ADD" ? "Guide.suggest.reasonOptional" : "Guide.suggest.reason")}</Label>
                                <Textarea id="suggest-reason" rows={3}
                                          maxLength={MAX_REASON} {...form.register("reason")}/>
                                {errors.reason &&
                                    <p className="text-sm text-destructive">{t(`Validation.${errors.reason.message}`)}</p>}
                            </div>
                        </div>
                    </ScrollArea>
                    <SheetFooter className="p-6 pt-4 border-t bg-muted/30 shrink-0 mt-auto">
                        <Button type="submit" disabled={pending}>{t("Guide.suggest.submit")}</Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
