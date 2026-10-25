import {z} from "zod";
import type {ApplicationSettingsInput} from "@/gql/graphql";
import {optionalAmount, toAmount} from "@/lib/budget/schema";

export const MAX_SETTINGS_TERMS = 4000;

export const applicationSettingsValuesSchema = z.object({
    terms: z.object({
        sv: z.string().trim().max(MAX_SETTINGS_TERMS, "settingsTermsTooLong"),
        en: z.string().trim().max(MAX_SETTINGS_TERMS, "settingsTermsTooLong"),
    }),
    defaultParticipationFee: optionalAmount,
}).refine(values => !values.terms.en || values.terms.sv, {message: "swedishRequired", path: ["terms", "sv"]});

export type ApplicationSettingsValues = z.infer<typeof applicationSettingsValuesSchema>;

export const applicationSettingsSchema = z.object({version: z.number().int().nonnegative(), values: applicationSettingsValuesSchema});

export function toApplicationSettingsInput(values: ApplicationSettingsValues): ApplicationSettingsInput {
    return {
        terms: values.terms.sv ? {sv: values.terms.sv, en: values.terms.en || null} : null,
        defaultParticipationFee: toAmount(values.defaultParticipationFee),
    };
}
