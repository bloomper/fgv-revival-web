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
    default: ({children, href}: { children?: ReactNode; href: string }) => <a href={href}>{children}</a>,
}));
vi.mock("@/hooks/use-is-client.client", () => ({
    useIsClient: () => true,
}));
vi.mock("@/components/nav-user.client", () => ({
    NavUser: () => null,
}));

const sidebar = (roles: Role[]) => render(
    <TooltipProvider>
        <SidebarProvider>
            <AppSidebar roles={roles} accountUrl="https://auth.example.org/account"/>
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

    it("links the guide for every user, and administration for super admins", () => {
        pathname = "/admin/guide";
        sidebar(["USER", "SUPER_ADMIN"]);

        expect(screen.getByRole("link", {name: "Nav.guide"})).toHaveAttribute("href", "/guide");
        expect(screen.getByRole("link", {name: "Nav.admin"})).toHaveAttribute("href", "/admin/guide");
        expect(screen.getByRole("link", {name: "Nav.adminGuide"})).toHaveAttribute("href", "/admin/guide");
        expect(screen.getByRole("link", {name: "Nav.adminChecklistTemplates"})).toHaveAttribute("href", "/admin/checklist-templates");
    });

    it("does not offer administration to others", () => {
        sidebar(["USER", "OBSERVER"]);

        expect(screen.getByRole("link", {name: "Nav.guide"})).toBeInTheDocument();
        expect(screen.queryByRole("link", {name: "Nav.admin"})).not.toBeInTheDocument();
        expect(screen.queryByRole("link", {name: "Nav.adminGuide"})).not.toBeInTheDocument();
        expect(screen.queryByRole("link", {name: "Nav.adminChecklistTemplates"})).not.toBeInTheDocument();
    });
});
