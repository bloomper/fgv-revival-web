import {describe, expect, it} from "vitest";
import {render, screen, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {BudgetCategoryTable, type BudgetCategorySummary, categoryDifference} from "@/components/budget/budget-category-table.client";

const nbsp = (text: string | null) => text?.replace(/ /g, " ");

const tickets: BudgetCategorySummary = {
    category: {id: "SHOW_TICKETS", kind: "INCOME", role: "SHOW_TICKETS", name: {sv: "Biljetter föreställning", en: "Show tickets"}, retired: false},
    budgeted: "60000", actual: "64500.50",
    references: [{label: "Nobel 2026", year: 2026, participants: 60, budgeted: "55000", actual: "58000", budgetedPerParticipant: "917", actualPerParticipant: "967"}],
};
const venue: BudgetCategorySummary = {
    category: {id: "VENUE", kind: "COST", role: "VENUE", name: {sv: "Lokaler", en: "Venues"}, retired: false},
    budgeted: "40000", actual: "42000", references: [],
};
const food: BudgetCategorySummary = {
    category: {id: "FOOD", kind: "COST", name: {sv: "Mat och dryck", en: "Food and drink"}, retired: false},
    budgeted: "3400", actual: "0", references: [],
};

describe("categoryDifference", () => {
    it("is positive when the result gains: more income or less cost than budgeted", () => {
        expect(categoryDifference(tickets)).toBe("4500.50");
        expect(categoryDifference(venue)).toBe("-2000");
        expect(categoryDifference(food)).toBe("3400");
    });
});

describe("BudgetCategoryTable", () => {
    it("lists income, then costs, each with a subtotal, and the result", () => {
        render(<BudgetCategoryTable categories={[venue, tickets, food]}/>);

        const rows = screen.getAllByRole("row").map(row => nbsp(row.textContent));

        expect(rows[1]).toContain("Biljetter föreställning");
        expect(rows[1]).toContain("60 000 kr");
        expect(rows[1]).toContain("64 500,50 kr");
        expect(rows[2]).toContain("subtotal");
        expect(rows[3]).toContain("Lokaler");
        expect(rows[4]).toContain("Mat och dryck");
        expect(rows[5]).toContain("43 400 kr");
        expect(rows[5]).toContain("42 000 kr");
        expect(rows[6]).toContain("result");
        expect(rows[6]).toContain("16 600 kr");
        expect(rows[6]).toContain("22 500,50 kr");
    });

    it("shows a cost over budget as negative", () => {
        render(<BudgetCategoryTable categories={[venue]}/>);

        const row = screen.getByRole("row", {name: /Lokaler/});
        const difference = within(row).getAllByRole("cell")[3];

        expect(nbsp(difference.textContent)).toBe("\u22122 000 kr");
        expect(difference.firstElementChild).toHaveClass("text-destructive");
    });

    it("opens a category to show earlier revivals' figures, per participant too", async () => {
        render(<BudgetCategoryTable categories={[tickets, venue]}/>);

        await userEvent.click(screen.getByRole("button", {name: /showReferences.*Biljetter föreställning/}));
        expect(screen.getByRole("button", {name: /showReferences.*Biljetter föreställning/})).toHaveAttribute("aria-expanded", "true");
        expect(screen.getByText("Nobel 2026")).toBeInTheDocument();
        expect(nbsp(screen.getByText(/967/).textContent)).toBe("967 kr");

        await userEvent.click(screen.getByRole("button", {name: /showReferences.*Lokaler/}));
        expect(screen.getByText("noReferences")).toBeInTheDocument();
    });

    it("says so when the budget is empty", () => {
        render(<BudgetCategoryTable categories={[]}/>);

        expect(screen.getByText("noCategories")).toBeInTheDocument();
    });
});
