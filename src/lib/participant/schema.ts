import {z} from "zod";
import {parseAmount, toOre} from "@/lib/budget/amount";
import {normalizeSwishNumber, SWISH_NUMBER, WHATSAPP_LINK_PREFIX} from "@/lib/participant/contact";

export const MAX_PERSON_NAME = 100;
export const MAX_EMAIL = 255;
export const MAX_PHONE = 50;
export const MAX_ROLE_NAME = 100;
export const MAX_PARTICIPANT_COMMENT = 1000;
export const MAX_DIETARY = 1000;
export const MAX_TERMS = 4000;
export const MAX_REFERRAL_NAME = 100;
export const MAX_REFERRAL_CONTACT = 200;
export const MAX_REFERRAL_COMMENT = 1000;
export const MAX_ADDRESS_FIELD = 255;
/** The most spexare added in one call. */
export const MAX_BULK_ADD = 500;
/** The shortest name search Spexregister takes. */
export const MIN_SPEXARE_QUERY = 3;
/** 100 000 kr in öre: the most a helper's compensation per shift may be. */
const MAX_COMPENSATION_ORE = 10_000_000;
/** 10 000 000 kr in öre. */
const MAX_FEE_ORE = 1_000_000_000;

export const PARTICIPANT_KINDS = ["PARTICIPANT", "HELPER"] as const;
export const PARTICIPANT_RESPONSES = ["PENDING", "YES", "MAYBE", "NO"] as const;
export const ANSWERS = ["YES", "MAYBE", "NO"] as const;
export const INVITATION_STATES = ["NOT_INVITED", "INVITED", "ACTIVE"] as const;
export const INVITATION_LANGUAGES = ["sv", "en"] as const;

const id = z.string().min(1);
const version = z.number().int().nonnegative();
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[\d\s()-]{6,}$/;

const email = z.string().trim().max(MAX_EMAIL, "emailInvalid").refine(value => !value || EMAIL.test(value), "emailInvalid");
const phone = z.string().trim().max(MAX_PHONE, "phoneInvalid").refine(value => !value || PHONE.test(value), "phoneInvalid");
const personName = (required: string) => z.string().trim().min(1, required).max(MAX_PERSON_NAME, "personNameTooLong");

/** Blank, or an amount between 0 and {@code maxOre}. */
const optionalAmount = (maxOre: number) => z.string().trim()
    .refine(value => !value || parseAmount(value) !== null, "amountInvalid")
    .refine(value => {
        const ore = toOre(value);

        return !value || ore === null || ore <= maxOre;
    }, "amountOutOfRange");

/**
 * A pending person or helper, not in Spexregister: a participant needs an email address to be invited, a helper an
 * email address or a phone number.
 */
export const pendingPersonValuesSchema = z.object({
    kind: z.enum(PARTICIPANT_KINDS),
    firstName: personName("firstNameRequired"),
    lastName: personName("lastNameRequired"),
    email,
    phone,
    positionId: z.string(),
    compensationPerShift: optionalAmount(MAX_COMPENSATION_ORE),
}).superRefine((values, ctx) => {
    if (values.kind === "PARTICIPANT" && !values.email) {
        ctx.addIssue({code: "custom", message: "participantEmailRequired", path: ["email"]});
    }
    if (values.kind === "HELPER" && !values.email && !values.phone) {
        ctx.addIssue({code: "custom", message: "helperContactRequired", path: ["phone"]});
    }
});

export type PendingPersonValues = z.infer<typeof pendingPersonValuesSchema>;

export const participantAddPendingSchema = z.object({revivalId: id, values: pendingPersonValuesSchema});
export const participantAddSpexareSchema = z.object({revivalId: id, spexareIds: z.array(id).min(1).max(MAX_BULK_ADD)});
export const spexareSearchSchema = z.object({
    revivalId: id,
    query: z.string().trim().min(MIN_SPEXARE_QUERY).max(MAX_PERSON_NAME * 2)
});

/**
 * The row's edit dialog. The fee is the participant's own amount (`feeOverride`): {@code revivalFee}, or a blank
 * amount, goes back to the revival's. A pending person's name and contact details can be corrected, and an email
 * address or phone number cleared, as long as a participant keeps an email address and a helper one of the two.
 */
export const participantEditValuesSchema = z.object({
    positionId: z.string(),
    roleName: z.string().trim().max(MAX_ROLE_NAME, "roleNameTooLong"),
    vocalPartId: z.string(),
    fee: optionalAmount(MAX_FEE_ORE),
    revivalFee: z.boolean(),
    compensationPerShift: optionalAmount(MAX_COMPENSATION_ORE),
    firstName: z.string().trim().max(MAX_PERSON_NAME, "personNameTooLong"),
    lastName: z.string().trim().max(MAX_PERSON_NAME, "personNameTooLong"),
    email,
    phone,
});

export type ParticipantEditValues = z.infer<typeof participantEditValuesSchema>;

/** The rules a pending person's names and contact details follow, as issues on the dialog's fields. */
function checkPendingPerson(values: ParticipantEditValues, kind: (typeof PARTICIPANT_KINDS)[number], addIssue: (message: string, field: string) => void) {
    if (!values.firstName) {
        addIssue("firstNameRequired", "firstName");
    }
    if (!values.lastName) {
        addIssue("lastNameRequired", "lastName");
    }
    if (kind === "PARTICIPANT" && !values.email) {
        addIssue("participantEmailRequired", "email");
    }
    if (kind === "HELPER" && !values.email && !values.phone) {
        addIssue("helperContactRequired", "phone");
    }
}

/** The edit dialog's schema for one participant: a pending person's details are checked as well. */
export function participantEditSchemaFor(kind: (typeof PARTICIPANT_KINDS)[number], pending: boolean) {
    return participantEditValuesSchema.superRefine((values, ctx) => {
        if (pending) {
            checkPendingPerson(values, kind, (message, field) => ctx.addIssue({
                code: "custom",
                message,
                path: [field]
            }));
        }
    });
}

export const participantUpdateSchema = z.object({
    revivalId: id,
    id,
    version,
    pending: z.boolean(),
    kind: z.enum(PARTICIPANT_KINDS),
    hasRole: z.boolean(),
    values: participantEditValuesSchema,
}).superRefine((input, ctx) => {
    if (input.pending) {
        checkPendingPerson(input.values, input.kind, (message, field) => ctx.addIssue({
            code: "custom",
            message,
            path: ["values", field]
        }));
    }
});

export const participantTransitionSchema = z.object({revivalId: id, id, version});
export const participantFeePaidSchema = z.object({revivalId: id, id, version, paid: z.boolean()});

export const participantsInviteSchema = z.object({
    revivalId: id,
    participantIds: z.array(id).min(1).max(MAX_BULK_ADD),
    email: z.string().trim().refine(value => !value || EMAIL.test(value), "emailInvalid"),
    language: z.enum(INVITATION_LANGUAGES),
});

export const participationSettingsValuesSchema = z.object({
    swishNumber: z.string().trim().refine(value => !value || SWISH_NUMBER.test(normalizeSwishNumber(value)), "swishNumberInvalid"),
    whatsappLink: z.string().trim().max(255, "whatsappLinkInvalid")
        .refine(value => !value || (value.startsWith(WHATSAPP_LINK_PREFIX) && value.length > WHATSAPP_LINK_PREFIX.length), "whatsappLinkInvalid"),
    terms: z.string().trim().max(MAX_TERMS, "termsTooLong"),
});

export type ParticipationSettingsValues = z.infer<typeof participationSettingsValuesSchema>;

export const participationSettingsSchema = z.object({
    revivalId: id,
    version,
    values: participationSettingsValuesSchema
});

export const referralHandleSchema = z.object({revivalId: id, id, outcome: z.enum(["ADDED", "DISMISSED"])});

/**
 * The participant's response: yes requires accepting the terms, and yes or maybe asks whether Spexregister may
 * keep their details. "" stands for not chosen yet.
 */
export const respondValuesSchema = z.object({
    response: z.union([z.literal(""), z.enum(ANSWERS)]),
    preferredPositionId: z.string(),
    comment: z.string().trim().max(MAX_PARTICIPANT_COMMENT, "participantCommentTooLong"),
    termsAccepted: z.boolean(),
    registerConsent: z.union([z.literal(""), z.literal("yes"), z.literal("no")]),
}).superRefine((values, ctx) => {
    if (!values.response) {
        ctx.addIssue({code: "custom", message: "responseRequired", path: ["response"]});
    }
    if (values.response === "YES" && !values.termsAccepted) {
        ctx.addIssue({code: "custom", message: "termsRequired", path: ["termsAccepted"]});
    }
    if ((values.response === "YES" || values.response === "MAYBE") && !values.registerConsent) {
        ctx.addIssue({code: "custom", message: "registerConsentRequired", path: ["registerConsent"]});
    }
});

export type RespondValues = z.infer<typeof respondValuesSchema>;

export const respondSchema = z.object({revivalId: id, values: respondValuesSchema});

export const contactValuesSchema = z.object({
    email,
    phone,
    streetAddress: z.string().trim().max(MAX_ADDRESS_FIELD, "addressTooLong"),
    postalCode: z.string().trim().max(20, "addressTooLong"),
    city: z.string().trim().max(MAX_ADDRESS_FIELD, "addressTooLong"),
});

export type ContactValues = z.infer<typeof contactValuesSchema>;

export const contactSchema = z.object({revivalId: id, values: contactValuesSchema});

export const dietaryValuesSchema = z.object({text: z.string().trim().max(MAX_DIETARY, "dietaryTooLong")});

export type DietaryValues = z.infer<typeof dietaryValuesSchema>;

export const dietarySchema = z.object({revivalId: id, values: dietaryValuesSchema});

export const referralValuesSchema = z.object({
    name: z.string().trim().min(1, "referralNameRequired").max(MAX_REFERRAL_NAME, "referralNameTooLong"),
    contact: z.string().trim().max(MAX_REFERRAL_CONTACT, "referralContactTooLong"),
    comment: z.string().trim().max(MAX_REFERRAL_COMMENT, "referralCommentTooLong"),
});

export type ReferralValues = z.infer<typeof referralValuesSchema>;

export const referralSchema = z.object({revivalId: id, values: referralValuesSchema});

export const assignedItemDoneSchema = z.object({
    revivalId: z.string().min(1),
    id: z.string().min(1),
    version: z.number().int().nonnegative(),
    done: z.boolean(),
});
