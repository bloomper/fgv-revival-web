"use client";

import {useId, useTransition} from "react";
import {useTranslations} from "next-intl";
import {useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {NativeSelect} from "@/components/ui/native-select";
import {AmountText} from "@/components/budget/budget-labels";
import {type PositionValue, PositionSelect, type VocalPartValue} from "@/components/participant/participant-labels";
import {updateParticipantAction} from "@/app/(app)/revivals/[id]/participants/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import type {ParticipantFieldsFragment} from "@/gql/graphql";
import {amountInputValue} from "@/lib/budget/amount";
import {participantName} from "@/lib/participant/contact";
import {participantEditSchemaFor, type ParticipantEditValues} from "@/lib/participant/schema";

/**
 * Edits a participant's position (with role name and vocal part for ensemble positions), their own fee or a helper's
 * compensation per shift, and a pending person's name and contact details.
 */
export function ParticipantEditDialog({revivalId, participant, positions, vocalParts, onOpenChange}: {
    revivalId: string;
    participant: ParticipantFieldsFragment;
    positions: PositionValue[];
    vocalParts: VocalPartValue[];
    onOpenChange: (open: boolean) => void;
}) {
    const t = useTranslations();
    const id = useId();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    // A position Spexregister no longer lists is still offered while the participant holds it
    const choices = participant.position && !positions.some(position => position.id === participant.position!.id)
        ? [participant.position, ...positions] : positions;
    const form = useForm<ParticipantEditValues>({
        resolver: zodResolver(participantEditSchemaFor(participant.kind, participant.pending)),
        defaultValues: {
            positionId: participant.position?.id ?? "",
            roleName: participant.roleName ?? "",
            vocalPartId: participant.vocalPart?.id ?? "",
            fee: amountInputValue(participant.feeOverride),
            revivalFee: !participant.feeOverride,
            compensationPerShift: amountInputValue(participant.compensationPerShift),
            firstName: participant.pending ? participant.firstName : "",
            lastName: participant.pending ? participant.lastName : "",
            email: participant.pending ? participant.email ?? "" : "",
            phone: participant.pending ? participant.phone ?? "" : "",
        },
    });
    const {errors} = form.formState;
    const positionId = useWatch({control: form.control, name: "positionId"});
    const revivalFee = useWatch({control: form.control, name: "revivalFee"});
    const hasRole = choices.find(position => position.id === positionId)?.hasRole ?? false;
    const field = (name: string) => `${id}-${name}`;
    const error = (name: string, message?: string) => message &&
        <p id={`${field(name)}-error`} className="text-sm text-destructive">{t(`Validation.${message}`)}</p>;
    const described = (name: string, message?: string) => message ? {"aria-invalid": true, "aria-describedby": `${field(name)}-error`} : {};

    return (
        <Dialog open onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t("Participants.editTitle", {name: participantName(participant)})}</DialogTitle>
                    <DialogDescription>{participant.pending ? t("Participants.editPendingDescription") : t("Participants.editDescription")}</DialogDescription>
                </DialogHeader>
                <form className="space-y-4" noValidate onSubmit={form.handleSubmit(values => startTransition(async () => {
                    const result = await updateParticipantAction({
                        revivalId, id: participant.id, version: participant.version, pending: participant.pending, kind: participant.kind, hasRole, values,
                    });

                    if (feedback(result, t("Common.saved"))) {
                        onOpenChange(false);
                    }
                }))}>
                    {participant.pending && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <p className="text-xs text-muted-foreground sm:col-span-2">
                                {participant.kind === "HELPER" ? t("Participants.clearContactHintHelper") : t("Participants.clearContactHint")}
                            </p>
                            <div className="space-y-2">
                                <Label htmlFor={field("first")}>{t("Participants.firstName")}</Label>
                                <Input id={field("first")} autoComplete="off" {...described("first", errors.firstName?.message)} {...form.register("firstName")}/>
                                {error("first", errors.firstName?.message)}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={field("last")}>{t("Participants.lastName")}</Label>
                                <Input id={field("last")} autoComplete="off" {...described("last", errors.lastName?.message)} {...form.register("lastName")}/>
                                {error("last", errors.lastName?.message)}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={field("email")}>{t("Participants.email")}</Label>
                                <Input id={field("email")} type="email" autoComplete="off" {...described("email", errors.email?.message)} {...form.register("email")}/>
                                {error("email", errors.email?.message)}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={field("phone")}>{t("Participants.phone")}</Label>
                                <Input id={field("phone")} type="tel" autoComplete="off" {...described("phone", errors.phone?.message)} {...form.register("phone")}/>
                                {error("phone", errors.phone?.message)}
                            </div>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor={field("position")}>{t("Participants.position")}</Label>
                        <PositionSelect id={field("position")} positions={choices} emptyLabel={t("Participants.noPosition")} {...form.register("positionId")}/>
                    </div>
                    {hasRole && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor={field("role")}>{t("Participants.roleName")}</Label>
                                <Input id={field("role")} autoComplete="off" {...described("role", errors.roleName?.message)} {...form.register("roleName")}/>
                                {error("role", errors.roleName?.message)}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={field("vocal")}>{t("Participants.vocalPart")}</Label>
                                <NativeSelect id={field("vocal")} className="w-full" {...form.register("vocalPartId")}>
                                    <option value="">{t("Participants.noVocalPart")}</option>
                                    {vocalParts.map(part => <option key={part.id} value={part.id}>{part.name}</option>)}
                                </NativeSelect>
                            </div>
                        </div>
                    )}
                    {participant.kind === "PARTICIPANT" ? (
                        <div className="space-y-2">
                            <Label htmlFor={field("fee")}>{t("Participants.ownFee")}</Label>
                            <Input id={field("fee")} inputMode="decimal" autoComplete="off" disabled={revivalFee}
                                   aria-describedby={`${field("fee")}-hint`} {...described("fee", errors.fee?.message)} {...form.register("fee")}/>
                            <p id={`${field("fee")}-hint`} className="text-xs text-muted-foreground">
                                {t("Participants.ownFeeHint")} {participant.fee && <>{t("Participants.currentFee")} <AmountText value={participant.fee}/></>}
                            </p>
                            {error("fee", errors.fee?.message)}
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" className="size-4 accent-primary" {...form.register("revivalFee")}/>
                                {t("Participants.useRevivalFee")}
                            </label>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor={field("compensation")}>{t("Participants.compensationPerShift")}</Label>
                            <Input id={field("compensation")} inputMode="decimal" autoComplete="off"
                                   {...described("compensation", errors.compensationPerShift?.message)} {...form.register("compensationPerShift")}/>
                            {error("compensation", errors.compensationPerShift?.message)}
                        </div>
                    )}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t("Common.cancel")}</Button>
                        <Button type="submit" disabled={pending}>{t("Common.save")}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
