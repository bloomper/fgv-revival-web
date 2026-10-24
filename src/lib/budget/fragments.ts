import {graphql} from "@/gql";

export const BudgetCategoryFields = graphql(`
    fragment BudgetCategoryFields on BudgetCategory {
        id
        kind
        role
        name { sv en }
        retired
    }
`);

export const BudgetLineFields = graphql(`
    fragment BudgetLineFields on BudgetLine {
        id
        category { ...BudgetCategoryFields }
        description
        quantity
        unitAmount
        amount
        event { id title startDate endDate cancelled }
        logEntry { id number type status }
        comment
        removed
        version
    }
`);

export const TransactionFields = graphql(`
    fragment TransactionFields on Transaction {
        id
        date
        amount
        category { ...BudgetCategoryFields }
        description
        budgetLine { id description removed }
        paidBy { ...OwnerFields }
        reimbursed
        reimbursedAt
        receipt { filename contentType size uploadedAt }
        cancelled
        version
    }
`);

export const BudgetScenarioParametersFields = graphql(`
    fragment BudgetScenarioParametersFields on BudgetScenarioParameters {
        participants
        participationFee
        showTicketPrice
        showTickets
        partyTicketPrice
        partyTickets
        venueCost
        partyCost
    }
`);

export const BudgetScenarioResultFields = graphql(`
    fragment BudgetScenarioResultFields on BudgetScenarioResult {
        baseline { ...BudgetScenarioParametersFields }
        used { ...BudgetScenarioParametersFields }
        income
        cost
        result
        breakEvenShowTickets
        partySubsidy
    }
`);

export const EventTypeBudgetLineFields = graphql(`
    fragment EventTypeBudgetLineFields on EventTypeBudgetLine {
        id
        category { ...BudgetCategoryFields }
        description { sv en }
        quantityRule
        quantity
        unitAmount
        version
    }
`);

export const ReferenceRevivalFields = graphql(`
    fragment ReferenceRevivalFields on ReferenceRevival {
        id
        label
        year
        participants
        comment
        automatic
        figures { category { ...BudgetCategoryFields } budgeted actual }
        version
    }
`);
