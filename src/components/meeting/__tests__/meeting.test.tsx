import {describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen} from "@testing-library/react";
import {MinutesView} from "@/components/meeting/minutes-view";
import {MeetingCloseDialog} from "@/components/meeting/meeting-close-dialog.client";
import type {MinutesRowFieldsFragment} from "@/gql/graphql";

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Record<string, unknown>) => values ? `${key} ${JSON.stringify(values)}` : key,
}));
vi.mock("@/app/(app)/revivals/[id]/meetings/actions.server", () => ({closeMeetingAction: vi.fn()}));
vi.mock("@/hooks/use-action-feedback", () => ({useActionFeedback: () => () => true}));

const row = (number: number, type: "DECISION" | "TODO" | "QUESTION", text: string, owner: MinutesRowFieldsFragment["owner"] = null,
             deadline: string | null = null): MinutesRowFieldsFragment => ({
    entryId: String(number), number, type, text, owner, deadline, status: "OPEN",
});

describe("MinutesView", () => {
    it("shows each section with owners as text and leaves empty ones out", () => {
        render(<MinutesView minutes={{
            decisions: [row(7, "DECISION", "Vi spelar i RunAn", {name: null, person: {id: "11", displayName: "Kim Svensson", active: true}})],
            todos: [row(8, "TODO", "Skicka offert", {name: "Sam", person: null}, "2026-11-01")],
            questions: [],
            closed: [],
            agendaPoints: ["Budget"],
            attendees: [{id: "11", displayName: "Kim Svensson"}],
            othersPresent: "Sam från lokalen",
            recorder: {displayName: "Kim Svensson"},
        }}/>);

        expect(screen.getByText("Vi spelar i RunAn")).toBeInTheDocument();
        expect(screen.getByText("Sam")).toBeInTheDocument();
        expect(screen.getByText("notMember")).toBeInTheDocument();
        expect(screen.getByText("Kim Svensson; Sam från lokalen")).toBeInTheDocument();
        expect(screen.queryByText("questions")).toBeNull();
        expect(screen.queryByText("closedRows")).toBeNull();
    });

    it("says when nothing happened", () => {
        render(<MinutesView minutes={{decisions: [], todos: [], questions: [], closed: [], agendaPoints: [], attendees: []}}/>);

        expect(screen.getByText("emptyMinutes")).toBeInTheDocument();
    });
});

describe("MeetingCloseDialog", () => {
    it("lists the unowned to-dos, opens one to assign it, and does not let the meeting close", () => {
        const openRow = vi.fn();

        render(<MeetingCloseDialog revivalId="1" meeting={{id: "5", version: 1}} blocking={[{id: "a", number: 4}, {id: "b", number: 9}]}
                                  onOpenRow={openRow}/>);
        fireEvent.click(screen.getByRole("button", {name: "Meeting.close"}));

        expect(screen.getByText('Meeting.blockingRow {"number":4}')).toBeInTheDocument();
        expect(screen.getByText('Meeting.blockingRow {"number":9}')).toBeInTheDocument();
        expect(screen.getAllByRole("button", {name: "Meeting.close"}).at(-1)).toBeDisabled();

        fireEvent.click(screen.getByRole("button", {name: 'Meeting.blockingRow {"number":9}'}));
        expect(openRow).toHaveBeenCalledWith("b");
    });

    it("lets the meeting close when every to-do has an owner", () => {
        render(<MeetingCloseDialog revivalId="1" meeting={{id: "5", version: 1}} blocking={[]} onOpenRow={() => undefined}/>);
        fireEvent.click(screen.getByRole("button", {name: "Meeting.close"}));

        expect(screen.getAllByRole("button", {name: "Meeting.close"}).at(-1)).toBeEnabled();
    });
});
