import type {ReactNode} from "react";
import {describe, expect, it, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import {AppSidebar} from "@/components/app-sidebar.client";
import {SidebarProvider} from "@/components/ui/sidebar";
import {TooltipProvider} from "@/components/ui/tooltip";
import type {Role} from "@/types/auth";

vi.mock("next/navigation", () => ({
    usePathname: () => "/",
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

describe("AppSidebar", () => {
    it("links the guide for every user, and managing it for super admins", () => {
        sidebar(["USER", "SUPER_ADMIN"]);

        expect(screen.getByRole("link", {name: "Nav.guide"})).toHaveAttribute("href", "/guide");
        expect(screen.getByRole("link", {name: "Nav.adminGuide"})).toHaveAttribute("href", "/admin/guide");
    });

    it("does not offer managing the guide to others", () => {
        sidebar(["USER", "OBSERVER"]);

        expect(screen.getByRole("link", {name: "Nav.guide"})).toBeInTheDocument();
        expect(screen.queryByRole("link", {name: "Nav.adminGuide"})).not.toBeInTheDocument();
    });
});
