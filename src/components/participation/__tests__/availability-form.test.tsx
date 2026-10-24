import {describe, expect, it, vi} from "vitest";
import {render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {availabilityDefaults, AvailabilityForm} from "@/components/participation/availability-form.client";

const setAvailabilityAction = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({useRouter: () => ({refresh: vi.fn()})}));
vi.mock("@/app/(app)/revivals/[id]/me/actions.server", () => ({setAvailabilityAction}));
vi.mock("@/hooks/use-action-feedback", () => ({useActionFeedback: () => () => true}));

const event = {id: "7", title: "Rephelg 1", startDate: "2028-01-15", endDate: "2028-01-16", location: "Kårhuset"};
const answers = [{eventId: "7", date: "2028-01-16", answer: "MAYBE" as const, comment: "Dålig rygg"}, {
    eventId: "8",
    date: "2028-01-15",
    answer: "NO" as const
}];

describe("availabilityDefaults", () => {
    it("has a row per day of the event, with the answers given before for that event", () => {
        expect(availabilityDefaults(event, answers)).toEqual({
            days: [{date: "2028-01-15", answer: "", comment: ""}, {
                date: "2028-01-16",
                answer: "MAYBE",
                comment: "Dålig rygg"
            }],
        });
    });
});

describe("AvailabilityForm", () => {
    it("asks per day with native radio buttons and sends only the days that changed", async () => {
        setAvailabilityAction.mockResolvedValue({ok: true, data: null});
        render(<AvailabilityForm revivalId="1" event={event} answers={answers}/>);

        const saturday = screen.getByRole("group", {name: /SATURDAY 2028-01-15/});
        const sunday = screen.getByRole("group", {name: /SUNDAY 2028-01-16/});

        expect(within(sunday).getByRole("radio", {name: "Availability.answers.MAYBE"})).toBeChecked();
        expect(within(sunday).getByLabelText("Availability.comment")).toHaveValue("Dålig rygg");
        expect(within(saturday).queryByLabelText("Availability.comment")).not.toBeInTheDocument();

        await userEvent.click(within(saturday).getByRole("radio", {name: "Availability.answers.YES"}));
        await userEvent.type(within(saturday).getByLabelText("Availability.comment"), "Efter lunch");
        await userEvent.click(screen.getByRole("button", {name: "Availability.save"}));

        await waitFor(() => expect(setAvailabilityAction).toHaveBeenCalledWith({
            revivalId: "1", eventId: "7", values: {days: [{date: "2028-01-15", answer: "YES", comment: "Efter lunch"}]},
        }));
    });

    it("clears a day's answer", async () => {
        setAvailabilityAction.mockReset().mockResolvedValue({ok: true, data: null});
        render(<AvailabilityForm revivalId="1" event={event} answers={answers}/>);

        const sunday = screen.getByRole("group", {name: /SUNDAY 2028-01-16/});

        await userEvent.click(within(sunday).getByRole("button", {name: "Availability.clear"}));
        await userEvent.click(screen.getByRole("button", {name: "Availability.save"}));
        await waitFor(() => expect(setAvailabilityAction).toHaveBeenCalledWith({
            revivalId: "1", eventId: "7", values: {days: [{date: "2028-01-16", answer: "", comment: ""}]},
        }));
    });
});
