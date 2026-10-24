import type {ReactNode} from "react";
import {describe, expect, it, vi} from "vitest";
import {render, screen, within} from "@testing-library/react";
import {MailingPlan, planEntryHref} from "@/components/mailing/mailing-plan";
import {filterMailings, type MailingRow} from "@/components/mailing/mailing-table.client";

vi.mock("next/navigation", () => ({useRouter: () => ({refresh: vi.fn(), push: vi.fn()})}));
vi.mock("next/link", () => ({
    default: ({children, href, ...props}: { children?: ReactNode; href: string }) => <a
        href={href} {...props}>{children}</a>,
}));

const template = (id: string, sv: string) => ({id, name: {sv, en: null}, audience: "EVENT_ATTENDEES" as const});
const rephelg = {id: "7", title: "Rephelg 1", startDate: "2028-01-15"};

describe("MailingPlan", () => {
    const entries = [
        {template: template("t1", "Allergier"), event: rephelg, dueDate: "2028-01-03", mailing: null, due: true},
        {
            template: template("t2", "Biljetter"),
            event: null,
            dueDate: "2028-02-01",
            mailing: {id: "m1", status: "SENT" as const, subject: "Biljetter", sentAt: "2028-02-01T10:00:00Z"},
            due: false
        },
    ];

    it("highlights what is due and drafts it from the template; a sent one links to its mailing", () => {
        render(<MailingPlan revivalId="1" entries={entries} canDraft/>);

        const [allergies, tickets] = screen.getAllByRole("listitem");

        expect(within(allergies).getByText("dueNow")).toBeInTheDocument();
        expect(within(allergies).getByRole("link", {name: /createDraftFor/})).toHaveAttribute("href", "/revivals/1/mailings/new?template=t1&event=7");
        expect(within(tickets).queryByRole("link", {name: /createDraftFor/})).not.toBeInTheDocument();
        expect(within(tickets).getByRole("link", {name: /openMailing/})).toHaveAttribute("href", "/revivals/1/mailings/m1");
        expect(within(tickets).getByText("forPremiere", {exact: false})).toBeInTheDocument();
    });

    it("offers no draft to those who may not draft", () => {
        render(<MailingPlan revivalId="1" entries={entries} canDraft={false}/>);
        expect(screen.queryByRole("link", {name: /createDraftFor/})).not.toBeInTheDocument();
    });

    it("links a premiere entry without an event", () => {
        expect(planEntryHref("1", {template: {id: "t2"}, event: null})).toBe("/revivals/1/mailings/new?template=t2");
    });
});

describe("filterMailings", () => {
    const row = (id: string, subject: string, status: MailingRow["status"]): MailingRow => ({
        id, subject, status, audience: {kind: "CONFIRMED"}, createdAt: "2028-01-01T10:00:00Z", recipients: [],
    });
    const rows = [row("1", "Allergier inför rephelgen", "SENT"), row("2", "Biljetter", "DRAFT")];
    const text = () => "Bekräftade";

    it("matches every word in the subject or audience, and the chosen statuses", () => {
        expect(filterMailings(rows, "allergier rephelgen", new Set(), text).map(found => found.id)).toEqual(["1"]);
        expect(filterMailings(rows, "bekräftade", new Set(["DRAFT"]), text).map(found => found.id)).toEqual(["2"]);
    });
});
