import {beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {EventTypeEditor, type EventTypeRow, OffsetHint} from "@/components/event/event-type-editor.client";
import * as actions from "@/app/(app)/admin/event-types/actions.server";

vi.mock("next/navigation", async () => (await import("@/test/next-navigation")).navigation);
vi.mock("@/app/(app)/admin/event-types/actions.server", () => ({
    createEventTypeAction: vi.fn(),
    updateEventTypeAction: vi.fn(),
    moveEventTypeAction: vi.fn(),
    retireEventTypeAction: vi.fn(),
    restoreEventTypeAction: vi.fn(),
    createEventTypeBudgetLineAction: vi.fn(),
    updateEventTypeBudgetLineAction: vi.fn(),
    removeEventTypeBudgetLineAction: vi.fn(),
}));
vi.mock("sonner", () => ({toast: {success: vi.fn(), error: vi.fn()}}));

const food = {id: "FOOD", kind: "COST", name: {sv: "Mat", en: "Food"}, retired: false};
const types = [
    {
        id: "t1", name: {sv: "Kalas", en: "Party"}, days: 1, revivalPays: true, position: 0, retired: false, version: 1,
        checklistTemplate: {id: "c1", name: {sv: "Kalaslista", en: "Party list"}, retired: false},
        budgetLines: [{id: "b1", category: food, description: {sv: "Middag", en: "Dinner"}, quantityRule: "PER_PARTICIPANT", unitAmount: "-300.00", version: 1}],
    },
    {id: "t2", name: {sv: "Repetition", en: "Rehearsal"}, days: 2, revivalPays: false, position: 1, retired: true, version: 3, budgetLines: []},
] as unknown as EventTypeRow[];
const templates = [{id: "c1", name: {sv: "Kalaslista", en: "Party list"}, retired: false}];

beforeEach(() => {
    vi.clearAllMocks();
    for (const action of Object.values(actions)) {
        vi.mocked(action).mockResolvedValue({ok: true, data: null} as never);
    }
});

describe("OffsetHint", () => {
    it("says when an event usually happens", () => {
        const {container, rerender} = render(<OffsetHint min={-30} max={-7}/>);

        expect(container.textContent).not.toBe("offsetNone");
        rerender(<OffsetHint min={null} max={null}/>);
        expect(container.textContent).toBe("offsetNone");
    });
});

describe("EventTypeEditor", () => {
    it("lists the types with what they bring", () => {
        render(<EventTypeEditor types={types} templates={templates} categories={[food] as never}/>);

        const list = screen.getByRole("list", {name: "EventType.title"});

        expect(within(list).getByText("Kalas")).toBeInTheDocument();
        expect(within(list).getByText("Catalog.retired")).toBeInTheDocument();
        expect(within(list).getByText(/Middag/)).toBeInTheDocument();
    });

    it("moves, retires and restores types", async () => {
        render(<EventTypeEditor types={types} templates={templates}/>);

        expect(screen.getByRole("button", {name: `Catalog.moveUp:${JSON.stringify({name: "Kalas"})}`})).toBeDisabled();
        await userEvent.click(screen.getByRole("button", {name: `Catalog.moveDown:${JSON.stringify({name: "Kalas"})}`}));
        await waitFor(() => expect(actions.moveEventTypeAction).toHaveBeenCalledWith({id: "t1", version: 1, position: 1}));

        await userEvent.click(screen.getByRole("button", {name: `Catalog.retire:${JSON.stringify({name: "Kalas"})}`}));
        await waitFor(() => expect(actions.retireEventTypeAction).toHaveBeenCalledWith(expect.objectContaining({id: "t1"})));

        await userEvent.click(screen.getByRole("button", {name: `Catalog.restore:${JSON.stringify({name: "Repetition"})}`}));
        await waitFor(() => expect(actions.restoreEventTypeAction).toHaveBeenCalledWith(expect.objectContaining({id: "t2"})));
    });

    it("creates a type", async () => {
        render(<EventTypeEditor types={[]} templates={templates}/>);

        expect(screen.getByText("Catalog.empty")).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", {name: /EventType.create/}));
        const sheet = await screen.findByRole("dialog");

        await userEvent.type(within(sheet).getByLabelText("Catalog.nameSv"), "Fotografering");
        await userEvent.click(within(sheet).getByRole("button", {name: "Common.save"}));

        await waitFor(() => expect(actions.createEventTypeAction).toHaveBeenCalledWith({
            values: expect.objectContaining({name: expect.objectContaining({sv: "Fotografering"})}),
        }));
    });

    it("edits a type", async () => {
        render(<EventTypeEditor types={types} templates={templates}/>);

        await userEvent.click(screen.getByRole("button", {name: `EventType.edit:${JSON.stringify({name: "Kalas"})}`}));
        const sheet = await screen.findByRole("dialog");

        expect(within(sheet).getByLabelText("Catalog.nameSv")).toHaveValue("Kalas");
        await userEvent.click(within(sheet).getByRole("button", {name: "Common.save"}));

        await waitFor(() => expect(actions.updateEventTypeAction).toHaveBeenCalledWith(expect.objectContaining({id: "t1", version: 1})));
    });

    it("adds and removes the budget lines a type proposes", async () => {
        render(<EventTypeEditor types={types} templates={templates} categories={[food] as never}/>);

        await userEvent.click(screen.getByRole("button", {name: `EventType.removeBudgetLine:${JSON.stringify({name: "Middag"})}`}));
        await waitFor(() => expect(actions.removeEventTypeBudgetLineAction).toHaveBeenCalledWith(expect.objectContaining({id: "b1"})));

        await userEvent.click(screen.getByRole("button", {name: `EventType.addBudgetLineTo:${JSON.stringify({name: "Kalas"})}`}));
        const sheet = await screen.findByRole("dialog");

        await userEvent.selectOptions(within(sheet).getByLabelText("Budget.category"), "FOOD");
        await userEvent.type(within(sheet).getByLabelText("EventType.budgetLineSv"), "Lokalhyra");
        await userEvent.selectOptions(within(sheet).getByLabelText("EventType.quantityRule"), "FIXED");
        await userEvent.type(within(sheet).getByLabelText("Budget.quantity"), "2");
        await userEvent.type(within(sheet).getByLabelText("Budget.unitAmount"), "1000");
        await userEvent.click(within(sheet).getByRole("button", {name: "Common.save"}));

        await waitFor(() => expect(actions.createEventTypeBudgetLineAction).toHaveBeenCalledWith(expect.objectContaining({eventTypeId: "t1"})));
    });
});
