"use server";

import {revalidatePath} from "next/cache";
import type {z} from "zod";
import type {
    BudgetLineUpdateInput,
    BudgetScenarioResultFieldsFragment,
    OwnerInput,
    TransactionUpdateInput
} from "@/gql/graphql";
import {type ActionResult, toActionResult} from "@/lib/graphql.server";
import {
    calculateScenario,
    cancelTransaction,
    createBudgetLine,
    createTransaction,
    removeBudgetLine,
    removeScenario,
    restoreBudgetLine,
    saveScenario,
    setTransactionReimbursed,
    updateBudgetLine,
    updateBudgetSettings,
    updateScenario,
    updateTransaction,
} from "@/lib/budget/budget.server";
import {parseAmount, parseQuantity} from "@/lib/budget/amount";
import {
    budgetLineCreateSchema,
    budgetLineUpdateSchema,
    budgetSettingsSchema,
    budgetTransitionSchema,
    scenarioCalculateSchema,
    scenarioSaveSchema,
    scenarioUpdateSchema,
    toAmount,
    toScenarioInput,
    toWholeNumber,
    transactionCreateSchema,
    transactionReimbursedSchema,
    transactionUpdateSchema,
} from "@/lib/budget/schema";
import type {ownerSchema} from "@/lib/decision-log/schema";
import {Policies} from "@/utils/policy.server";
import {withPolicyAction} from "@/utils/route.server";

// The overview's budget card and every budget page show the totals, so the whole revival is revalidated.
function revalidate(revivalId: string) {
    revalidatePath(`/revivals/${revivalId}`, "layout");
}

function ownerInput(owner: z.infer<typeof ownerSchema> | undefined): OwnerInput | null {
    if (owner?.personId) {
        return {personId: owner.personId};
    }
    if (owner?.name) {
        return {name: owner.name};
    }
    return null;
}

export async function updateBudgetSettingsAction(input: z.input<typeof budgetSettingsSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, version, values} = budgetSettingsSchema.parse(input);

        await updateBudgetSettings({
            revivalId, version,
            participantsPlanned: toWholeNumber(values.participantsPlanned),
            participationFee: toAmount(values.participationFee),
            loanAmount: toAmount(values.loanAmount),
            loanReceivedOn: values.loanReceivedOn || null,
            loanRepaidOn: values.loanRepaidOn || null,
        });
        revalidate(revivalId);
        return null;
    }));
}

export async function createBudgetLineAction(input: z.input<typeof budgetLineCreateSchema>): Promise<ActionResult<{
    id: string
}>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, eventTypeLineId, values} = budgetLineCreateSchema.parse(input);
        const created = await createBudgetLine({
            revivalId,
            categoryId: values.categoryId,
            description: values.description,
            quantity: parseQuantity(values.quantity),
            unitAmount: parseAmount(values.unitAmount) ?? "0",
            eventId: values.eventId || null,
            logEntryId: values.logEntryId || null,
            comment: values.comment || null,
            eventTypeLineId: eventTypeLineId || null,
        });

        revalidate(revivalId);
        return {id: created?.id ?? ""};
    }));
}

/**
 * Sends every field; the optional links and the comment are cleared when left blank.
 */
export async function updateBudgetLineAction(input: z.input<typeof budgetLineUpdateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, id, version, values} = budgetLineUpdateSchema.parse(input);
        const update: BudgetLineUpdateInput = {
            id, version,
            categoryId: values.categoryId,
            description: values.description,
            quantity: parseQuantity(values.quantity),
            unitAmount: parseAmount(values.unitAmount),
            ...(values.eventId ? {eventId: values.eventId} : {clearEvent: true}),
            ...(values.logEntryId ? {logEntryId: values.logEntryId} : {clearLogEntry: true}),
            ...(values.comment ? {comment: values.comment} : {clearComment: true}),
        };

        await updateBudgetLine(update);
        revalidate(revivalId);
        return null;
    }));
}

async function transition(input: z.input<typeof budgetTransitionSchema>, run: (id: string, version: number) => Promise<void>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, id, version} = budgetTransitionSchema.parse(input);

        await run(id, version);
        revalidate(revivalId);
        return null;
    }));
}

export async function removeBudgetLineAction(input: z.input<typeof budgetTransitionSchema>) {
    return transition(input, removeBudgetLine);
}

export async function restoreBudgetLineAction(input: z.input<typeof budgetTransitionSchema>) {
    return transition(input, restoreBudgetLine);
}

/**
 * Adds a transaction; who paid is only sent for a cost. The receipt is uploaded afterwards through the route handler.
 */
export async function createTransactionAction(input: z.input<typeof transactionCreateSchema>): Promise<ActionResult<{
    id: string
}>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, cost, values} = transactionCreateSchema.parse(input);
        const created = await createTransaction({
            revivalId,
            date: values.date,
            amount: parseAmount(values.amount) ?? "0",
            categoryId: values.categoryId,
            description: values.description,
            budgetLineId: values.budgetLineId || null,
            paidBy: cost ? ownerInput(values.paidBy) : null,
        });

        revalidate(revivalId);
        return {id: created?.id ?? ""};
    }));
}

export async function updateTransactionAction(input: z.input<typeof transactionUpdateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, id, version, cost, values} = transactionUpdateSchema.parse(input);
        const paidBy = cost ? ownerInput(values.paidBy) : null;
        const update: TransactionUpdateInput = {
            id, version,
            date: values.date,
            amount: parseAmount(values.amount),
            categoryId: values.categoryId,
            description: values.description,
            ...(values.budgetLineId ? {budgetLineId: values.budgetLineId} : {clearBudgetLine: true}),
            ...(paidBy ? {paidBy} : {clearPaidBy: true}),
        };

        await updateTransaction(update);
        revalidate(revivalId);
        return null;
    }));
}

export async function cancelTransactionAction(input: z.input<typeof budgetTransitionSchema>) {
    return transition(input, cancelTransaction);
}

export async function setReimbursedAction(input: z.input<typeof transactionReimbursedSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, id, version, reimbursed} = transactionReimbursedSchema.parse(input);

        await setTransactionReimbursed(id, version, reimbursed);
        revalidate(revivalId);
        return null;
    }));
}

/**
 * What-if over the budget; nothing is stored. Readers of the budget may calculate.
 */
export async function calculateScenarioAction(input: z.input<typeof scenarioCalculateSchema>): Promise<ActionResult<BudgetScenarioResultFieldsFragment | null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, values} = scenarioCalculateSchema.parse(input);

        return calculateScenario(revivalId, toScenarioInput(values));
    }));
}

export async function saveScenarioAction(input: z.input<typeof scenarioSaveSchema>): Promise<ActionResult<{
    id: string
}>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, name, values} = scenarioSaveSchema.parse(input);
        const saved = await saveScenario({revivalId, name, parameters: toScenarioInput(values)});

        revalidatePath(`/revivals/${revivalId}/budget/scenarios`);
        return {id: saved?.id ?? ""};
    }));
}

export async function updateScenarioAction(input: z.input<typeof scenarioUpdateSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, id, version, name, values} = scenarioUpdateSchema.parse(input);

        await updateScenario(id, version, {name, parameters: toScenarioInput(values)});
        revalidatePath(`/revivals/${revivalId}/budget/scenarios`);
        return null;
    }));
}

export async function removeScenarioAction(input: z.input<typeof budgetTransitionSchema>): Promise<ActionResult<null>> {
    return withPolicyAction(Policies.app.requireAccess, () => toActionResult(async () => {
        const {revivalId, id, version} = budgetTransitionSchema.parse(input);

        await removeScenario(id, version);
        revalidatePath(`/revivals/${revivalId}/budget/scenarios`);
        return null;
    }));
}
