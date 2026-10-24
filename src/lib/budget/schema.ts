import {z} from "zod";
import {parseAmount, parseQuantity, toOre} from "@/lib/budget/amount";
import {ownerSchema} from "@/lib/decision-log/schema";

// Validation messages are keys under "Validation" in messages/{sv,en}.json. The server checks the same rules
// (budget.graphqls). Amounts and numbers are kept as the typed text and converted when sent.

export const MAX_BUDGET_TEXT = 255;
export const MAX_BUDGET_COMMENT = 1000;
export const MAX_SCENARIO_NAME = 100;
export const MAX_REFERENCE_LABEL = 100;
export const MAX_PARTICIPANTS = 2000;
export const MAX_QUANTITY = 100000;
/** 10 000 000 kr in öre: the most a line's unit amount or a transaction may be. */
export const MAX_AMOUNT_ORE = 1_000_000_000;
/** The largest receipt the server takes. */
export const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;
export const RECEIPT_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/heic", "image/webp"] as const;

export const BUDGET_CATEGORY_KINDS = ["INCOME", "COST"] as const;
export const BUDGET_CATEGORY_ROLES = ["SHOW_TICKETS", "PARTY_TICKETS", "FEES", "VENUE", "PARTY", "HELPERS"] as const;
export const BUDGET_LINE_QUANTITIES = ["FIXED", "PER_PARTICIPANT"] as const;

const id = z.string().min(1);
const version = z.number().int().nonnegative();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "dateInvalid");
const optionalDate = z.union([z.literal(""), date]);

/** Whether a typed amount is between {@code minOre} öre and 10 000 000 kr. */
function within(value: string, minOre: number) {
    const ore = toOre(value);

    return ore !== null && ore >= minOre && ore <= MAX_AMOUNT_ORE;
}

/** An amount of at least {@code minOre} öre, typed as "1 200,50" or "1200.50". */
const amount = (minOre = 0) => z.string().trim().min(1, "amountRequired")
    .refine(value => parseAmount(value) !== null, "amountInvalid")
    .refine(value => parseAmount(value) === null || within(value, minOre), "amountOutOfRange");

/** As {@link amount}, or blank for none. */
const optionalAmount = z.string().trim()
    .refine(value => !value || parseAmount(value) !== null, "amountInvalid")
    .refine(value => !value || parseAmount(value) === null || within(value, 0), "amountOutOfRange");

const wholeNumber = (max: number) => z.string().trim()
    .refine(value => !value || (/^\d+$/.test(value) && Number(value) <= max), "wholeNumberInvalid");

const quantity = z.string().trim().refine(value => {
    const parsed = parseQuantity(value);

    return parsed !== null && parsed >= 0.01 && parsed <= MAX_QUANTITY;
}, "quantityInvalid");

/** A typed amount in the server's form, or null when blank. */
export const toAmount = (value: string): string | null => value.trim() ? parseAmount(value) : null;
/** A typed whole number, or null when blank. */
export const toWholeNumber = (value: string): number | null => value.trim() ? Number(value.trim()) : null;

// --- Settings -----------------------------------------------------------------------------------------------------

export const budgetSettingsValuesSchema = z.object({
    participantsPlanned: wholeNumber(MAX_PARTICIPANTS),
    participationFee: optionalAmount,
    loanAmount: optionalAmount,
    loanReceivedOn: optionalDate,
    loanRepaidOn: optionalDate,
}).superRefine((values, ctx) => {
    if (values.loanReceivedOn && values.loanRepaidOn && values.loanRepaidOn < values.loanReceivedOn) {
        ctx.addIssue({code: "custom", message: "loanRepaidBeforeReceived", path: ["loanRepaidOn"]});
    }
});

export type BudgetSettingsValues = z.infer<typeof budgetSettingsValuesSchema>;

export const budgetSettingsSchema = z.object({revivalId: id, version, values: budgetSettingsValuesSchema});

// --- Lines --------------------------------------------------------------------------------------------------------

export const budgetLineValuesSchema = z.object({
    categoryId: z.string().min(1, "budgetCategoryRequired"),
    description: z.string().trim().min(1, "budgetDescriptionRequired").max(MAX_BUDGET_TEXT, "budgetDescriptionTooLong"),
    quantity,
    unitAmount: amount(),
    eventId: z.string(),
    logEntryId: z.string(),
    comment: z.string().trim().max(MAX_BUDGET_COMMENT, "budgetCommentTooLong"),
});

export type BudgetLineValues = z.infer<typeof budgetLineValuesSchema>;

export const budgetLineCreateSchema = z.object({
    revivalId: id,
    eventTypeLineId: z.string().optional(),
    values: budgetLineValuesSchema
});
export const budgetLineUpdateSchema = z.object({revivalId: id, id, version, values: budgetLineValuesSchema});
export const budgetTransitionSchema = z.object({revivalId: id, id, version});

// --- Transactions -------------------------------------------------------------------------------------------------

export const transactionValuesSchema = z.object({
    date,
    amount: amount(1),
    categoryId: z.string().min(1, "budgetCategoryRequired"),
    description: z.string().trim().min(1, "budgetDescriptionRequired").max(MAX_BUDGET_TEXT, "budgetDescriptionTooLong"),
    budgetLineId: z.string(),
    paidBy: ownerSchema,
});

export type TransactionValues = z.infer<typeof transactionValuesSchema>;

export const transactionCreateSchema = z.object({revivalId: id, cost: z.boolean(), values: transactionValuesSchema});
export const transactionUpdateSchema = z.object({
    revivalId: id,
    id,
    version,
    cost: z.boolean(),
    values: transactionValuesSchema
});
export const transactionReimbursedSchema = budgetTransitionSchema.extend({reimbursed: z.boolean()});

const RECEIPT_EXTENSIONS = /\.(pdf|jpe?g|png|heic|webp)$/i;

/**
 * Whether a file may be sent as a receipt: one of the types the server takes and at most 10 MB. Browsers often give a
 * HEIC photo no type, so the extension decides then. The server sniffs the content as well.
 */
export function receiptProblem(file: {
    type: string;
    size: number;
    name?: string
}): "receiptTooLarge" | "receiptType" | null {
    if (file.size > MAX_RECEIPT_BYTES) {
        return "receiptTooLarge";
    }
    if (!file.type) {
        return RECEIPT_EXTENSIONS.test(file.name ?? "") ? null : "receiptType";
    }
    return (RECEIPT_TYPES as readonly string[]).includes(file.type) ? null : "receiptType";
}

// --- Scenarios ----------------------------------------------------------------------------------------------------

export const SCENARIO_PARAMETERS = [
    "participants", "participationFee", "showTicketPrice", "showTickets", "partyTicketPrice", "partyTickets", "venueCost", "partyCost",
] as const;

export type ScenarioParameter = typeof SCENARIO_PARAMETERS[number];

/** The parameters that are counts; the others are amounts. */
export const SCENARIO_COUNTS: ReadonlySet<ScenarioParameter> = new Set(["participants", "showTickets", "partyTickets"]);

export const scenarioValuesSchema = z.object({
    participants: wholeNumber(MAX_PARTICIPANTS),
    participationFee: optionalAmount,
    showTicketPrice: optionalAmount,
    showTickets: wholeNumber(1_000_000),
    partyTicketPrice: optionalAmount,
    partyTickets: wholeNumber(1_000_000),
    venueCost: optionalAmount,
    partyCost: optionalAmount,
});

export type ScenarioValues = z.infer<typeof scenarioValuesSchema>;

export const scenarioCalculateSchema = z.object({revivalId: id, values: scenarioValuesSchema});
export const scenarioSaveSchema = z.object({
    revivalId: id,
    name: z.string().trim().min(1, "scenarioNameRequired").max(MAX_SCENARIO_NAME, "scenarioNameTooLong"),
    values: scenarioValuesSchema,
});
export const scenarioUpdateSchema = scenarioSaveSchema.extend({id, version});

/**
 * The GraphQL input for the form: a blank field keeps the budget's value.
 */
export function toScenarioInput(values: ScenarioValues) {
    return {
        participants: toWholeNumber(values.participants),
        participationFee: toAmount(values.participationFee),
        showTicketPrice: toAmount(values.showTicketPrice),
        showTickets: toWholeNumber(values.showTickets),
        partyTicketPrice: toAmount(values.partyTicketPrice),
        partyTickets: toWholeNumber(values.partyTickets),
        venueCost: toAmount(values.venueCost),
        partyCost: toAmount(values.partyCost),
    };
}

// --- Administration -----------------------------------------------------------------------------------------------

export const budgetCategoryRole = z.union([z.literal(""), z.enum(BUDGET_CATEGORY_ROLES)]);

export const budgetCategoryCreateSchema = z.object({
    name: z.object({
        sv: z.string().trim().min(1, "catalogNameRequired").max(100, "catalogNameTooLong"),
        en: z.string().trim().max(100, "catalogNameTooLong").optional().nullable()
    }),
    kind: z.enum(BUDGET_CATEGORY_KINDS),
    role: budgetCategoryRole,
});

export const budgetCategoryUpdateSchema = z.object({
    id: z.string().trim().min(1).max(36),
    version,
    name: budgetCategoryCreateSchema.shape.name,
    role: budgetCategoryRole,
});

export const referenceFigureValuesSchema = z.object({
    categoryId: id,
    budgeted: optionalAmount,
    actual: optionalAmount,
});

export const referenceRevivalValuesSchema = z.object({
    label: z.string().trim().min(1, "referenceLabelRequired").max(MAX_REFERENCE_LABEL, "referenceLabelTooLong"),
    year: z.string().trim().regex(/^\d{4}$/, "yearInvalid"),
    participants: wholeNumber(MAX_PARTICIPANTS),
    comment: z.string().trim().max(MAX_BUDGET_COMMENT, "budgetCommentTooLong"),
    figures: z.array(referenceFigureValuesSchema),
});

export type ReferenceRevivalValues = z.infer<typeof referenceRevivalValuesSchema>;

export const referenceRevivalCreateSchema = z.object({values: referenceRevivalValuesSchema});
export const referenceRevivalUpdateSchema = z.object({id, version, values: referenceRevivalValuesSchema});
export const referenceRevivalDeleteSchema = z.object({id, version});

/**
 * The GraphQL input: categories with neither figure are left out, since the server requires one of them.
 */
export function toReferenceRevivalInput(values: ReferenceRevivalValues) {
    return {
        label: values.label,
        year: Number(values.year),
        participants: toWholeNumber(values.participants),
        comment: values.comment || null,
        figures: values.figures
            .filter(figure => figure.budgeted || figure.actual)
            .map(figure => ({
                categoryId: figure.categoryId,
                budgeted: toAmount(figure.budgeted),
                actual: toAmount(figure.actual)
            })),
    };
}

export const eventTypeBudgetLineValuesSchema = z.object({
    categoryId: z.string().min(1, "budgetCategoryRequired"),
    description: z.object({
        sv: z.string().trim().min(1, "budgetDescriptionRequired").max(MAX_BUDGET_TEXT, "budgetDescriptionTooLong"),
        en: z.string().trim().max(MAX_BUDGET_TEXT, "budgetDescriptionTooLong"),
    }),
    quantityRule: z.enum(BUDGET_LINE_QUANTITIES),
    quantity: z.string().trim(),
    unitAmount: amount(),
}).superRefine((values, ctx) => {
    const parsed = parseQuantity(values.quantity);

    if (values.quantityRule === "FIXED" && (parsed === null || parsed < 0.01 || parsed > MAX_QUANTITY)) {
        ctx.addIssue({code: "custom", message: "quantityInvalid", path: ["quantity"]});
    }
});

export type EventTypeBudgetLineValues = z.infer<typeof eventTypeBudgetLineValuesSchema>;

export const eventTypeBudgetLineCreateSchema = z.object({eventTypeId: id, values: eventTypeBudgetLineValuesSchema});
export const eventTypeBudgetLineUpdateSchema = z.object({id, version, values: eventTypeBudgetLineValuesSchema});
export const eventTypeBudgetLineRemoveSchema = z.object({id, version});

export function toEventTypeBudgetLineInput(values: EventTypeBudgetLineValues) {
    return {
        categoryId: values.categoryId,
        description: {sv: values.description.sv, en: values.description.en || null},
        quantityRule: values.quantityRule,
        quantity: values.quantityRule === "FIXED" ? parseQuantity(values.quantity) : null,
        unitAmount: parseAmount(values.unitAmount) ?? "0",
    };
}
