import {describe, expect, it, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import {SteeringGroupList} from "@/components/member/steering-group-list.client";
import {DirecteurList} from "@/components/member/directeur-list.client";
import type {Member} from "@/components/member/member-list.client";

vi.mock("@/app/(app)/revivals/[id]/actions.server", () => ({
    addMemberAction: vi.fn(),
    setCapabilitiesAction: vi.fn(),
    removeMemberAction: vi.fn(),
}));
vi.mock("next/navigation", () => ({useRouter: () => ({refresh: vi.fn()})}));

const members: Member[] = [
    {id: "1", role: "DIRECTEUR", capabilities: [], state: "ACTIVE", displayName: "Dana Directeur", email: null, version: 0},
    {id: "2", role: "STEERING_GROUP", capabilities: ["FINANCE"], state: "ACTIVE", displayName: "Stina Styrgrupp", email: null, version: 0},
    {id: "3", role: "STEERING_GROUP", capabilities: ["COMMS"], state: "WAITING", displayName: null, email: null, version: 0},
];

describe("SteeringGroupList", () => {
    it("has no controls without canManageSteeringGroup and shows capabilities", () => {
        render(<SteeringGroupList revivalId="1" members={members} canManage={false}/>);

        expect(screen.getByText("Stina Styrgrupp")).toBeInTheDocument();
        expect(screen.getByText("Capability.FINANCE")).toBeInTheDocument();
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
        expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });

    it("shows a waiting member without an email address", () => {
        render(<SteeringGroupList revivalId="1" members={members} canManage={false}/>);

        expect(screen.getByText("Members.waitingPerson")).toBeInTheDocument();
        expect(screen.getByText("MemberState.WAITING")).toBeInTheDocument();
        expect(screen.queryByText(/@/)).not.toBeInTheDocument();
    });

    it("offers adding, removing and capabilities with canManageSteeringGroup", () => {
        render(<SteeringGroupList revivalId="1" members={members} canManage={true}/>);

        expect(screen.getByRole("button", {name: "Members.addMember"})).toBeInTheDocument();
        expect(screen.getAllByRole("button", {name: /Common.remove/})).toHaveLength(2);
        expect(screen.getAllByRole("group", {name: "Members.capabilities"}).length).toBeGreaterThan(0);
    });

    it("shows email addresses when the server sends them", () => {
        render(<DirecteurList revivalId="1" canManage={true} members={[
            {id: "4", role: "DIRECTEUR", capabilities: [], state: "WAITING", displayName: null, email: "ny@example.org", version: 0},
        ]}/>);

        expect(screen.getByText("ny@example.org")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Members.addDirecteur"})).toBeInTheDocument();
    });
});
