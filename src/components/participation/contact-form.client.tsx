"use client";

import {useId, useTransition} from "react";
import {useTranslations} from "next-intl";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {describedBy, FieldErrorText, TOUCH_FIELD} from "@/components/participation/participation-section";
import {updateContactAction} from "@/app/(app)/revivals/[id]/me/actions.server";
import {useActionFeedback} from "@/hooks/use-action-feedback";
import {type ContactValues, contactValuesSchema} from "@/lib/participant/schema";

export type ContactValue = {
    email?: string | null;
    phone?: string | null;
    streetAddress?: string | null;
    postalCode?: string | null;
    city?: string | null;
};

const FIELDS = [
    {name: "email", type: "email", autoComplete: "email", inputMode: "email"},
    {name: "phone", type: "tel", autoComplete: "tel", inputMode: "tel"},
    {name: "streetAddress", type: "text", autoComplete: "street-address", inputMode: "text"},
    {name: "postalCode", type: "text", autoComplete: "postal-code", inputMode: "numeric"},
    {name: "city", type: "text", autoComplete: "address-level2", inputMode: "text"},
] as const;

/**
 * The participant's contact details. A spexare's are kept in Spexregister, and only with their consent: without it the
 * details are shown but cannot be changed here, and the text says why. Null contact means Spexregister is unavailable.
 */
export function ContactForm({revivalId, contact, editable}: {
    revivalId: string;
    contact: ContactValue | null;
    editable: boolean
}) {
    const t = useTranslations();
    const id = useId();
    const feedback = useActionFeedback();
    const [pending, startTransition] = useTransition();
    const form = useForm<ContactValues>({
        resolver: zodResolver(contactValuesSchema),
        defaultValues: {
            email: contact?.email ?? "", phone: contact?.phone ?? "", streetAddress: contact?.streetAddress ?? "",
            postalCode: contact?.postalCode ?? "", city: contact?.city ?? "",
        },
    });
    const {errors} = form.formState;

    if (!contact) {
        return <Alert><AlertDescription>{t("Participation.contactUnavailable")}</AlertDescription></Alert>;
    }

    return (
        <form className="flex flex-col gap-4" noValidate
              onSubmit={form.handleSubmit(values => startTransition(async () => {
                  feedback(await updateContactAction({revivalId, values}), t("Participation.contactSaved"));
              }))}>
            {!editable && (
                <Alert>
                    <AlertDescription id={`${id}-noconsent`}>{t("Participation.contactNoConsent")}</AlertDescription>
                </Alert>
            )}
            <fieldset disabled={!editable} className="grid gap-4 sm:grid-cols-2"
                      aria-describedby={editable ? undefined : `${id}-noconsent`}>
                <legend className="sr-only">{t("Participation.contactTitle")}</legend>
                {FIELDS.map(({name, ...input}) => {
                    const fieldId = `${id}-${name}`;
                    const error = errors[name]?.message;

                    return (
                        <div key={name}
                             className={name === "streetAddress" ? "flex flex-col gap-2 sm:col-span-2" : "flex flex-col gap-2"}>
                            <Label htmlFor={fieldId}>{t(`Participation.contactFields.${name}`)}</Label>
                            <Input id={fieldId}
                                   className={TOUCH_FIELD} {...input} {...describedBy(fieldId, {error})} {...form.register(name)}/>
                            <FieldErrorText fieldId={fieldId} message={error ? t(`Validation.${error}`) : null}/>
                        </div>
                    );
                })}
            </fieldset>
            {editable && <Button type="submit" size="lg" className="h-11 w-full sm:w-auto sm:self-start"
                                 disabled={pending}>{t("Participation.saveContact")}</Button>}
        </form>
    );
}
