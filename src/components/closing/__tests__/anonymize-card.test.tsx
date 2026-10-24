import {beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {AnonymizeCard} from "@/components/closing/anonymize-card.client";

const actions = vi.hoisted(() => ({anonymizeRevivalAction: vi.fn(async () => ({ok: true, data: null}))}));
const track = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({useRouter: () => ({refresh: vi.fn()})}));
vi.mock("@/app/(app)/revivals/[id]/closing/actions.server", () => actions);
vi.mock("@/hooks/use-action-feedback", () => ({useActionFeedback: () => (result: { ok: boolean }) => result.ok}));
vi.mock("@/utils/umami", () => ({track}));

const revival = {id: "1", title: "Ali Baba 2028", version: 4};

beforeEach(() => {
    vi.clearAllMocks();
});

describe("AnonymizeCard", () => {
    it("anonymizes only once the title is typed, sending it with the version", async () => {
        render(<AnonymizeCard revival={revival} anonymizedAt={null} autoAnonymizeOn={null} canAnonymize/>);

        await userEvent.click(screen.getByRole("button", {name: "action"}));
        const dialog = await screen.findByRole("alertdialog");
        const confirm = within(dialog).getByRole("button", {name: "action"});

        expect(confirm).toBeDisabled();
        await userEvent.type(within(dialog).getByRole("textbox"), "ali baba");
        expect(confirm).toBeDisabled();
        await userEvent.type(within(dialog).getByRole("textbox"), " 2028");
        await userEvent.click(confirm);

        await waitFor(() => expect(actions.anonymizeRevivalAction).toHaveBeenCalledWith({
            id: "1",
            version: 4,
            confirmation: "ali baba 2028"
        }));
        expect(track).toHaveBeenCalledWith("revival-anonymize");
    });

    it("tells when it happens by itself, and offers nothing without canAnonymize", () => {
        render(<AnonymizeCard revival={revival} anonymizedAt={null} autoAnonymizeOn="2029-10-23"
                              canAnonymize={false}/>);

        expect(screen.getByText('automaticOn:{"date":"2029-10-23"}')).toBeInTheDocument();
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("warns that a sync not completed cannot be done afterwards", () => {
        render(<AnonymizeCard revival={revival} anonymizedAt={null} autoAnonymizeOn={null} canAnonymize
                              syncIncomplete/>);

        expect(screen.getByText("syncIncomplete")).toBeInTheDocument();
    });

    it("says when it was anonymized", () => {
        render(<AnonymizeCard revival={revival} anonymizedAt="2026-10-23T10:00:00Z" autoAnonymizeOn={null}
                              canAnonymize/>);

        expect(screen.getByText('done:{"at":"2026-10-23 12:00"}')).toBeInTheDocument();
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
});
