import {z} from "zod";

// Validation messages are keys under "Validation" in messages/{sv,en}.json. The server checks the same rules
// (mailing.graphqls); these only give quicker feedback.

export const MAX_SUBJECT = 200;
export const MAX_BODY = 20000;
export const MAX_TEMPLATE_NAME = 100;

export const AUDIENCE_KINDS = ["PARTICIPANTS", "CONFIRMED", "STEERING_GROUP", "POSITION", "EVENT_ATTENDEES", "HELPERS", "NON_RESPONDERS"] as const;
export type AudienceKind = (typeof AUDIENCE_KINDS)[number];

const id = z.string().min(1);
const version = z.number().int().nonnegative();

/** The audience as the editor holds it: a kind, and the position or event it needs ("" for none chosen). */
export const audienceValuesSchema = z.object({
    kind: z.enum(AUDIENCE_KINDS),
    positionId: z.string(),
    eventId: z.string(),
}).superRefine((values, ctx) => {
    if (values.kind === "POSITION" && !values.positionId) {
        ctx.addIssue({code: "custom", message: "audiencePositionRequired", path: ["positionId"]});
    }
    if (values.kind === "EVENT_ATTENDEES" && !values.eventId) {
        ctx.addIssue({code: "custom", message: "audienceEventRequired", path: ["eventId"]});
    }
});

export type AudienceValues = z.infer<typeof audienceValuesSchema>;

/** The GraphQL audience: only the position or event the kind uses. */
export function toAudienceInput(audience: AudienceValues) {
    return {
        kind: audience.kind,
        positionId: audience.kind === "POSITION" ? audience.positionId || null : null,
        eventId: audience.kind === "EVENT_ATTENDEES" ? audience.eventId || null : null,
    };
}

export const mailingValuesSchema = z.object({
    audience: audienceValuesSchema,
    subject: z.string().trim().min(1, "subjectRequired").max(MAX_SUBJECT, "subjectTooLong"),
    body: z.string().trim().min(1, "mailingBodyRequired").max(MAX_BODY, "mailingBodyTooLong"),
});

export type MailingValues = z.infer<typeof mailingValuesSchema>;

/** A plan entry the draft comes from: its template and event (none for the premiere). */
const planned = z.object({templateId: id, eventId: z.string().nullable()}).nullable();

export const mailingCreateSchema = z.object({revivalId: id, planned, values: mailingValuesSchema});
export const mailingUpdateSchema = z.object({revivalId: id, id, version, planned, values: mailingValuesSchema});
export const mailingTransitionSchema = z.object({revivalId: id, id, version});
export const mailingRetrySchema = z.object({revivalId: id, id});
export const audiencePreviewSchema = z.object({revivalId: id, audience: audienceValuesSchema});

// --- Templates (the super admin's mailing plan) --------------------------------------------------------------------

const localized = (max: number, required: string, tooLong: string) => z.object({
    sv: z.string().trim().min(1, required).max(max, tooLong),
    en: z.string().trim().max(max, tooLong),
});

const relativeDeadline = z.object({
    kind: z.enum(["DAYS", "WORKING_DAYS", "WEEKDAY_WEEK_BEFORE"]),
    amount: z.number().int().min(-365, "deadlineAmount").max(365, "deadlineAmount").nullable().optional(),
    weekday: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]).nullable().optional(),
});

export const mailingTemplateValuesSchema = z.object({
    name: localized(MAX_TEMPLATE_NAME, "catalogNameRequired", "catalogNameTooLong"),
    subject: localized(MAX_SUBJECT, "subjectRequired", "subjectTooLong"),
    body: localized(MAX_BODY, "mailingBodyRequired", "mailingBodyTooLong"),
    audience: z.enum(AUDIENCE_KINDS),
    eventTypeId: z.string(),
    due: relativeDeadline,
});

export type MailingTemplateValues = z.infer<typeof mailingTemplateValuesSchema>;

export const mailingTemplateCreateSchema = z.object({values: mailingTemplateValuesSchema});
export const mailingTemplateUpdateSchema = z.object({id, version, values: mailingTemplateValuesSchema});
export const mailingTemplateTransitionSchema = z.object({id, version});
export const mailingTemplateMoveSchema = mailingTemplateTransitionSchema.extend({position: z.number().int().nonnegative()});

/** The GraphQL input for validated template values: blank English texts are left out. */
export function toMailingTemplateInput(values: MailingTemplateValues) {
    const text = (value: { sv: string; en: string }) => ({sv: value.sv, en: value.en || null});

    return {
        name: text(values.name),
        subject: text(values.subject),
        body: text(values.body),
        audience: values.audience,
        eventTypeId: values.eventTypeId || null,
        due: values.due.kind === "WEEKDAY_WEEK_BEFORE"
            ? {kind: values.due.kind, amount: null, weekday: values.due.weekday ?? "MONDAY"}
            : {kind: values.due.kind, amount: values.due.amount ?? 0, weekday: null},
    };
}
