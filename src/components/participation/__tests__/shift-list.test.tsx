import {describe, expect, it, vi} from "vitest";
import {render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {ShiftList} from "@/components/participation/shift-list.client";
import {scheduleEntries} from "@/components/participation/schedule";
import type {ShiftSlotFieldsFragment} from "@/gql/graphql";

const signUpForShiftAction = vi.hoisted(() => vi.fn());
const withdrawFromShiftAction = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({useRouter: () => ({refresh: vi.fn()})}));
vi.mock("@/app/(app)/revivals/[id]/me/actions.server", () => ({signUpForShiftAction, withdrawFromShiftAction}));
vi.mock("@/hooks/use-action-feedback", () => ({useActionFeedback: () => () => true}));

const event = {
    id: "7",
    title: "Föreställningshelg",
    startDate: "2028-03-04",
    endDate: "2028-03-05",
    location: "Kårhuset"
};
const slot = (id: string, values: Partial<ShiftSlotFieldsFragment> = {}): ShiftSlotFieldsFragment => ({
    id,
    event,
    date: "2028-03-04",
    startTime: "18:00",
    endTime: "19:30",
    task: "Biljettkontroll",
    needed: 2,
    comment: null,
    assigned: [],
    open: 2,
    version: 0, ...values,
});
const me = (selfSignedUp: boolean) => ({
    participant: {
        id: "p1",
        displayName: "Disa Deltagare",
        kind: "PARTICIPANT" as const,
        position: null
    }, selfSignedUp
});

describe("ShiftList", () => {
    it("signs up for an open shift with a large, named button", async () => {
        signUpForShiftAction.mockResolvedValue({ok: true, data: null});
        render(<ShiftList revivalId="1" participantId="p1" slots={[slot("s1")]} mode="open"/>);

        const button = screen.getByRole("button", {name: /signUpFor/});

        expect(button).toHaveClass("h-11");
        await userEvent.click(button);
        await waitFor(() => expect(signUpForShiftAction).toHaveBeenCalledWith({revivalId: "1", slotId: "s1"}));
    });

    it("offers to leave only the shifts one took oneself", () => {
        render(<ShiftList revivalId="1" participantId="p1" mode="mine"
                          slots={[slot("own", {assigned: [me(true)]}), slot("given", {
                              startTime: "20:00",
                              endTime: "21:00",
                              task: "Bar",
                              assigned: [me(false)]
                          })]}/>);

        const [own, given] = screen.getAllByRole("listitem");

        expect(within(own).getByRole("button", {name: /withdrawFrom/})).toBeInTheDocument();
        expect(within(given).queryByRole("button")).not.toBeInTheDocument();
        expect(within(given).getByText("assignedByGroup")).toBeInTheDocument();
    });

    it("says when there is nothing to show", () => {
        render(<ShiftList revivalId="1" participantId="p1" slots={[]} mode="open"/>);
        expect(screen.getByText("noneOpen")).toBeInTheDocument();
    });
});

describe("scheduleEntries", () => {
    it("puts events and shows in date order, each event with the caller's shifts in it", () => {
        const entries = scheduleEntries(
            [event, {id: "8", title: "Rephelg 1", startDate: "2028-01-15", endDate: "2028-01-16"}],
            [{date: "2028-03-04", time: "19:00", venue: "Kårhuset"}],
            [slot("s2", {startTime: "20:00"}), slot("s1")],
        );

        expect(entries.map(entry => entry.key)).toEqual(["event-8", "event-7", "show-0"]);
        expect(entries[1].kind === "event" && entries[1].shifts.map(shift => shift.id)).toEqual(["s1", "s2"]);
    });
});
