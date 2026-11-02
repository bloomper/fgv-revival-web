import {beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {filterMeetings, MEETING_STATUSES, MeetingTable, type MeetingRow} from "@/components/meeting/meeting-table.client";
import {router} from "../../../../test/next-navigation";

vi.mock("next/navigation", async () => (await import("../../../../test/next-navigation")).navigation);

const meetings: MeetingRow[] = [
    {id: "m1", date: "2026-02-01", title: "Styrgruppsmöte", status: "CLOSED"},
    {id: "m2", date: "2026-03-01", title: null, status: "PLANNED"},
];

beforeEach(() => {
    vi.clearAllMocks();
});

describe("filterMeetings", () => {
    it("matches the title, or the untitled label, and the date within the chosen statuses", () => {
        const all = new Set(MEETING_STATUSES);

        expect(filterMeetings(meetings, "styrgrupp", all, "Möte").map(m => m.id)).toEqual(["m1"]);
        expect(filterMeetings(meetings, "möte 2026-03", all, "Möte").map(m => m.id)).toEqual(["m2"]);
        expect(filterMeetings(meetings, "", new Set(["PLANNED"]), "Möte").map(m => m.id)).toEqual(["m2"]);
    });
});

describe("MeetingTable", () => {
    it("lists the meetings and opens one", async () => {
        render(<MeetingTable revivalId="r1" meetings={meetings}/>);

        expect(screen.getByText("Meeting.untitled")).toBeInTheDocument();
        await userEvent.click(screen.getByText("Styrgruppsmöte"));

        expect(router.push).toHaveBeenCalledWith("/revivals/r1/meetings/m1");
    });

    it("searches and clears the search", async () => {
        render(<MeetingTable revivalId="r1" meetings={meetings} actions={<button>extra</button>}/>);

        expect(screen.getByRole("button", {name: "extra"})).toBeInTheDocument();
        await userEvent.type(screen.getByRole("textbox", {name: "Common.search"}), "styrgrupp");
        expect(screen.queryByText("Meeting.untitled")).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", {name: "Common.clearSearch"}));
        expect(screen.getByText("Meeting.untitled")).toBeInTheDocument();
    });

    it("says when there are no meetings", () => {
        render(<MeetingTable revivalId="r1" meetings={[]}/>);

        expect(screen.getByText("Meeting.empty")).toBeInTheDocument();
    });
});
