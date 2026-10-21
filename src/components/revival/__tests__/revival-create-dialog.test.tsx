import {describe, expect, it, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {RevivalCreateDialog} from "@/components/revival/revival-create-dialog.client";
import {searchSpexAction} from "@/app/(app)/admin/revivals/actions.server";

vi.mock("@/app/(app)/admin/revivals/actions.server", () => ({
    searchSpexAction: vi.fn(),
    createRevivalAction: vi.fn(),
}));
vi.mock("next/navigation", () => ({useRouter: () => ({refresh: vi.fn(), push: vi.fn()})}));
vi.mock("sonner", () => ({toast: {success: vi.fn(), error: vi.fn()}}));

describe("RevivalCreateDialog", () => {
    it("lists spexes from Spexregister", async () => {
        vi.mocked(searchSpexAction).mockResolvedValue({ok: true, data: [{id: "1", title: "Ali Baba", year: 1956}]});
        render(<RevivalCreateDialog/>);

        await userEvent.click(screen.getByRole("button", {name: /Admin.create/}));

        expect(await screen.findByRole("option", {name: /Ali Baba/})).toBeInTheDocument();
    });

    it("says when Spexregister is unavailable", async () => {
        vi.mocked(searchSpexAction).mockResolvedValue({ok: false, code: "SPEXREGISTER_UNAVAILABLE", message: "x"});
        render(<RevivalCreateDialog/>);

        await userEvent.click(screen.getByRole("button", {name: /Admin.create/}));

        expect(await screen.findByRole("alert")).toHaveTextContent("spexregisterUnavailable");
    });
});
