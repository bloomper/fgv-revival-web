import {describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen, within} from "@testing-library/react";
import {filterMembers, MemberTable} from "@/components/member/member-table.client";
import type {Member} from "@/components/member/member";
import {CatalogProvider} from "@/components/catalog/catalog-provider.client";
import {CAPABILITIES} from "@/components/catalog/__tests__/fixtures";

vi.mock("@/app/(app)/revivals/[id]/actions.server", () => ({
    addMemberAction: vi.fn(),
    searchMemberCandidatesAction: vi.fn(),
    setCapabilitiesAction: vi.fn(),
    removeMemberAction: vi.fn(),
}));
vi.mock("next/navigation", () => ({useRouter: () => ({refresh: vi.fn()})}));

const members: Member[] = [
    {id: "1", role: "DIRECTEUR", capabilities: [], state: "ACTIVE", displayName: "Dana Directeur", email: null, version: 0},
    {id: "2", role: "STEERING_GROUP", capabilities: [CAPABILITIES.FINANCE], state: "ACTIVE", displayName: "Stina Styrgrupp", email: null, version: 0},
    {id: "3", role: "STEERING_GROUP", capabilities: [CAPABILITIES.COMMS], state: "WAITING", displayName: null, email: null, version: 0},
];

function renderTable(overrides: Partial<Parameters<typeof MemberTable>[0]> = {}) {
    return render(
        <CatalogProvider capabilities={[CAPABILITIES.FINANCE, CAPABILITIES.COMMS]}>
            <MemberTable revivalId="1" members={members} canManageDirecteurs={false} canManageSteeringGroup={false} {...overrides}/>
        </CatalogProvider>,
    );
}

describe("MemberTable", () => {
    it("lists directeurs and the steering group with roles and areas, without controls for a reader", () => {
        renderTable();

        expect(screen.getByText("Dana Directeur")).toBeInTheDocument();
        expect(screen.getByText("Stina Styrgrupp")).toBeInTheDocument();
        expect(screen.getByText("Ekonomi")).toBeInTheDocument();
        expect(screen.queryByRole("button", {name: /Members.addMember|Members.addDirecteur|Members.openMenu/})).not.toBeInTheDocument();
    });

    it("shows a waiting member without an email address", () => {
        renderTable();

        expect(screen.getByText("Members.waitingPerson")).toBeInTheDocument();
        expect(screen.getByText("MemberState.WAITING")).toBeInTheDocument();
        expect(screen.queryByText(/@/)).not.toBeInTheDocument();
    });

    it("offers adding and a row menu only for the roles the user may manage", () => {
        renderTable({canManageSteeringGroup: true});

        expect(screen.getByRole("button", {name: "Members.addMember"})).toBeInTheDocument();
        expect(screen.queryByRole("button", {name: "Members.addDirecteur"})).not.toBeInTheDocument();
        expect(screen.getAllByRole("button", {name: /Members.openMenu/})).toHaveLength(2);
    });

    it("changes areas in a dialog, offering a retired one only to the member who holds it", async () => {
        const retired = {id: "OLD", name: {sv: "Gammalt område", en: null}, retired: true};

        renderTable({
            canManageSteeringGroup: true,
            members: [{id: "2", role: "STEERING_GROUP", capabilities: [CAPABILITIES.FINANCE, retired], state: "ACTIVE", displayName: "Stina Styrgrupp", email: null, version: 0}],
        });
        fireEvent.click(screen.getByRole("button", {name: /Members.openMenu/}));
        fireEvent.click(await screen.findByRole("menuitem", {name: /Members.editCapabilities/}));

        const dialog = await screen.findByRole("dialog");

        expect(within(dialog).getByRole("group", {name: "Members.capabilities"}))
            .toHaveTextContent('EkonomiKommunikationCatalog.retiredName:{"name":"Gammalt område"}');
    });

    it("shows email addresses when the server sends them", () => {
        renderTable({
            canManageDirecteurs: true,
            members: [{id: "4", role: "DIRECTEUR", capabilities: [], state: "WAITING", displayName: null, email: "ny@example.org", version: 0}],
        });

        expect(screen.getAllByText("ny@example.org").length).toBeGreaterThan(0);
        expect(screen.getByRole("button", {name: "Members.addDirecteur"})).toBeInTheDocument();
    });
});

describe("filterMembers", () => {
    const roles = new Set(["DIRECTEUR", "STEERING_GROUP"]);

    it("matches name and area words, and filters by role and area", () => {
        expect(filterMembers(members, "stina ekon", roles, null, "sv", "?").map(member => member.id)).toEqual(["2"]);
        expect(filterMembers(members, "", new Set(["DIRECTEUR"]), null, "sv", "?").map(member => member.id)).toEqual(["1"]);
        expect(filterMembers(members, "", roles, new Set([CAPABILITIES.COMMS.id]), "sv", "?").map(member => member.id)).toEqual(["3"]);
    });
});
