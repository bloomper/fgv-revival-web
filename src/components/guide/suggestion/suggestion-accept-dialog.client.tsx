"use client";

import {useState, useTransition} from "react";
import {useLocale, useTranslations} from "next-intl";
import {Check, X} from "lucide-react";
import type {GuideSuggestionFieldsFragment} from "@/gql/graphql";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {acceptSuggestionAction, rejectSuggestionAction} from "@/app/(app)/admin/guide/suggestions/actions.server";
import {catalogChoices, defaultItemType, type GuideItemTypeValue} from "@/components/catalog/catalog";
import {CatalogOptions, useGuideItemTypes} from "@/components/catalog/catalog-provider.client";
import {GuideMarkdown} from "@/components/guide/guide-markdown";
import {pickText} from "@/components/guide/localized";
import {useActionFeedback} from "@/hooks/use-action-feedback";

type DraftItem = { type: GuideItemTypeValue; text: { sv: string; en?: string | null } } | null;

/**
 * Accepts a suggestion into the draft. When the item has changed in the draft since, the server answers CONFLICT and
 * the super admin chooses what the draft gets (FR-033).
 */
export function SuggestionAcceptDialog({suggestion, draftItem}: { suggestion: GuideSuggestionFieldsFragment; draftItem: DraftItem }) {
    const t = useTranslations();
    const locale = useLocale();
    const feedback = useActionFeedback();
    const [open, setOpen] = useState(false);
    const [note, setNote] = useState("");
    const [conflict, setConflict] = useState(false);
    const types = useGuideItemTypes();
    const [type, setType] = useState<string>(suggestion.proposedType?.id ?? draftItem?.type.id ?? suggestion.item?.type.id ?? defaultItemType(types));
    const [text, setText] = useState(suggestion.proposedText?.sv || draftItem?.text.sv || suggestion.item?.text.sv || "");
    const [pending, startTransition] = useTransition();

    const accept = (resolution: { keep?: boolean; type?: string; text?: { sv: string } } | null) => startTransition(async () => {
        const result = await acceptSuggestionAction({id: suggestion.id, version: suggestion.version, note, resolution});

        if (!result.ok && result.code === "CONFLICT" && !resolution) {
            setConflict(true);
            return;
        }
        if (feedback(result, t("Guide.suggestions.accepted"))) {
            setOpen(false);
            setConflict(false);
        }
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button size="sm"/>}>
                <Check/>
                {t("Guide.suggestions.accept")}
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t("Guide.suggestions.acceptTitle")}</DialogTitle>
                </DialogHeader>
                {conflict ? (
                    <div className="space-y-3">
                        <p className="text-sm">{t("Guide.suggestions.conflict")}</p>
                        <div className="grid gap-2 md:grid-cols-2">
                            <div className="rounded-md border p-2 text-sm">
                                <span className="text-xs text-muted-foreground">{t("Guide.suggestions.inDraft")}</span>
                                {draftItem ? <GuideMarkdown>{pickText(draftItem.text, locale).text}</GuideMarkdown> : <p>{t("Guide.suggestions.goneFromDraft")}</p>}
                            </div>
                            <div className="rounded-md border p-2 text-sm">
                                <span className="text-xs text-muted-foreground">{t("Guide.suggestions.proposed")}</span>
                                <GuideMarkdown>{suggestion.proposedText ? pickText(suggestion.proposedText, locale).text : t("Guide.suggestions.removal")}</GuideMarkdown>
                            </div>
                        </div>
                        {suggestion.kind === "REMOVE" ? (
                            <DialogFooter>
                                <Button variant="outline" disabled={pending} onClick={() => accept({keep: true})}>{t("Guide.suggestions.keep")}</Button>
                                <Button variant="destructive" disabled={pending} onClick={() => accept({keep: false})}>{t("Guide.suggestions.removeAnyway")}</Button>
                            </DialogFooter>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="resolution-type">{t("Guide.editor.type")}</Label>
                                    <select id="resolution-type" value={type} onChange={event => setType(event.target.value)}
                                            className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-xs">
                                        <CatalogOptions entries={catalogChoices(types, [suggestion.proposedType, draftItem?.type, suggestion.item?.type])}/>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="resolution-text">{t("Guide.suggestions.draftGets")}</Label>
                                    <Textarea id="resolution-text" rows={5} value={text} onChange={event => setText(event.target.value)}/>
                                </div>
                                <DialogFooter>
                                    <Button disabled={pending || !text.trim()} onClick={() => accept({type, text: {sv: text}})}>{t("Guide.suggestions.accept")}</Button>
                                </DialogFooter>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="accept-note">{t("Guide.suggestions.note")}</Label>
                            <Textarea id="accept-note" rows={2} value={note} onChange={event => setNote(event.target.value)}/>
                        </div>
                        <DialogFooter>
                            <Button disabled={pending} onClick={() => accept(null)}>{t("Guide.suggestions.accept")}</Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

export function SuggestionRejectDialog({suggestion}: { suggestion: GuideSuggestionFieldsFragment }) {
    const t = useTranslations();
    const feedback = useActionFeedback();
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [pending, startTransition] = useTransition();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button size="sm" variant="outline"/>}>
                <X/>
                {t("Guide.suggestions.reject")}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("Guide.suggestions.rejectTitle")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                    <Label htmlFor="reject-reason">{t("Guide.suggestions.rejectReason")}</Label>
                    <Textarea id="reject-reason" rows={3} value={reason} onChange={event => setReason(event.target.value)}/>
                </div>
                <DialogFooter>
                    <Button disabled={pending} onClick={() => startTransition(async () => {
                        if (feedback(await rejectSuggestionAction({id: suggestion.id, version: suggestion.version, reason}), t("Guide.suggestions.rejected"))) {
                            setOpen(false);
                        }
                    })}>
                        {t("Guide.suggestions.reject")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
