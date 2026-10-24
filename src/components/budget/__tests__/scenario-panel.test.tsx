import {beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
    parameterText,
    ScenarioPanel,
    type ScenarioResult,
    toScenarioValues
} from "@/components/budget/scenario-panel.client";

const actions = vi.hoisted(() => ({
    calculateScenarioAction: vi.fn(),
    saveScenarioAction: vi.fn(),
    updateScenarioAction: vi.fn(),
    removeScenarioAction: vi.fn(),
}));

vi.mock("@/app/(app)/revivals/[id]/budget/actions.server", () => actions);
vi.mock("@/hooks/use-action-feedback", () => ({useActionFeedback: () => (result: { ok: boolean }) => result.ok}));

const baseline = {
    participants: 40,
    participationFee: "800",
    showTicketPrice: "150",
    showTickets: 400,
    partyTicketPrice: "350",
    partyTickets: 80,
    venueCost: "40000",
    partyCost: "30000",
};
const current: ScenarioResult = {
    baseline,
    used: baseline,
    income: "120000",
    cost: "110000",
    result: "10000",
    breakEvenShowTickets: 334,
    partySubsidy: "2000"
};
const nbsp = (text: string | null | undefined) => text?.replace(/ /g, " ");

beforeEach(() => {
    Object.values(actions).forEach(action => action.mockReset());
});

describe("scenario values", () => {
    it("shows counts as they are and amounts with a decimal comma", () => {
        expect(parameterText("showTickets", 400)).toBe("400");
        expect(parameterText("showTicketPrice", "150.50")).toBe("150,50");
        expect(parameterText("venueCost", null)).toBe("");
        expect(toScenarioValues({participants: 45}).participants).toBe("45");
        expect(toScenarioValues({participants: 45}).venueCost).toBe("");
    });
});

describe("ScenarioPanel", () => {
    it("shows the budget's values as placeholders and its own result first", () => {
        render(<ScenarioPanel revivalId="1" current={current} scenarios={[]} canWrite={false}/>);

        expect(screen.getByLabelText("Budget.parameters.showTicketPrice")).toHaveAttribute("placeholder", "150");
        expect(screen.getByLabelText("Budget.parameters.participants")).toHaveAttribute("placeholder", "40");
        expect(screen.getByRole("region", {name: "Budget.budgetResult"})).toBeInTheDocument();
        expect(screen.queryByLabelText("Budget.scenarioName")).not.toBeInTheDocument();
    });

    it("calculates with only the changed parameters and shows the result", async () => {
        actions.calculateScenarioAction.mockResolvedValue({
            ok: true,
            data: {...current, result: "-5000", breakEvenShowTickets: 434}
        });
        render(<ScenarioPanel revivalId="1" current={current} scenarios={[]} canWrite={false}/>);

        await userEvent.type(screen.getByLabelText("Budget.parameters.showTickets"), "300");
        await userEvent.click(screen.getByRole("button", {name: "Budget.calculate"}));

        await waitFor(() => expect(actions.calculateScenarioAction).toHaveBeenCalledWith({
            revivalId: "1",
            values: expect.objectContaining({showTickets: "300", showTicketPrice: "", participants: ""}),
        }));
        const result = await screen.findByRole("region", {name: "Budget.scenarioResult"});

        expect(nbsp(result.textContent)).toContain("−5 000 kr");
        expect(result.textContent).toContain("434");
    });

    it("refuses a parameter that is not a number without asking the server", async () => {
        render(<ScenarioPanel revivalId="1" current={current} scenarios={[]} canWrite={false}/>);

        await userEvent.type(screen.getByLabelText("Budget.parameters.venueCost"), "mycket");
        await userEvent.click(screen.getByRole("button", {name: "Budget.calculate"}));

        expect(await screen.findByText("Validation.amountInvalid")).toBeInTheDocument();
        expect(actions.calculateScenarioAction).not.toHaveBeenCalled();
    });

    it("saves a named scenario and loads a saved one back", async () => {
        actions.saveScenarioAction.mockResolvedValue({ok: true, data: {id: "9"}});
        const saved = {
            id: "5",
            name: "Färre biljetter",
            parameters: {showTickets: 300},
            result: {...current, result: "-5000"},
            version: 0
        };

        render(<ScenarioPanel revivalId="1" current={current} scenarios={[saved]} canWrite/>);

        await userEvent.click(screen.getByRole("button", {name: /Budget.loadScenario.*Färre biljetter/}));
        expect(screen.getByLabelText("Budget.parameters.showTickets")).toHaveValue("300");
        expect(screen.getByLabelText("Budget.scenarioName")).toHaveValue("Färre biljetter");

        await userEvent.clear(screen.getByLabelText("Budget.scenarioName"));
        await userEvent.type(screen.getByLabelText("Budget.scenarioName"), "Kopia");
        await userEvent.click(screen.getByRole("button", {name: "Budget.saveScenario"}));

        await waitFor(() => expect(actions.saveScenarioAction).toHaveBeenCalledWith({
            revivalId: "1", name: "Kopia", values: expect.objectContaining({showTickets: "300"}),
        }));
    });
});
