import {describe, expect, it, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import {RevivalAdminTable} from "@/components/revival/revival-admin-table.client";
import {revivalDetail} from "@/components/revival/__tests__/fixtures";

vi.mock("@/app/(app)/revivals/[id]/actions.server", () => ({
    addMemberAction: vi.fn(),
    setCapabilitiesAction: vi.fn(),
    removeMemberAction: vi.fn(),
    changeStatusAction: vi.fn(),
}));
vi.mock("next/navigation", () => ({useRouter: () => ({refresh: vi.fn()})}));

const permissions = revivalDetail().permissions;

describe("RevivalAdminTable", () => {
    it("offers appointing directeurs from the row with canManageDirecteurs", () => {
        render(<RevivalAdminTable revivals={[revivalDetail({permissions: {...permissions, canManageDirecteurs: true}})]}/>);

        expect(screen.getByRole("button", {name: /Admin.manageDirecteursFor/})).toBeInTheDocument();
    });

    it("has no directeur controls without canManageDirecteurs", () => {
        render(<RevivalAdminTable revivals={[revivalDetail()]}/>);

        expect(screen.queryByRole("button", {name: /Admin.manageDirecteursFor/})).not.toBeInTheDocument();
    });
});
