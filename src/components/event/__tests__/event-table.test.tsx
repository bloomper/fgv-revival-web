import type {ReactNode} from "react";
import {describe, expect, it, vi} from "vitest";
import {render, screen, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {EventProposals} from "@/components/event/event-proposals.client";
import {type EventRow, EventTable, filterEvents, NO_TYPE} from "@/components/event/event-table.client";

vi.mock("next/navigation", () => ({
    useRouter: () => ({push: vi.fn(), replace: vi.fn(), refresh: vi.fn()}),
    usePathname: () => "/revivals/1/events",
    useSearchParams: () => new URLSearchParams(),
}));
vi.mock("next/link", () => ({
    default: ({children, href, ...props}: { children?: ReactNode; href: string }) => <a href={href} {...props}>{children}</a>,
}));
vi.mock("@/app/(app)/revivals/[id]/events/actions.server", () => ({
    cancelEventAction: vi.fn(), restoreEventAction: vi.fn(), createEventAction: vi.fn(), updateEventAction: vi.fn(),
}));
vi.mock("@/hooks/use-action-feedback", () => ({useActionFeedback: () => () => true}));

const rephelg = {id: "3", name: {sv: "Rephelg 1", en: "Rehearsal weekend 1"}, days: 2, revivalPays: true, retired: false};
const proposal = {type: rephelg, startDate: "2028-01-01", endDate: "2028-01-02", earliest: "2027-12-25", latest: "2028-01-08"};
const events: EventRow[] = [
    {
        id: "1", version: 0, type: rephelg, title: "Rephelg 1", startDate: "2028-01-01", endDate: "2028-01-02", location: "Kemihuset",
        revivalPays: true, daysFromPremiere: -63, checklist: {id: "9", openCount: 3, totalCount: 4, cancelled: false}, cancelled: false,
    },
    {id: "2", version: 1, type: null, title: "Förrådsbesök", startDate: "2027-11-02", endDate: "2027-11-02", startTime: "18:00", revivalPays: false,
        daysFromPremiere: null, checklist: null, cancelled: true},
];

describe("EventProposals", () => {
    it("shows each proposal's type, dates and allowed range, and adds it", async () => {
        const onAdd = vi.fn();

        render(<EventProposals proposals={[proposal]} onAdd={onAdd}/>);

        expect(screen.getByText("Rephelg 1")).toBeInTheDocument();
        expect(screen.getByText("2028-01-01 – 2028-01-02")).toBeInTheDocument();
        expect(screen.getByText(/allowedRange.*2027-12-25.*2028-01-08/)).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", {name: /addProposal/}));
        expect(onAdd).toHaveBeenCalledWith(proposal);
    });

    it("renders nothing without proposals", () => {
        const {container} = render(<EventProposals proposals={[]} onAdd={vi.fn()}/>);

        expect(container).toBeEmptyDOMElement();
    });
});

describe("filterEvents", () => {
    it("matches every word and the chosen types", () => {
        expect(filterEvents(events, "kemi", new Set(), "sv").map(event => event.id)).toEqual(["1"]);
        expect(filterEvents(events, "2027-11", new Set(), "sv").map(event => event.id)).toEqual(["2"]);
        expect(filterEvents(events, "", new Set([NO_TYPE]), "sv").map(event => event.id)).toEqual(["2"]);
        expect(filterEvents(events, "", new Set(["3"]), "sv").map(event => event.id)).toEqual(["1"]);
    });
});

describe("EventTable", () => {
    it("shows dates, type, distance to the premiere, the checklist and cancelled events", () => {
        render(<EventTable revivalId="1" events={events} types={[rephelg]} proposals={[proposal]} canWrite showCancelled/>);

        const rows = screen.getAllByRole("row");
        const first = within(rows[1]);

        expect(first.getByText("2027-11-02 18:00")).toBeInTheDocument();
        expect(first.getByText("cancelledBadge")).toBeInTheDocument();
        const second = within(rows[2]);

        expect(second.getByText("2028-01-01 – 2028-01-02")).toBeInTheDocument();
        expect(second.getByText("Rephelg 1", {selector: "[data-slot=badge]"})).toBeInTheDocument();
        expect(second.getAllByText(/weeksBefore.*"weeks":9/).length).toBeGreaterThan(0);
        expect(second.getAllByRole("link", {name: /checklistLink.*"open":3,"total":4/})[0]).toHaveAttribute("href", "/revivals/1/checklists/9");
        expect(screen.getByRole("button", {name: "Event.new"})).toBeInTheDocument();
        expect(screen.getByText("proposals")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: /rowMenu.*Förrådsbesök/})).toBeInTheDocument();
    });

    it("shows readers no proposals, no new button and no row menus", () => {
        render(<EventTable revivalId="1" events={events} types={[rephelg]} proposals={[proposal]} canWrite={false} showCancelled={false}/>);

        expect(screen.queryByRole("button", {name: "Event.new"})).not.toBeInTheDocument();
        expect(screen.queryByText("proposals")).not.toBeInTheDocument();
        expect(screen.queryByRole("button", {name: /rowMenu/})).not.toBeInTheDocument();
    });
});
