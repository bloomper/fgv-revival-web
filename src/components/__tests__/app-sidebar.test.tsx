import type {ReactNode} from "react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import {AppSidebar} from "@/components/app-sidebar.client";
import {SidebarProvider} from "@/components/ui/sidebar";
import {TooltipProvider} from "@/components/ui/tooltip";
import type {Role} from "@/types/auth";

let pathname = "/";
vi.mock("next/navigation", () => ({
    usePathname: () => pathname,
}));
vi.mock("next/link", () => ({
    default: ({children, href, ...rest}: { children?: ReactNode; href: string }) => <a href={href} {...rest}>{children}</a>,
}));
vi.mock("@/hooks/use-is-client.client", () => ({
    useIsClient: () => true,
}));
vi.mock("@/components/nav-user.client", () => ({
    NavUser: () => null,
}));

const sidebar = (roles: Role[], guideReadable = true) => render(
    <TooltipProvider>
        <SidebarProvider>
            <AppSidebar roles={roles} accountUrl="https://auth.example.org/account" guideReadable={guideReadable}/>
        </SidebarProvider>
    </TooltipProvider>,
);

beforeEach(() => {
    pathname = "/";
});

describe("AppSidebar", () => {
    it("links the home page for every user", () => {
        sidebar(["USER"]);

        expect(screen.getByRole("link", {name: "Nav.home"})).toHaveAttribute("href", "/");
    });

    it("links revivals for every user, and managing them only to those who read all revivals", () => {
        pathname = "/revivals/manage";
        sidebar(["USER", "OBSERVER"]);

        expect(screen.getByRole("link", {name: "Nav.revivals"})).toHaveAttribute("href", "/revivals");
        expect(screen.getByRole("link", {name: "Nav.manage"})).toHaveAttribute("href", "/revivals/manage");
    });

    it("offers no manage entry to a plain user", () => {
        sidebar(["USER"]);

        expect(screen.getByRole("link", {name: "Nav.revivals"})).toHaveAttribute("href", "/revivals");
        expect(screen.queryByRole("link", {name: "Nav.manage"})).not.toBeInTheDocument();
        expect(screen.queryByRole("button", {name: /Common.toggle/})).not.toBeInTheDocument();
    });

    it("offers no guide entry to those who may not read the guide", () => {
        sidebar(["USER"], false);

        expect(screen.queryByRole("link", {name: "Nav.guide"})).not.toBeInTheDocument();
    });

    it("links the guide for its readers, and administration for super admins", () => {
        pathname = "/admin/guide";
        sidebar(["USER", "SUPER_ADMIN"]);

        expect(screen.getByRole("link", {name: "Nav.guide"})).toHaveAttribute("href", "/guide");
        expect(screen.getByRole("link", {name: "Nav.admin"})).toHaveAttribute("href", "/admin/guide");
        expect(screen.getByRole("link", {name: "Nav.adminGuideShort"})).toHaveAttribute("href", "/admin/guide");
        expect(screen.getByRole("link", {name: "Nav.adminChecklistTemplates"})).toHaveAttribute("href", "/admin/checklist-templates");
        expect(screen.getByRole("link", {name: "Nav.adminEventTypes"})).toHaveAttribute("href", "/admin/event-types");
        expect(screen.getByRole("link", {name: "Nav.adminMailingTemplates"})).toHaveAttribute("href", "/admin/mailing-templates");
        expect(screen.getByRole("link", {name: "Nav.adminBudgetCategories"})).toHaveAttribute("href", "/admin/budget-categories");
        expect(screen.getByRole("link", {name: "Nav.adminLinkServices"})).toHaveAttribute("href", "/admin/link-services");
        expect(screen.getByRole("link", {name: "Nav.adminReferenceFigures"})).toHaveAttribute("href", "/admin/reference-figures");
        expect(screen.getByRole("link", {name: "Nav.adminSpexCalendar"})).toHaveAttribute("href", "/admin/spex-calendar");
    });

    it("keeps the guide administration entry highlighted on the pages beneath it", () => {
        pathname = "/admin/guide/draft/inledning";
        sidebar(["USER", "SUPER_ADMIN"]);

        expect(screen.getByRole("link", {name: "Nav.adminGuideShort"})).toHaveAttribute("data-active", "true");
        expect(screen.getByRole("link", {name: "Nav.adminChecklistTemplates"})).not.toHaveAttribute("data-active", "true");
    });

    it("does not offer administration to others", () => {
        sidebar(["USER", "OBSERVER"]);

        expect(screen.getByRole("link", {name: "Nav.guide"})).toBeInTheDocument();
        expect(screen.queryByRole("link", {name: "Nav.admin"})).not.toBeInTheDocument();
        expect(screen.queryByRole("link", {name: "Nav.adminGuideShort"})).not.toBeInTheDocument();
        expect(screen.queryByRole("link", {name: "Nav.adminChecklistTemplates"})).not.toBeInTheDocument();
    });
});
