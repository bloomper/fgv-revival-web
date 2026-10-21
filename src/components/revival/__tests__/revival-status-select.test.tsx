import {describe, expect, it, vi} from "vitest";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {RevivalStatusSelect} from "@/components/revival/revival-status-select.client";
import {changeStatusAction} from "@/app/(app)/revivals/[id]/actions.server";

vi.mock("@/app/(app)/revivals/[id]/actions.server", () => ({changeStatusAction: vi.fn(async () => ({ok: true, data: {status: "ORGANISING"}}))}));
vi.mock("next/navigation", () => ({useRouter: () => ({refresh: vi.fn()})}));
vi.mock("sonner", () => ({toast: {success: vi.fn(), error: vi.fn()}}));

describe("RevivalStatusSelect", () => {
    it("renders only the allowed statuses", () => {
        render(<RevivalStatusSelect revivalId="1" status="APPROVED" allowedStatuses={["ORGANISING"]}/>);

        const options = screen.getAllByRole("option").map(option => option.textContent);

        expect(options).toEqual(["Revival.changeStatus…", "Status.ORGANISING"]);
    });

    it("renders nothing when no change is allowed", () => {
        const {container} = render(<RevivalStatusSelect revivalId="1" status="OPEN" allowedStatuses={[]}/>);

        expect(container).toBeEmptyDOMElement();
    });

    it("sends the shown status as from", async () => {
        render(<RevivalStatusSelect revivalId="7" status="APPROVED" allowedStatuses={["ORGANISING"]}/>);

        await userEvent.selectOptions(screen.getByRole("combobox"), "ORGANISING");

        await waitFor(() => expect(changeStatusAction).toHaveBeenCalledWith({id: "7", from: "APPROVED", to: "ORGANISING"}));
    });
});
