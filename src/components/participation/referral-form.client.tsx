"use client";

import {useId, useTransition} from "react";
import {useTranslations} from "next-intl";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {describedBy, FieldErrorText, TOUCH_FIELD} from "@/components/participation/participation-section";
import {createReferralAction} from "@/app/(app)/revivals/[id]/me/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {type ReferralValues, referralValuesSchema} from "@/lib/participant/schema";
import {track} from "@/utils/umami";

const EMPTY: ReferralValues = {name: "", contact: "", comment: ""};

/**
 * "Do you know someone we're missing?": a name, a way to reach them and a comment, passed to the steering group.
 */
export function ReferralForm({revivalId}: { revivalId: string }) {
    const t = useTranslations();
    const id = useId();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const form = useForm<ReferralValues>({resolver: zodResolver(referralValuesSchema), defaultValues: EMPTY});
    const {errors} = form.formState;
    const message = (key?: string) => key ? t(`Validation.${key}`) : null;

    return (
        <form className="flex flex-col gap-4" noValidate onSubmit={form.handleSubmit(values => startTransition(async () => {
            if (feedback(await createReferralAction({revivalId, values}), t("Participation.referralSent"))) {
                track("referral-create");
                // Keeps the registered inputs: the React Compiler does not register them again after a reset
                form.reset(EMPTY, {keepFieldsRef: true});
            }
        }))}>
            <div className="flex flex-col gap-2">
                <Label htmlFor={`${id}-name`}>{t("Participation.referralName")}</Label>
                <Input id={`${id}-name`} autoComplete="off" className={TOUCH_FIELD} {...describedBy(`${id}-name`, {error: errors.name?.message})}
                       {...form.register("name")}/>
                <FieldErrorText fieldId={`${id}-name`} message={message(errors.name?.message)}/>
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor={`${id}-contact`}>{t("Participation.referralContact")}</Label>
                <Input id={`${id}-contact`} autoComplete="off" className={TOUCH_FIELD}
                       {...describedBy(`${id}-contact`, {error: errors.contact?.message, hint: true})} {...form.register("contact")}/>
                <p id={`${id}-contact-hint`} className="text-sm text-muted-foreground">{t("Participation.referralContactHint")}</p>
                <FieldErrorText fieldId={`${id}-contact`} message={message(errors.contact?.message)}/>
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor={`${id}-comment`}>{t("Participation.referralComment")}</Label>
                <Textarea id={`${id}-comment`} rows={2} className="text-base" {...describedBy(`${id}-comment`, {error: errors.comment?.message})}
                          {...form.register("comment")}/>
                <FieldErrorText fieldId={`${id}-comment`} message={message(errors.comment?.message)}/>
            </div>
            <Button type="submit" size="lg" variant="outline" className="h-11 w-full sm:w-auto sm:self-start" disabled={pending}>
                {t("Participation.sendReferral")}
            </Button>
        </form>
    );
}
