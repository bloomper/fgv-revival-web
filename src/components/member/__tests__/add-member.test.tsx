import {beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {AddMemberForm} from "@/components/member/member-add-form.client";
import {addMemberAction, searchMemberCandidatesAction} from "@/app/(app)/revivals/[id]/actions.server";

vi.mock("@/app/(app)/revivals/[id]/actions.server", () => ({
    addMemberAction: vi.fn(async () => ({ok: true, data: {id: "9", invited: false}})),
    searchMemberCandidatesAction: vi.fn(),
    setCapabilitiesAction: vi.fn(),
    removeMemberAction: vi.fn(),
}));
vi.mock("next/navigation", () => ({useRouter: () => ({refresh: vi.fn()})}));
vi.mock("sonner", () => ({toast: {success: vi.fn(), error: vi.fn()}}));

const search = vi.mocked(searchMemberCandidatesAction);
const add = vi.mocked(addMemberAction);

function renderForm() {
    render(<AddMemberForm revivalId="1" role="DIRECTEUR"/>);
    return screen.getByRole("combobox");
}

describe("adding a member", () => {
    beforeEach(() => {
        search.mockReset();
        add.mockClear();
    });

    it("searches FGV accounts and adds the one picked", async () => {
        search.mockResolvedValue({ok: true, data: [{email: "dana@example.org", displayName: "Dana Directeur", hasAccess: false}]});
        await userEvent.type(renderForm(), "dan");

        await userEvent.click(await screen.findByRole("button", {name: /Dana Directeur/}));
        expect(screen.getByText("Members.selectedWithoutAccess")).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", {name: "Members.addDirecteur"}));

        expect(search).toHaveBeenLastCalledWith("1", "dan");
        await waitFor(() => expect(add).toHaveBeenCalledWith(expect.objectContaining({email: "dana@example.org", role: "DIRECTEUR"})));
        expect(add.mock.calls[0][0]).not.toHaveProperty("firstName");
    });

    it("invites an address no account has, with the name given", async () => {
        search.mockResolvedValue({ok: true, data: []});
        await userEvent.type(renderForm(), "ny@example.org");

        expect(await screen.findByText(/Members.inviteDescription/)).toBeInTheDocument();
        await userEvent.type(screen.getByLabelText("Members.firstName"), "Nora");
        await userEvent.type(screen.getByLabelText("Members.lastName"), "Ny");
        await userEvent.click(screen.getByRole("button", {name: "Members.invite"}));

        await waitFor(() => expect(add).toHaveBeenCalledWith(expect.objectContaining({email: "ny@example.org", firstName: "Nora", lastName: "Ny"})));
    });

    it("still takes a typed address when the accounts cannot be searched", async () => {
        search.mockResolvedValue({ok: false, code: "DIRECTORY_UNAVAILABLE", message: ""});
        await userEvent.type(renderForm(), "ny@example.org");

        expect(await screen.findByText("Members.directoryUnavailable")).toBeInTheDocument();
        expect(screen.queryByText(/Members.inviteDescription/)).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", {name: "Members.addDirecteur"}));

        await waitFor(() => expect(add).toHaveBeenCalledWith(expect.objectContaining({email: "ny@example.org"})));
    });

    it("asks for a person or an address when neither is given", async () => {
        search.mockResolvedValue({ok: true, data: []});
        await userEvent.type(renderForm(), "dana");
        await userEvent.click(screen.getByRole("button", {name: "Members.addDirecteur"}));

        expect(await screen.findByRole("alert")).toHaveTextContent("Members.pickOrType");
        expect(add).not.toHaveBeenCalled();
    });
});
