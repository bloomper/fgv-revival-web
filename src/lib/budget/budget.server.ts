import "server-only";

import {graphql} from "@/gql";
import type {
    BudgetLineCreateInput,
    BudgetLineUpdateInput,
    BudgetScenarioInput,
    BudgetScenarioSaveInput,
    BudgetSettingsInput,
    TransactionCreateInput,
    TransactionUpdateInput,
} from "@/gql/graphql";
import {runMutation, runQuery} from "@/lib/graphql.server";

// A revival's budget (M5, contract budget.graphqls). Revival.budget is null for callers who may not read it.

const BudgetAccessQuery = graphql(`
    query BudgetAccess($id: ID!) {
        revival(id: $id) {
            id
            status
            permissions { canReadBudget canWriteBudget }
        }
    }
`);

const BudgetOverviewQuery = graphql(`
    query BudgetOverview($id: ID!) {
        revival(id: $id) {
            id
            title
            status
            permissions { canReadBudget canWriteBudget }
            budget {
                revivalId
                settings { participantsPlanned participationFee loanAmount loanReceivedOn loanRepaidOn version }
                totals {
                    budgetedIncome budgetedCost budgetedResult actualIncome actualCost actualResult
                    unreimbursed unreimbursedCount missingReceipts
                }
                categories {
                    category { ...BudgetCategoryFields }
                    budgeted
                    actual
                    references { label year participants budgeted actual budgetedPerParticipant actualPerParticipant }
                }
            }
        }
    }
`);

const BudgetLinesQuery = graphql(`
    query BudgetLines($id: ID!, $includeRemoved: Boolean!) {
        revival(id: $id) {
            id
            status
            permissions { canReadBudget canWriteBudget }
            budget {
                revivalId
                settings { participantsPlanned version }
                lines(includeRemoved: $includeRemoved) { ...BudgetLineFields }
                proposals {
                    event { id title startDate endDate }
                    line { ...EventTypeBudgetLineFields }
                    quantity
                    amount
                }
            }
        }
        events(revivalId: $id) { id title startDate endDate }
        logEntries(revivalId: $id, filter: {types: [DECISION]}) { id number text date }
        budgetCategories { ...BudgetCategoryFields }
    }
`);

const BudgetTransactionsQuery = graphql(`
    query BudgetTransactions($id: ID!, $includeCancelled: Boolean!) {
        revival(id: $id) {
            id
            status
            permissions { canReadBudget canWriteBudget }
            ownerCandidates { id displayName }
            budget {
                revivalId
                transactions(includeCancelled: $includeCancelled) { ...TransactionFields }
                lines { id description category { id } }
            }
        }
        budgetCategories { ...BudgetCategoryFields }
    }
`);

const BudgetScenariosQuery = graphql(`
    query BudgetScenarios($id: ID!) {
        revival(id: $id) {
            id
            status
            permissions { canReadBudget canWriteBudget }
            budget {
                revivalId
                scenarios {
                    id
                    name
                    parameters { ...BudgetScenarioParametersFields }
                    result { ...BudgetScenarioResultFields }
                    version
                }
            }
        }
        budgetScenarioCalculate(revivalId: $id, input: {}) { ...BudgetScenarioResultFields }
    }
`);

const RevivalBudgetSummaryQuery = graphql(`
    query RevivalBudgetSummary($id: ID!) {
        revival(id: $id) {
            id
            budget {
                revivalId
                totals { budgetedIncome budgetedCost budgetedResult actualIncome actualCost actualResult }
            }
        }
    }
`);

const BudgetScenarioCalculateQuery = graphql(`
    query BudgetScenarioCalculate($revivalId: ID!, $input: BudgetScenarioInput!) {
        budgetScenarioCalculate(revivalId: $revivalId, input: $input) { ...BudgetScenarioResultFields }
    }
`);

const BudgetSettingsUpdateMutation = graphql(`
    mutation BudgetSettingsUpdate($input: BudgetSettingsInput!) {
        budgetSettingsUpdate(input: $input) { revivalId }
    }
`);

const BudgetLineCreateMutation = graphql(`
    mutation BudgetLineCreate($input: BudgetLineCreateInput!) {
        budgetLineCreate(input: $input) { id }
    }
`);

const BudgetLineUpdateMutation = graphql(`
    mutation BudgetLineUpdate($input: BudgetLineUpdateInput!) {
        budgetLineUpdate(input: $input) { id }
    }
`);

const BudgetLineRemoveMutation = graphql(`
    mutation BudgetLineRemove($id: ID!, $version: Int!) {
        budgetLineRemove(id: $id, version: $version) { id }
    }
`);

const BudgetLineRestoreMutation = graphql(`
    mutation BudgetLineRestore($id: ID!, $version: Int!) {
        budgetLineRestore(id: $id, version: $version) { id }
    }
`);

const TransactionCreateMutation = graphql(`
    mutation TransactionCreate($input: TransactionCreateInput!) {
        transactionCreate(input: $input) { id }
    }
`);

const TransactionUpdateMutation = graphql(`
    mutation TransactionUpdate($input: TransactionUpdateInput!) {
        transactionUpdate(input: $input) { id }
    }
`);

const TransactionCancelMutation = graphql(`
    mutation TransactionCancel($id: ID!, $version: Int!) {
        transactionCancel(id: $id, version: $version) { id }
    }
`);

const TransactionSetReimbursedMutation = graphql(`
    mutation TransactionSetReimbursed($id: ID!, $version: Int!, $reimbursed: Boolean!) {
        transactionSetReimbursed(id: $id, version: $version, reimbursed: $reimbursed) { id }
    }
`);

const BudgetScenarioSaveMutation = graphql(`
    mutation BudgetScenarioSave($input: BudgetScenarioSaveInput!) {
        budgetScenarioSave(input: $input) { id }
    }
`);

const BudgetScenarioUpdateMutation = graphql(`
    mutation BudgetScenarioUpdate($id: ID!, $version: Int!, $input: BudgetScenarioSaveInput!) {
        budgetScenarioUpdate(id: $id, version: $version, input: $input) { id }
    }
`);

const BudgetScenarioRemoveMutation = graphql(`
    mutation BudgetScenarioRemove($id: ID!, $version: Int!) {
        budgetScenarioRemove(id: $id, version: $version)
    }
`);

/**
 * The revival's status and whether the caller reads and writes its budget, for the budget's layout.
 */
export async function getBudgetAccess(revivalId: string) {
    return (await runQuery(BudgetAccessQuery, {id: revivalId}))?.revival ?? null;
}

export async function getBudgetOverview(revivalId: string) {
    return (await runQuery(BudgetOverviewQuery, {id: revivalId}))?.revival ?? null;
}

/**
 * The budget's lines with what their dialog picks from: the proposals, the revival's events, its DECISION rows and the
 * active categories.
 */
export async function getBudgetLines(revivalId: string, includeRemoved = false) {
    const data = await runQuery(BudgetLinesQuery, {id: revivalId, includeRemoved});

    return data?.revival
        ? {revival: data.revival, events: data.events, decisions: data.logEntries, categories: data.budgetCategories}
        : null;
}

export async function getBudgetTransactions(revivalId: string, includeCancelled = false) {
    const data = await runQuery(BudgetTransactionsQuery, {id: revivalId, includeCancelled});

    return data?.revival ? {revival: data.revival, categories: data.budgetCategories} : null;
}

/**
 * The saved scenarios and the budget's own result, whose baseline the scenario form shows.
 */
export async function getBudgetScenarios(revivalId: string) {
    const data = await runQuery(BudgetScenariosQuery, {id: revivalId});

    return data?.revival ? {revival: data.revival, current: data.budgetScenarioCalculate} : null;
}

/**
 * The totals for the revival's overview, or null when the caller may not read the budget.
 */
export async function getRevivalBudgetSummary(revivalId: string) {
    return (await runQuery(RevivalBudgetSummaryQuery, {id: revivalId}))?.revival?.budget ?? null;
}

export async function calculateScenario(revivalId: string, input: BudgetScenarioInput) {
    return (await runQuery(BudgetScenarioCalculateQuery, {revivalId, input}))?.budgetScenarioCalculate ?? null;
}

export async function updateBudgetSettings(input: BudgetSettingsInput) {
    await runMutation(BudgetSettingsUpdateMutation, {input});
}

export async function createBudgetLine(input: BudgetLineCreateInput) {
    return (await runMutation(BudgetLineCreateMutation, {input}))?.budgetLineCreate;
}

export async function updateBudgetLine(input: BudgetLineUpdateInput) {
    await runMutation(BudgetLineUpdateMutation, {input});
}

export async function removeBudgetLine(id: string, version: number) {
    await runMutation(BudgetLineRemoveMutation, {id, version});
}

export async function restoreBudgetLine(id: string, version: number) {
    await runMutation(BudgetLineRestoreMutation, {id, version});
}

export async function createTransaction(input: TransactionCreateInput) {
    return (await runMutation(TransactionCreateMutation, {input}))?.transactionCreate;
}

export async function updateTransaction(input: TransactionUpdateInput) {
    await runMutation(TransactionUpdateMutation, {input});
}

export async function cancelTransaction(id: string, version: number) {
    await runMutation(TransactionCancelMutation, {id, version});
}

export async function setTransactionReimbursed(id: string, version: number, reimbursed: boolean) {
    await runMutation(TransactionSetReimbursedMutation, {id, version, reimbursed});
}

export async function saveScenario(input: BudgetScenarioSaveInput) {
    return (await runMutation(BudgetScenarioSaveMutation, {input}))?.budgetScenarioSave;
}

export async function updateScenario(id: string, version: number, input: BudgetScenarioSaveInput) {
    await runMutation(BudgetScenarioUpdateMutation, {id, version, input});
}

export async function removeScenario(id: string, version: number) {
    await runMutation(BudgetScenarioRemoveMutation, {id, version});
}
