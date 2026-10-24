import {beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {CommandPalette} from "@/components/command-palette.client";
import type {Role} from "@/types/auth";

const push = vi.fn();
vi.mock("next/navigation", () => ({
    useRouter: () => ({push, replace: vi.fn(), refresh: vi.fn()}),
    usePathname: () => "/",
}));

let roles: Role[] = ["USER", "SUPER_ADMIN"];
vi.mock("@/components/roles-provider.client", () => ({
    useRoles: () => roles,
}));

const openPalette = async () => {
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", {name: /CommandPalette.open/}));
    return user;
};

beforeEach(() => {
    push.mockClear();
    roles = ["USER", "SUPER_ADMIN"];
});

describe("CommandPalette", () => {
    it("renders a trigger button and opens the dialog on click", async () => {
        render(<CommandPalette guideReadable/>);
        expect(screen.queryByText("Nav.revivals")).not.toBeInTheDocument();

        await openPalette();

        expect(await screen.findByText("Nav.revivals")).toBeInTheDocument();
        expect(screen.getByText("Support.title")).toBeInTheDocument();
        expect(screen.getByText("About.title")).toBeInTheDocument();
    });

    it("offers the guide only to those who may read it", async () => {
        const {unmount} = render(<CommandPalette guideReadable/>);

        await openPalette();
        expect(await screen.findByText("Nav.guide")).toBeInTheDocument();
        unmount();

        render(<CommandPalette guideReadable={false}/>);
        await openPalette();
        expect(await screen.findByText("Nav.revivals")).toBeInTheDocument();
        expect(screen.queryByText("Nav.guide")).not.toBeInTheDocument();
    });

    it("opens on Ctrl/Cmd+K", async () => {
        render(<CommandPalette guideReadable/>);

        await userEvent.keyboard("{Control>}k{/Control}");

        expect(await screen.findByText("Nav.revivals")).toBeInTheDocument();
    });

    it("navigates to the selected entry and closes", async () => {
        render(<CommandPalette guideReadable/>);
        const user = await openPalette();

        await user.click(await screen.findByText("Support.title"));

        expect(push).toHaveBeenCalledWith("/support");
        await waitFor(() => expect(screen.queryByText("Nav.revivals")).not.toBeInTheDocument());
    });

    it("filters entries against the typed query", async () => {
        render(<CommandPalette guideReadable/>);
        const user = await openPalette();

        await user.type(screen.getByPlaceholderText("CommandPalette.placeholder"), "About.");

        expect(screen.getByText("About.title")).toBeInTheDocument();
        expect(screen.queryByText("Nav.revivals")).not.toBeInTheDocument();
    });

    it("shows an empty state when nothing matches", async () => {
        render(<CommandPalette guideReadable/>);
        const user = await openPalette();

        await user.type(screen.getByPlaceholderText("CommandPalette.placeholder"), "z");

        await waitFor(() => expect(screen.getByText("CommandPalette.empty")).toBeInTheDocument());
    });

    it("offers creating a revival to a super admin and opens the dialog on the admin page", async () => {
        render(<CommandPalette guideReadable/>);
        const user = await openPalette();

        await user.click(await screen.findByText("Admin.create"));

        expect(push).toHaveBeenCalledWith("/revivals/manage?create=1");
    });

    it("shows all revivals but no create action to an observer", async () => {
        roles = ["USER", "OBSERVER"];
        render(<CommandPalette guideReadable/>);
        await openPalette();

        expect(await screen.findByText("Nav.allRevivals")).toBeInTheDocument();
        expect(screen.queryByText("Admin.create")).not.toBeInTheDocument();
    });

    it("hides all revivals and the create action from a plain user", async () => {
        roles = ["USER"];
        render(<CommandPalette guideReadable/>);
        await openPalette();

        expect(await screen.findByText("Nav.revivals")).toBeInTheDocument();
        expect(screen.queryByText("Nav.allRevivals")).not.toBeInTheDocument();
        expect(screen.queryByText("Admin.create")).not.toBeInTheDocument();
    });

    it("offers the guide to every user and managing it to super admins only", async () => {
        const {unmount} = render(<CommandPalette guideReadable/>);
        const user = await openPalette();

        expect(await screen.findByText("Nav.adminChecklistTemplates")).toBeInTheDocument();
        expect(screen.getByText("Nav.adminEventTypes")).toBeInTheDocument();
        expect(screen.getByText("Nav.adminMailingTemplates")).toBeInTheDocument();
        expect(screen.getByText("Nav.adminBudgetCategories")).toBeInTheDocument();
        expect(screen.getByText("Nav.adminLinkServices")).toBeInTheDocument();
        expect(screen.getByText("Nav.adminReferenceFigures")).toBeInTheDocument();
        expect(screen.getByText("Nav.adminSpexCalendar")).toBeInTheDocument();
        await user.click(await screen.findByText("Nav.adminGuide"));
        expect(push).toHaveBeenCalledWith("/admin/guide");
        unmount();

        roles = ["USER"];
        render(<CommandPalette guideReadable/>);
        const plain = await openPalette();

        expect(screen.queryByText("Nav.adminGuide")).not.toBeInTheDocument();
        expect(screen.queryByText("Nav.adminChecklistTemplates")).not.toBeInTheDocument();
        expect(screen.queryByText("Nav.adminEventTypes")).not.toBeInTheDocument();
        expect(screen.queryByText("Nav.adminBudgetCategories")).not.toBeInTheDocument();
        expect(screen.queryByText("Nav.adminLinkServices")).not.toBeInTheDocument();
        expect(screen.queryByText("Nav.revivalTimeline")).not.toBeInTheDocument();
        await plain.click(await screen.findByText("Nav.guide"));
        expect(push).toHaveBeenCalledWith("/guide");
    });
});
