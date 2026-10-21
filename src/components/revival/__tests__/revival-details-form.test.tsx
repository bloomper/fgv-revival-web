import {describe, expect, it, vi} from "vitest";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {RevivalDetailsForm} from "@/components/revival/revival-details-form.client";
import {updateDetailsAction} from "@/app/(app)/revivals/[id]/actions.server";

vi.mock("@/app/(app)/revivals/[id]/actions.server", () => ({updateDetailsAction: vi.fn(async () => ({ok: true, data: {version: 4}}))}));
vi.mock("next/navigation", () => ({useRouter: () => ({refresh: vi.fn()})}));
vi.mock("sonner", () => ({toast: {success: vi.fn(), error: vi.fn()}}));

const revival = {id: "1", year: 2028, version: 3, premiereDate: "2028-02-10", showDates: [], venues: []};

describe("RevivalDetailsForm", () => {
    it("refuses a show date before the premiere without calling the server", async () => {
        render(<RevivalDetailsForm revival={{...revival, showDates: ["2028-02-01"]}} onDone={vi.fn()}/>);

        await userEvent.click(screen.getByRole("button", {name: "Common.save"}));

        expect(await screen.findByRole("alert")).toHaveTextContent("Validation.showDateBeforePremiere");
        expect(updateDetailsAction).not.toHaveBeenCalled();
    });

    it("refuses a premiere in another year", async () => {
        render(<RevivalDetailsForm revival={{...revival, premiereDate: "2029-01-01"}} onDone={vi.fn()}/>);

        await userEvent.click(screen.getByRole("button", {name: "Common.save"}));

        expect(await screen.findByRole("alert")).toHaveTextContent("Validation.premiereYear");
    });

    it("saves valid details with the version it was given", async () => {
        const onDone = vi.fn();

        render(<RevivalDetailsForm revival={{...revival, showDates: ["2028-02-12"], venues: [" Kårhuset "]}} onDone={onDone}/>);

        await userEvent.click(screen.getByRole("button", {name: "Common.save"}));

        await waitFor(() => expect(updateDetailsAction).toHaveBeenCalledWith({
            id: "1", version: 3, premiereDate: "2028-02-10", showDates: ["2028-02-12"], venues: [" Kårhuset "],
        }));
        await waitFor(() => expect(onDone).toHaveBeenCalled());
    });
});
