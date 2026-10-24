import {describe, expect, it, vi} from "vitest";
import {render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {StaffingBoard} from "@/components/staffing/staffing-board.client";
import {AvailabilityMatrix} from "@/components/staffing/availability-matrix";
import type {ShiftSlotFieldsFragment} from "@/gql/graphql";

const actions = vi.hoisted(() => ({
    assignShiftAction: vi.fn(), unassignShiftAction: vi.fn(), createShiftSlotAction: vi.fn(), updateShiftSlotAction: vi.fn(), removeShiftSlotAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({useRouter: () => ({refresh: vi.fn()})}));
vi.mock("@/app/(app)/revivals/[id]/staffing/actions.server", () => actions);
vi.mock("@/hooks/use-action-feedback", () => ({useActionFeedback: () => () => true}));

const event = {id: "7", title: "Föreställningshelg", startDate: "2028-03-04", endDate: "2028-03-05", location: "Kårhuset"};
const ref = (id: string, displayName: string) => ({id, displayName, kind: "PARTICIPANT" as const, position: null});
const slot: ShiftSlotFieldsFragment = {
    id: "s1", event, date: "2028-03-04", startTime: "18:00", endTime: "19:30", task: "Biljettkontroll", needed: 2, comment: null,
    assigned: [{participant: ref("p1", "Anna Andersson"), selfSignedUp: true}], open: 1, version: 0,
};
const availability = [
    {participant: ref("p2", "Bertil Bengtsson"), days: [{eventId: "7", date: "2028-03-04", answer: "NO" as const, comment: "Bortrest"}]},
    {participant: ref("p3", "Cia Carlsson"), days: [{eventId: "7", date: "2028-03-04", answer: "YES" as const}]},
];
const people = [
    {id: "p1", name: "Anna Andersson", kind: "PARTICIPANT" as const},
    {id: "p2", name: "Bertil Bengtsson", kind: "PARTICIPANT" as const},
    {id: "p3", name: "Cia Carlsson", kind: "PARTICIPANT" as const},
    {id: "p4", name: "Agda Ek", kind: "HELPER" as const},
];

describe("StaffingBoard", () => {
    it("shows each day with its slots, how full they are and who holds them", () => {
        render(<StaffingBoard revivalId="1" event={event} slots={[slot]} availability={availability} people={people} peopleUnavailable={false} canWrite={false}/>);

        const saturday = screen.getByRole("region", {name: /SATURDAY 2028-03-04/});

        expect(within(saturday).getByText("Biljettkontroll")).toBeInTheDocument();
        expect(within(saturday).getByText(/filled/)).toHaveTextContent('filled:{"assigned":1,"needed":2}');
        expect(within(saturday).getByText("Anna Andersson")).toBeInTheDocument();
        expect(screen.getByRole("region", {name: /SUNDAY 2028-03-05/})).toHaveTextContent("noSlots");
        expect(screen.queryByRole("button", {name: /addSlot/})).not.toBeInTheDocument();
        expect(screen.getByRole("link", {name: /printSchedule/})).toHaveAttribute("href", "/revivals/1/staffing/print?event=7");
    });

    it("offers the people for a slot with their answer for the day, yes first and no last, and assigns", async () => {
        actions.assignShiftAction.mockResolvedValue({ok: true, data: null});
        render(<StaffingBoard revivalId="1" event={event} slots={[slot]} availability={availability} people={people} peopleUnavailable={false} canWrite/>);

        await userEvent.click(screen.getByRole("button", {name: /assignTo/}));
        const options = await screen.findAllByRole("option");

        expect(options.map(option => option.textContent)).toEqual([
            expect.stringContaining("Cia Carlsson"), expect.stringContaining("Agda Ek"), expect.stringContaining("Bertil Bengtsson"),
        ]);
        expect(options[2]).toHaveTextContent("Bortrest");
        expect(options[2]).toHaveClass("text-muted-foreground");
        await userEvent.click(options[0]);
        await waitFor(() => expect(actions.assignShiftAction).toHaveBeenCalledWith({revivalId: "1", slotId: "s1", participantId: "p3"}));
    });

    it("unassigns from the chip and keeps slots that hold someone from being removed", async () => {
        actions.unassignShiftAction.mockResolvedValue({ok: true, data: null});
        render(<StaffingBoard revivalId="1" event={event} slots={[slot]} availability={[]} people={people} peopleUnavailable={false} canWrite/>);

        await userEvent.click(screen.getByRole("button", {name: /unassign/}));
        await waitFor(() => expect(actions.unassignShiftAction).toHaveBeenCalledWith({revivalId: "1", slotId: "s1", participantId: "p1"}));
    });
});

describe("AvailabilityMatrix", () => {
    it("has a row per person who answered and a column per day, with the comments", () => {
        render(<AvailabilityMatrix event={event} availability={availability}/>);

        const table = screen.getByRole("table");

        expect(within(table).getAllByRole("columnheader").map(header => header.textContent)).toEqual(["Staffing.person", "2028-03-04", "2028-03-05"]);
        const bertil = within(table).getByRole("row", {name: /Bertil Bengtsson/});

        expect(bertil).toHaveTextContent("Availability.answers.NO");
        expect(bertil).toHaveTextContent("Bortrest");
        expect(bertil).toHaveTextContent("Staffing.noAnswer");
    });
});
