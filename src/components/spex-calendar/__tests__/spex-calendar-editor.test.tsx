import {beforeEach, describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {SpexCalendarEditor} from "@/components/spex-calendar/spex-calendar-editor.client";
import * as actions from "@/app/(app)/admin/spex-calendar/actions.server";
import {toast} from "sonner";

vi.mock("next/navigation", async () => (await import("@/test/next-navigation")).navigation);
vi.mock("@/app/(app)/admin/spex-calendar/actions.server", () => ({
    createSpexCalendarDateAction: vi.fn(),
    updateSpexCalendarDateAction: vi.fn(),
    deleteSpexCalendarDateAction: vi.fn(),
}));
vi.mock("sonner", () => ({toast: {success: vi.fn(), error: vi.fn()}}));

const dates = [
    {id: "d1", date: "2026-05-01", label: "Premiär", version: 1},
    {id: "d2", date: "2026-05-10", label: "Sista föreställning", version: 2},
];

beforeEach(() => {
    vi.clearAllMocks();
    for (const action of [actions.createSpexCalendarDateAction, actions.updateSpexCalendarDateAction, actions.deleteSpexCalendarDateAction]) {
        vi.mocked(action).mockResolvedValue({ok: true, data: null} as never);
    }
});

describe("SpexCalendarEditor", () => {
    it("lists the dates or says there are none", () => {
        const {unmount} = render(<SpexCalendarEditor dates={dates}/>);

        expect(within(screen.getByRole("list", {name: "SpexCalendar.title"})).getByText("Premiär")).toBeInTheDocument();
        unmount();

        render(<SpexCalendarEditor dates={[]}/>);
        expect(screen.getByText("SpexCalendar.empty")).toBeInTheDocument();
    });

    it("adds a date", async () => {
        render(<SpexCalendarEditor dates={dates}/>);

        await userEvent.click(screen.getByRole("button", {name: /SpexCalendar.create/}));
        const dialog = await screen.findByRole("dialog");

        fireEvent.change(within(dialog).getByLabelText("SpexCalendar.date"), {target: {value: "2026-06-01"}});
        await userEvent.type(within(dialog).getByLabelText("SpexCalendar.label"), "Kalas");
        await userEvent.click(within(dialog).getByRole("button", {name: "Common.save"}));

        await waitFor(() => expect(actions.createSpexCalendarDateAction).toHaveBeenCalledWith({values: {date: "2026-06-01", label: "Kalas"}}));
        expect(toast.success).toHaveBeenCalledWith("Common.saved");
    });

    it("needs a date and a label", async () => {
        render(<SpexCalendarEditor dates={dates}/>);

        await userEvent.click(screen.getByRole("button", {name: /SpexCalendar.create/}));
        await userEvent.click(within(await screen.findByRole("dialog")).getByRole("button", {name: "Common.save"}));

        expect(await screen.findByText("Validation.dateInvalid")).toBeInTheDocument();
        expect(screen.getByText("Validation.spexDateLabelRequired")).toBeInTheDocument();
        expect(actions.createSpexCalendarDateAction).not.toHaveBeenCalled();
    });

    it("edits and deletes a date", async () => {
        render(<SpexCalendarEditor dates={dates}/>);

        await userEvent.click(screen.getByRole("button", {name: `SpexCalendar.edit:${JSON.stringify({label: "Premiär"})}`}));
        const dialog = await screen.findByRole("dialog");

        await userEvent.clear(within(dialog).getByLabelText("SpexCalendar.label"));
        await userEvent.type(within(dialog).getByLabelText("SpexCalendar.label"), "Urpremiär");
        await userEvent.click(within(dialog).getByRole("button", {name: "Common.save"}));
        await waitFor(() => expect(actions.updateSpexCalendarDateAction).toHaveBeenCalledWith({
            id: "d1", version: 1, values: {date: "2026-05-01", label: "Urpremiär"},
        }));

        await userEvent.click(screen.getByRole("button", {name: `SpexCalendar.delete:${JSON.stringify({label: "Sista föreställning"})}`}));
        await waitFor(() => expect(actions.deleteSpexCalendarDateAction).toHaveBeenCalledWith({id: "d2", version: 2}));
    });
});
