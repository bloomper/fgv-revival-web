"use client";

import {useId, useTransition} from "react";
import {useTranslations} from "next-intl";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {updateParticipationSettingsAction} from "@/app/(app)/revivals/[id]/participants/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {type ParticipationSettingsValues, participationSettingsValuesSchema} from "@/lib/participant/schema";

export type ParticipationSettingsValue = {
    swishNumber?: string | null;
    whatsappLink?: string | null;
    terms?: string | null;
    version: number;
};

/**
 * The Swish number participants pay their fee to, the WhatsApp group link shown to those who said yes, and the extra
 * terms they accept besides the fee and the shared liability for the loan.
 */
export function ParticipationSettingsDialog({revivalId, settings, onOpenChange}: {
    revivalId: string;
    settings: ParticipationSettingsValue;
    onOpenChange: (open: boolean) => void;
}) {
    const t = useTranslations();
    const id = useId();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const form = useForm<ParticipationSettingsValues>({
        resolver: zodResolver(participationSettingsValuesSchema),
        defaultValues: {
            swishNumber: settings.swishNumber ?? "",
            whatsappLink: settings.whatsappLink ?? "",
            terms: settings.terms ?? ""
        },
    });
    const {errors} = form.formState;
    const error = (name: string, message?: string) => message &&
        <p id={`${id}-${name}-error`} className="text-sm text-destructive">{t(`Validation.${message}`)}</p>;
    const described = (name: string, message?: string) => ({
        "aria-invalid": message ? true : undefined,
        "aria-describedby": [`${id}-${name}-hint`, message && `${id}-${name}-error`].filter(Boolean).join(" "),
    });

    return (
        <Dialog open onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t("Participants.settingsTitle")}</DialogTitle>
                    <DialogDescription>{t("Participants.settingsDescription")}</DialogDescription>
                </DialogHeader>
                <form className="space-y-4" noValidate
                      onSubmit={form.handleSubmit(values => startTransition(async () => {
                          if (feedback(await updateParticipationSettingsAction({
                              revivalId,
                              version: settings.version,
                              values
                          }), t("Common.saved"))) {
                              onOpenChange(false);
                          }
                      }))}>
                    <div className="space-y-2">
                        <Label htmlFor={`${id}-swish`}>{t("Participants.swishNumber")}</Label>
                        <Input id={`${id}-swish`} inputMode="numeric"
                               autoComplete="off" {...described("swish", errors.swishNumber?.message)} {...form.register("swishNumber")}/>
                        <p id={`${id}-swish-hint`}
                           className="text-xs text-muted-foreground">{t("Participants.swishNumberHint")}</p>
                        {error("swish", errors.swishNumber?.message)}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`${id}-whatsapp`}>{t("Participants.whatsappLink")}</Label>
                        <Input id={`${id}-whatsapp`} type="url" autoComplete="off"
                               placeholder="https://chat.whatsapp.com/…"
                               {...described("whatsapp", errors.whatsappLink?.message)} {...form.register("whatsappLink")}/>
                        <p id={`${id}-whatsapp-hint`}
                           className="text-xs text-muted-foreground">{t("Participants.whatsappLinkHint")}</p>
                        {error("whatsapp", errors.whatsappLink?.message)}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`${id}-terms`}>{t("Participants.extraTerms")}</Label>
                        <Textarea id={`${id}-terms`}
                                  rows={5} {...described("terms", errors.terms?.message)} {...form.register("terms")}/>
                        <p id={`${id}-terms-hint`}
                           className="text-xs text-muted-foreground">{t("Participants.extraTermsHint")}</p>
                        {error("terms", errors.terms?.message)}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline"
                                onClick={() => onOpenChange(false)}>{t("Common.cancel")}</Button>
                        <Button type="submit" disabled={pending}>{t("Common.save")}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
