import "server-only";

import {graphql} from "@/gql";
import type {
    BudgetCategoryCreateInput,
    BudgetCategoryUpdateInput,
    EventTypeBudgetLineInput,
    ReferenceRevivalInput,
} from "@/gql/graphql";
import {runMutation, runQuery} from "@/lib/graphql.server";

// The lists the super admin keeps for budgets: categories, reference figures from earlier revivals and the lines
// an event type proposes.

const BudgetCategoriesQuery = graphql(`
    query BudgetCategories($includeRetired: Boolean) {
        budgetCategories(includeRetired: $includeRetired) { ...BudgetCategoryFields position inUse version }
    }
`);

const BudgetCategoryCreateMutation = graphql(`
    mutation BudgetCategoryCreate($input: BudgetCategoryCreateInput!) {
        budgetCategoryCreate(input: $input) { id }
    }
`);

const BudgetCategoryUpdateMutation = graphql(`
    mutation BudgetCategoryUpdate($input: BudgetCategoryUpdateInput!) {
        budgetCategoryUpdate(input: $input) { id }
    }
`);

const BudgetCategoryMoveMutation = graphql(`
    mutation BudgetCategoryMove($id: ID!, $version: Int!, $position: Int!) {
        budgetCategoryMove(id: $id, version: $version, position: $position) { id }
    }
`);

const BudgetCategoryRetireMutation = graphql(`
    mutation BudgetCategoryRetire($id: ID!, $version: Int!) {
        budgetCategoryRetire(id: $id, version: $version) { id }
    }
`);

const BudgetCategoryRestoreMutation = graphql(`
    mutation BudgetCategoryRestore($id: ID!, $version: Int!) {
        budgetCategoryRestore(id: $id, version: $version) { id }
    }
`);

const BudgetCategoryDeleteMutation = graphql(`
    mutation BudgetCategoryDelete($id: ID!, $version: Int!) {
        budgetCategoryDelete(id: $id, version: $version)
    }
`);

const ReferenceRevivalsQuery = graphql(`
    query ReferenceRevivals {
        referenceRevivals { ...ReferenceRevivalFields }
    }
`);

const ReferenceRevivalCreateMutation = graphql(`
    mutation ReferenceRevivalCreate($input: ReferenceRevivalInput!) {
        referenceRevivalCreate(input: $input) { id }
    }
`);

const ReferenceRevivalUpdateMutation = graphql(`
    mutation ReferenceRevivalUpdate($id: ID!, $version: Int!, $input: ReferenceRevivalInput!) {
        referenceRevivalUpdate(id: $id, version: $version, input: $input) { id }
    }
`);

const ReferenceRevivalDeleteMutation = graphql(`
    mutation ReferenceRevivalDelete($id: ID!, $version: Int!) {
        referenceRevivalDelete(id: $id, version: $version)
    }
`);

const EventTypeBudgetLineCreateMutation = graphql(`
    mutation EventTypeBudgetLineCreate($input: EventTypeBudgetLineInput!) {
        eventTypeBudgetLineCreate(input: $input) { id }
    }
`);

const EventTypeBudgetLineUpdateMutation = graphql(`
    mutation EventTypeBudgetLineUpdate($id: ID!, $version: Int!, $input: EventTypeBudgetLineInput!) {
        eventTypeBudgetLineUpdate(id: $id, version: $version, input: $input) { id }
    }
`);

const EventTypeBudgetLineRemoveMutation = graphql(`
    mutation EventTypeBudgetLineRemove($id: ID!, $version: Int!) {
        eventTypeBudgetLineRemove(id: $id, version: $version) { id }
    }
`);

/**
 * The budget categories in list order. Retired ones only when asked for: pickers offer the active ones.
 */
export async function getBudgetCategories(includeRetired = false) {
    return (await runQuery(BudgetCategoriesQuery, {includeRetired}))?.budgetCategories ?? [];
}

export async function createBudgetCategory(input: BudgetCategoryCreateInput) {
    await runMutation(BudgetCategoryCreateMutation, {input});
}

export async function updateBudgetCategory(input: BudgetCategoryUpdateInput) {
    await runMutation(BudgetCategoryUpdateMutation, {input});
}

export async function moveBudgetCategory(id: string, version: number, position: number) {
    await runMutation(BudgetCategoryMoveMutation, {id, version, position});
}

export async function retireBudgetCategory(id: string, version: number) {
    await runMutation(BudgetCategoryRetireMutation, {id, version});
}

export async function restoreBudgetCategory(id: string, version: number) {
    await runMutation(BudgetCategoryRestoreMutation, {id, version});
}

export async function deleteBudgetCategory(id: string, version: number) {
    await runMutation(BudgetCategoryDeleteMutation, {id, version});
}

export async function getReferenceRevivals() {
    return (await runQuery(ReferenceRevivalsQuery, {}))?.referenceRevivals ?? [];
}

export async function createReferenceRevival(input: ReferenceRevivalInput) {
    await runMutation(ReferenceRevivalCreateMutation, {input});
}

export async function updateReferenceRevival(id: string, version: number, input: ReferenceRevivalInput) {
    await runMutation(ReferenceRevivalUpdateMutation, {id, version, input});
}

export async function deleteReferenceRevival(id: string, version: number) {
    await runMutation(ReferenceRevivalDeleteMutation, {id, version});
}

export async function createEventTypeBudgetLine(input: EventTypeBudgetLineInput) {
    await runMutation(EventTypeBudgetLineCreateMutation, {input});
}

export async function updateEventTypeBudgetLine(id: string, version: number, input: EventTypeBudgetLineInput) {
    await runMutation(EventTypeBudgetLineUpdateMutation, {id, version, input});
}

export async function removeEventTypeBudgetLine(id: string, version: number) {
    await runMutation(EventTypeBudgetLineRemoveMutation, {id, version});
}
