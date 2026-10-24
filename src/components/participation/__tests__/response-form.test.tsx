import {describe, expect, it, vi} from "vitest";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {ResponseForm, responseDefaults} from "@/components/participation/response-form.client";

const respondAction = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({useRouter: () => ({refresh: vi.fn()})}));
vi.mock("@/app/(app)/revivals/[id]/me/actions.server", () => ({respondAction}));
vi.mock("@/hooks/use-action-feedback", () => ({useActionFeedback: () => () => true}));

const pending = {response: "PENDING" as const};

describe("responseDefaults", () => {
    it("starts unanswered for a pending participant, and from the earlier answer otherwise", () => {
        expect(responseDefaults(pending)).toEqual({response: "", preferredPositionId: "", comment: "", termsAccepted: false, registerConsent: ""});
        expect(responseDefaults({response: "YES", termsAcceptedAt: "2026-10-01T10:00:00Z", registerConsent: false, preferredPosition: {id: "T1"}, comment: "Hej"}))
            .toEqual({response: "YES", preferredPositionId: "T1", comment: "Hej", termsAccepted: true, registerConsent: "no"});
    });
});

describe("ResponseForm", () => {
    it("refuses yes without the terms, saying so by the checkbox, and sends once they are accepted", async () => {
        respondAction.mockResolvedValue({ok: true, data: null});
        render(<ResponseForm revivalId="1" participant={pending} terms={["Avgiften är 800 kr."]} positions={[]} isHelper={false}/>);

        expect(screen.getByText("Avgiften är 800 kr.")).toBeInTheDocument();
        await userEvent.click(screen.getByRole("radio", {name: "Participation.answers.YES"}));
        await userEvent.click(screen.getByRole("radio", {name: "Participation.consent.yes"}));
        await userEvent.click(screen.getByRole("button", {name: "Participation.sendAnswer"}));

        const terms = screen.getByRole("checkbox", {name: "Participation.acceptTerms"});

        await waitFor(() => expect(terms).toHaveAttribute("aria-invalid", "true"));
        expect(terms).toHaveAccessibleDescription(expect.stringContaining("Validation.termsRequired"));
        expect(respondAction).not.toHaveBeenCalled();

        await userEvent.click(terms);
        await userEvent.click(screen.getByRole("button", {name: "Participation.sendAnswer"}));
        await waitFor(() => expect(respondAction).toHaveBeenCalledWith({
            revivalId: "1",
            values: {response: "YES", preferredPositionId: "", comment: "", termsAccepted: true, registerConsent: "yes"},
        }));
    });

    it("asks the consent question only for yes and maybe", async () => {
        render(<ResponseForm revivalId="1" participant={pending} terms={[]} positions={[]} isHelper={false}/>);

        expect(screen.queryByRole("group", {name: "Participation.registerConsent"})).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole("radio", {name: "Participation.answers.MAYBE"}));
        expect(screen.getByRole("group", {name: "Participation.registerConsent"})).toBeInTheDocument();
        await userEvent.click(screen.getByRole("radio", {name: "Participation.answers.NO"}));
        expect(screen.queryByRole("group", {name: "Participation.registerConsent"})).not.toBeInTheDocument();
    });
});
