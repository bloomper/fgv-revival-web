import {beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {RevivalStatusSelect} from "@/components/revival/revival-status-select.client";
import {changeStatusAction} from "@/app/(app)/revivals/[id]/actions.server";

vi.mock("@/app/(app)/revivals/[id]/actions.server", () => ({changeStatusAction: vi.fn(async () => ({ok: true, data: {status: "ORGANISING"}}))}));
vi.mock("next/navigation", () => ({useRouter: () => ({refresh: vi.fn()})}));
vi.mock("sonner", () => ({toast: {success: vi.fn(), error: vi.fn()}}));

beforeEach(() => {
    vi.mocked(changeStatusAction).mockClear();
});

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

    it("asks before archiving when the sync has not completed", async () => {
        render(<RevivalStatusSelect revivalId="7" status="SETTLING" allowedStatuses={["ARCHIVED"]} syncIncomplete/>);

        await userEvent.selectOptions(screen.getByRole("combobox"), "ARCHIVED");
        const dialog = await screen.findByRole("alertdialog");

        expect(changeStatusAction).not.toHaveBeenCalled();
        expect(dialog).toHaveTextContent("Revival.archiveSyncDescription");
        await userEvent.click(within(dialog).getByRole("button", {name: "Revival.archiveAnyway"}));
        await waitFor(() => expect(changeStatusAction).toHaveBeenCalledWith({id: "7", from: "SETTLING", to: "ARCHIVED"}));
    });

    it("archives at once when the sync has completed", async () => {
        render(<RevivalStatusSelect revivalId="7" status="SETTLING" allowedStatuses={["ARCHIVED"]}/>);

        await userEvent.selectOptions(screen.getByRole("combobox"), "ARCHIVED");

        await waitFor(() => expect(changeStatusAction).toHaveBeenCalledWith({id: "7", from: "SETTLING", to: "ARCHIVED"}));
        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
});
