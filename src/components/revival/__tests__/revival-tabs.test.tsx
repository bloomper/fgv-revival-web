import type {ReactNode} from "react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import {RevivalTabs} from "@/components/revival/revival-tabs.client";

let segment: string | null = null;
vi.mock("next/navigation", () => ({
    useSelectedLayoutSegment: () => segment,
}));
vi.mock("next/link", () => ({
    default: ({children, href, ...props}: { children?: ReactNode; href: string }) => <a href={href} {...props}>{children}</a>,
}));

const work = {openEntries: 3, overdueEntries: 1, openRequiredItems: 5, overdueChecklistItems: 0};

beforeEach(() => {
    segment = null;
});

describe("RevivalTabs", () => {
    it("links every section of the revival", () => {
        render(<RevivalTabs revivalId="7" work={null}/>);

        expect(screen.getByRole("link", {name: "overview"})).toHaveAttribute("href", "/revivals/7");
        expect(screen.getByRole("link", {name: "log"})).toHaveAttribute("href", "/revivals/7/log");
        expect(screen.getByRole("link", {name: "meetings"})).toHaveAttribute("href", "/revivals/7/meetings");
        expect(screen.getByRole("link", {name: "checklists"})).toHaveAttribute("href", "/revivals/7/checklists");
        expect(screen.getByRole("link", {name: "guide"})).toHaveAttribute("href", "/revivals/7/guide");
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
});
