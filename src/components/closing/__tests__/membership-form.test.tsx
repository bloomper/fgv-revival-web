import {beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {MembershipForm} from "@/components/closing/membership-form.client";

const actions = vi.hoisted(() => ({setMembershipAction: vi.fn(async () => ({ok: true, data: {count: 1}}))}));
const track = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({useRouter: () => ({refresh: vi.fn()})}));
vi.mock("@/app/(app)/revivals/[id]/closing/actions.server", () => actions);
vi.mock("@/hooks/use-action-feedback", () => ({useActionFeedback: () => (result: { ok: boolean }) => result.ok}));
vi.mock("@/utils/umami", () => ({track}));

const participants = [
    {id: "p1", name: "Anna Andersson", membershipPaid: true},
    {id: "p2", name: "Bertil Bengtsson", membershipPaid: false},
];

beforeEach(() => {
    vi.clearAllMocks();
});

describe("MembershipForm", () => {
    it("sends the year and everyone ticked, replacing the marks", async () => {
        render(<MembershipForm revivalId="1" year={2028} participants={participants} canWrite/>);

        expect(screen.getByRole("checkbox", {name: "Anna Andersson"})).toBeChecked();
        await userEvent.click(screen.getByRole("checkbox", {name: "Anna Andersson"}));
        await userEvent.click(screen.getByRole("checkbox", {name: "Bertil Bengtsson"}));
        await userEvent.clear(screen.getByLabelText("Closing.membershipYear"));
        await userEvent.type(screen.getByLabelText("Closing.membershipYear"), "2029");
        await userEvent.click(screen.getByRole("button", {name: "Common.save"}));

        await waitFor(() => expect(actions.setMembershipAction).toHaveBeenCalledWith({
            revivalId: "1",
            year: 2029,
            participantIds: ["p2"]
        }));
        expect(track).toHaveBeenCalledWith("membership-set", {count: 1});
    });

    it("refuses a year that is not four digits", async () => {
        render(<MembershipForm revivalId="1" year={2028} participants={participants} canWrite/>);

        await userEvent.clear(screen.getByLabelText("Closing.membershipYear"));
        await userEvent.type(screen.getByLabelText("Closing.membershipYear"), "28");
        await userEvent.click(screen.getByRole("button", {name: "Common.save"}));

        expect(screen.getByText("Validation.membershipYearInvalid")).toBeInTheDocument();
        expect(actions.setMembershipAction).not.toHaveBeenCalled();
    });

    it("is read-only without canWrite", () => {
        render(<MembershipForm revivalId="1" year={2028} participants={participants} canWrite={false}/>);

        expect(screen.getByRole("checkbox", {name: "Bertil Bengtsson"})).toHaveAttribute("aria-disabled", "true");
        expect(screen.queryByRole("button", {name: "Common.save"})).not.toBeInTheDocument();
    });
});
