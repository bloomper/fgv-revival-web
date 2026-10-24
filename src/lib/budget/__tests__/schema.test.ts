import {describe, expect, it} from "vitest";
import {
    budgetLineValuesSchema,
    budgetSettingsValuesSchema,
    eventTypeBudgetLineValuesSchema,
    receiptProblem,
    referenceRevivalValuesSchema,
    toEventTypeBudgetLineInput,
    toReferenceRevivalInput,
    toScenarioInput,
    transactionValuesSchema,
} from "@/lib/budget/schema";

const messages = (result: { success: boolean; error?: { issues: { message: string }[] } }) => result.error?.issues.map(issue => issue.message) ?? [];

describe("budget schemas", () => {
    const line = {categoryId: "FOOD", description: "Mat rephelg", quantity: "40", unitAmount: "85", eventId: "", logEntryId: "", comment: ""};

    it("accepts a line with Swedish or plain amounts", () => {
        expect(budgetLineValuesSchema.safeParse(line).success).toBe(true);
        expect(budgetLineValuesSchema.safeParse({...line, quantity: "1,5", unitAmount: "1 200,50"}).success).toBe(true);
    });

    it("refuses a line without category, with a bad amount or quantity", () => {
        expect(messages(budgetLineValuesSchema.safeParse({...line, categoryId: ""}))).toContain("budgetCategoryRequired");
        expect(messages(budgetLineValuesSchema.safeParse({...line, unitAmount: "12,345"}))).toContain("amountInvalid");
        expect(messages(budgetLineValuesSchema.safeParse({...line, unitAmount: "20000000"}))).toContain("amountOutOfRange");
        expect(messages(budgetLineValuesSchema.safeParse({...line, quantity: "0"}))).toContain("quantityInvalid");
    });

    it("requires a transaction amount above zero", () => {
        const transaction = {date: "2027-11-02", amount: "0", categoryId: "FOOD", description: "ICA", budgetLineId: "", paidBy: null};

        expect(messages(transactionValuesSchema.safeParse(transaction))).toContain("amountOutOfRange");
        expect(transactionValuesSchema.safeParse({...transaction, amount: "349,90", paidBy: {name: "Kim"}}).success).toBe(true);
    });

    it("checks the loan's dates are in order", () => {
        const settings = {participantsPlanned: "40", participationFee: "800", loanAmount: "10000", loanReceivedOn: "2027-10-01", loanRepaidOn: "2027-09-01"};

        expect(messages(budgetSettingsValuesSchema.safeParse(settings))).toEqual(["loanRepaidBeforeReceived"]);
        expect(messages(budgetSettingsValuesSchema.safeParse({...settings, participantsPlanned: "2001", loanRepaidOn: ""}))).toEqual(["wholeNumberInvalid"]);
    });

    it("sends blank scenario fields as null, so the budget's value is kept", () => {
        expect(toScenarioInput({
            participants: "45", participationFee: "", showTicketPrice: "150,50", showTickets: "", partyTicketPrice: "", partyTickets: "", venueCost: "", partyCost: "30 000",
        })).toEqual({
            participants: 45, participationFee: null, showTicketPrice: "150.50", showTickets: null, partyTicketPrice: null, partyTickets: null, venueCost: null,
            partyCost: "30000",
        });
    });

    it("leaves out reference figures with neither value", () => {
        const values = {
            label: "Nobel 2026", year: "2026", participants: "60", comment: "",
            figures: [{categoryId: "VENUE", budgeted: "40 000", actual: ""}, {categoryId: "FOOD", budgeted: "", actual: ""}],
        };

        expect(referenceRevivalValuesSchema.safeParse(values).success).toBe(true);
        expect(toReferenceRevivalInput(values)).toEqual({
            label: "Nobel 2026", year: 2026, participants: 60, comment: null, figures: [{categoryId: "VENUE", budgeted: "40000", actual: null}],
        });
        expect(messages(referenceRevivalValuesSchema.safeParse({...values, year: "26"}))).toEqual(["yearInvalid"]);
    });

    it("requires a quantity only for a fixed event type line", () => {
        const perParticipant = {categoryId: "FOOD", description: {sv: "Mat", en: ""}, quantityRule: "PER_PARTICIPANT" as const, quantity: "", unitAmount: "85"};

        expect(eventTypeBudgetLineValuesSchema.safeParse(perParticipant).success).toBe(true);
        expect(messages(eventTypeBudgetLineValuesSchema.safeParse({...perParticipant, quantityRule: "FIXED"}))).toEqual(["quantityInvalid"]);
        expect(toEventTypeBudgetLineInput({...perParticipant, quantity: "3"})).toEqual({
            categoryId: "FOOD", description: {sv: "Mat", en: null}, quantityRule: "PER_PARTICIPANT", quantity: null, unitAmount: "85",
        });
    });

    it("takes receipts the server takes", () => {
        expect(receiptProblem({type: "application/pdf", size: 1000})).toBeNull();
        expect(receiptProblem({type: "", size: 1000, name: "IMG_1.HEIC"})).toBeNull();
        expect(receiptProblem({type: "image/svg+xml", size: 10})).toBe("receiptType");
        expect(receiptProblem({type: "image/png", size: 10 * 1024 * 1024 + 1})).toBe("receiptTooLarge");
    });
});
