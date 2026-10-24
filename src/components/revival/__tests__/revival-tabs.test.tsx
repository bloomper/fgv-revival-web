import type {ReactNode} from "react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import {RevivalTabs} from "@/components/revival/revival-tabs.client";

let segment: string | null = null;
vi.mock("next/navigation", () => ({
    useSelectedLayoutSegment: () => segment,
}));
vi.mock("next/link", () => ({
    default: ({children, href, ...props}: { children?: ReactNode; href: string }) => <a
        href={href} {...props}>{children}</a>,
}));

const work = {openEntries: 3, overdueEntries: 1, openRequiredItems: 5, overdueChecklistItems: 0};

beforeEach(() => {
    segment = null;
});

describe("RevivalTabs", () => {
    it("links every section of the revival", () => {
        render(<RevivalTabs revivalId="7" work={null}/>);

        expect(screen.getByRole("link", {name: "overview"})).toHaveAttribute("href", "/revivals/7");
        expect(screen.getByRole("link", {name: "events"})).toHaveAttribute("href", "/revivals/7/events");
        expect(screen.getByRole("link", {name: "log"})).toHaveAttribute("href", "/revivals/7/log");
        expect(screen.getByRole("link", {name: "meetings"})).toHaveAttribute("href", "/revivals/7/meetings");
        expect(screen.getByRole("link", {name: "checklists"})).toHaveAttribute("href", "/revivals/7/checklists");
        expect(screen.getByRole("link", {name: "guide"})).toHaveAttribute("href", "/revivals/7/guide");
    });

    it("links the budget only for those who may read it", () => {
        const {unmount} = render(<RevivalTabs revivalId="7" work={null}/>);

        expect(screen.queryByRole("link", {name: "budget"})).not.toBeInTheDocument();
        unmount();
        render(<RevivalTabs revivalId="7" work={null} canReadBudget/>);
        expect(screen.getByRole("link", {name: "budget"})).toHaveAttribute("href", "/revivals/7/budget");
    });

    it("links the participants only for those who may read them", () => {
        const {unmount} = render(<RevivalTabs revivalId="7" work={null}/>);

        expect(screen.queryByRole("link", {name: "participants"})).not.toBeInTheDocument();
        unmount();
        render(<RevivalTabs revivalId="7" work={null} canReadParticipants/>);
        expect(screen.getByRole("link", {name: "participants"})).toHaveAttribute("href", "/revivals/7/participants");
    });

    it("links staffing and mailings only for those who may read them", () => {
        const {unmount} = render(<RevivalTabs revivalId="7" work={null}/>);

        expect(screen.queryByRole("link", {name: "staffing"})).not.toBeInTheDocument();
        expect(screen.queryByRole("link", {name: "mailings"})).not.toBeInTheDocument();
        unmount();
        render(<RevivalTabs revivalId="7" work={null} canReadStaffing canReadMailings/>);
        expect(screen.getByRole("link", {name: "staffing"})).toHaveAttribute("href", "/revivals/7/staffing");
        expect(screen.getByRole("link", {name: "mailings"})).toHaveAttribute("href", "/revivals/7/mailings");
    });

    it("links the materials only for those who may read them", () => {
        const {unmount} = render(<RevivalTabs revivalId="7" work={null}/>);

        expect(screen.queryByRole("link", {name: "materials"})).not.toBeInTheDocument();
        unmount();
        render(<RevivalTabs revivalId="7" work={null} canReadMaterials/>);
        expect(screen.getByRole("link", {name: "materials"})).toHaveAttribute("href", "/revivals/7/materials");
    });

    it("orders the tabs: the steering group, its work, the budget, the ensemble and the closing", () => {
        render(<RevivalTabs revivalId="7" work={null} canReadBudget canReadParticipants canReadStaffing canReadMailings
                            canReadMaterials/>);

        expect(screen.getAllByRole("link").map(link => link.textContent)).toEqual([
            "overview", "members", "events", "meetings", "log", "checklists", "guide",
            "budget", "participants", "staffing", "mailings", "materials", "closing",
        ]);
    });

    it("marks the overview current on the revival itself", () => {
        render(<RevivalTabs revivalId="7" work={null}/>);

        expect(screen.getByRole("link", {name: "overview"})).toHaveAttribute("aria-current", "page");
        expect(screen.getByRole("link", {name: "log"})).not.toHaveAttribute("aria-current");
    });

    it("marks the section current below it, also on a page inside the section", () => {
        segment = "meetings";
        render(<RevivalTabs revivalId="7" work={null}/>);

        expect(screen.getByRole("link", {name: "meetings"})).toHaveAttribute("aria-current", "page");
        expect(screen.getByRole("link", {name: "overview"})).not.toHaveAttribute("aria-current");
    });

    it("counts open and overdue work on the log and the checklists", () => {
        render(<RevivalTabs revivalId="7" work={work}/>);

        expect(screen.getByRole("link", {name: /^log ?openOverdue:\{"open":3,"overdue":1\}/})).toBeInTheDocument();
        expect(screen.getByRole("link", {name: /^checklists ?requirementsOverdue:\{"open":5,"overdue":0\}/})).toBeInTheDocument();
    });

    it("links the guide without naming its version", () => {
        render(<RevivalTabs revivalId="7" work={null}/>);

        expect(screen.getByRole("link", {name: "guide"})).toHaveAttribute("href", "/revivals/7/guide");
    });

    it("links Closing last, marked from CLOSING onwards", () => {
        const {unmount} = render(<RevivalTabs revivalId="7" work={null}/>);
        const links = screen.getAllByRole("link");

        expect(links.at(-1)).toHaveAttribute("href", "/revivals/7/closing");
        expect(screen.queryByTitle("closingNow")).not.toBeInTheDocument();
        unmount();
        render(<RevivalTabs revivalId="7" work={null} closingProminent/>);
        expect(screen.getByTitle("closingNow")).toBeInTheDocument();
    });
});
