"use client";

import {useId, useTransition} from "react";
import {useTranslations} from "next-intl";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {describedBy, FieldErrorText} from "@/components/participation/participation-section";
import {setDietaryAction} from "@/app/(app)/revivals/[id]/me/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {type DietaryValues, dietaryValuesSchema, MAX_DIETARY} from "@/lib/participant/schema";

/**
 * The participant's dietary needs and allergies. Saving it blank clears them; the text says who reads them and that
 * they are deleted the day after the last show.
 */
export function DietaryForm({revivalId, dietary}: { revivalId: string; dietary: string | null }) {
    const t = useTranslations();
    const id = useId();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const form = useForm<DietaryValues>({
        resolver: zodResolver(dietaryValuesSchema),
        defaultValues: {text: dietary ?? ""}
    });
    const error = form.formState.errors.text?.message;
    const fieldId = `${id}-dietary`;

    return (
        <form className="flex flex-col gap-3" noValidate
              onSubmit={form.handleSubmit(values => startTransition(async () => {
                  feedback(await setDietaryAction({
                      revivalId,
                      values
                  }), values.text ? t("Participation.dietarySaved") : t("Participation.dietaryCleared"));
              }))}>
            <Label htmlFor={fieldId}>{t("Participation.dietaryLabel")}</Label>
            <Textarea id={fieldId} rows={3} maxLength={MAX_DIETARY}
                      className="text-base" {...describedBy(fieldId, {error, hint: true})} {...form.register("text")}/>
            <p id={`${fieldId}-hint`} className="text-sm text-muted-foreground">{t("Participation.dietaryHint")}</p>
            <FieldErrorText fieldId={fieldId} message={error ? t(`Validation.${error}`) : null}/>
            <Button type="submit" size="lg" className="h-11 w-full sm:w-auto sm:self-start"
                    disabled={pending}>{t("Participation.saveDietary")}</Button>
        </form>
    );
}
