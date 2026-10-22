import {describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen, within} from "@testing-library/react";
import {type GuideVersion, GuideVersionTable} from "@/components/guide/admin/guide-version-table.client";

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Record<string, unknown>) => values ? `${key}:${JSON.stringify(values)}` : key,
    useFormatter: () => ({dateTime: (date: Date) => date.toISOString().slice(0, 10)}),
}));
vi.mock("next/navigation", () => ({useRouter: () => ({push: vi.fn(), refresh: vi.fn()})}));
vi.mock("@/app/(app)/admin/guide/actions.server", () => ({
    deleteGuideVersionAction: vi.fn(),
}));

const version = (overrides: Partial<GuideVersion>): GuideVersion => ({
    id: "1", label: "v1", note: null, publishedAt: "2026-01-10T10:00:00Z", publishedBy: "Testa Testsson",
    revivalCount: 0, suggestionCount: 0, deletable: true, version: 0, ...overrides,
});

const versions = [
    version({id: "1", label: "v1", note: "Första versionen"}),
    version({id: "2", label: "v2", publishedAt: "2026-03-01T10:00:00Z", revivalCount: 3, deletable: false}),
];

describe("GuideVersionTable", () => {
    it("lists the versions newest first with how many revivals follow each", () => {
        render(<GuideVersionTable versions={versions}/>);

        const rows = screen.getAllByRole("row").slice(1).map(row => within(row).getAllByRole("cell").map(cell => cell.textContent));

        expect(rows.map(cells => [cells[0], cells[3]])).toEqual([["v2", "3"], ["v1", "0"]]);
        expect(screen.queryByRole("link", {name: "v1"})).not.toBeInTheDocument();
    });

    it("opens a read-only view of the version from its row", () => {
        render(<GuideVersionTable versions={versions}/>);

        fireEvent.click(screen.getByText("v1"));

        const dialog = screen.getByRole("dialog");

        expect(within(dialog).getAllByText("Första versionen").length).toBeGreaterThan(0);
        expect(within(dialog).getByText("Testa Testsson")).toBeInTheDocument();
        expect(within(dialog).queryByRole("link")).not.toBeInTheDocument();
        expect(within(dialog).queryByRole("textbox")).not.toBeInTheDocument();
    });

    it("views the whole version from the menu and greys out deleting one in use, saying why", async () => {
        render(<GuideVersionTable versions={versions}/>);

        fireEvent.click(screen.getByRole("button", {name: /Admin.openMenu.*v2/}));

        const remove = await screen.findByRole("menuitem", {name: /Guide.admin.delete/});

        expect(screen.getByRole("menuitem", {name: "Guide.admin.view"})).toHaveAttribute("href", "/guide?version=2");

        expect(remove).toHaveAttribute("aria-disabled", "true");
        expect(remove).toHaveTextContent(/inUseRevivals.*"count":3/);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
});
