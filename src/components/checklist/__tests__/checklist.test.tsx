import {describe, expect, it, vi} from "vitest";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {ChecklistItemRow} from "@/components/checklist/checklist-item-row.client";
import {ChecklistItemDialog} from "@/components/checklist/checklist-item-dialog.client";
import {updateChecklistItemAction} from "@/app/(app)/revivals/[id]/checklists/actions.server";
import {checklistFilterQuery, parseChecklistFilter} from "@/lib/checklist/schema";
import type {ChecklistItemFieldsFragment} from "@/gql/graphql";
import {ITEM_TYPES} from "@/components/catalog/__tests__/fixtures";

const intl = vi.hoisted(() => ({locale: "sv"}));

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Record<string, unknown>) => values ? `${key} ${JSON.stringify(values)}` : key,
    useLocale: () => intl.locale,
}));
vi.mock("@/app/(app)/revivals/[id]/checklists/actions.server", () => ({
    setChecklistItemStateAction: vi.fn(),
    createChecklistItemAction: vi.fn(),
    updateChecklistItemAction: vi.fn(async () => ({ok: true, data: null})),
}));
vi.mock("@/hooks/use-action-feedback", () => ({useActionFeedback: () => () => true}));

const item = (overrides: Partial<ChecklistItemFieldsFragment> = {}): ChecklistItemFieldsFragment => ({
    id: "1",
    required: false,
    text: {sv: "Boka lokal", en: null},
    state: "OPEN",
    stateChangedBy: null,
    stateChangedAt: null,
    reason: null,
    owner: null,
    deadline: null,
    deadlineManual: false,
    overdue: false,
    comment: null,
    guideItem: null,
    defaultCapability: null,
    logEntries: [],
    checklist: {id: "9", kind: "CHAPTER", chapterKey: "B", chapterTitle: {sv: "Lokaler", en: null}, name: null},
    version: 0,
    ...overrides,
});

function renderRow(value: ChecklistItemFieldsFragment, canWaive: boolean) {
    render(<ul><ChecklistItemRow revivalId="3" item={value} canWrite canWaive={canWaive} onEdit={() => undefined}
                                 onNotApplicable={() => undefined}/></ul>);
}

describe("ChecklistItemRow", () => {
    it("lets anyone who writes mark an own item not applicable", () => {
        renderRow(item(), false);

        expect(screen.getByRole("checkbox", {name: "Boka lokal"})).not.toBeChecked();
        expect(screen.getByRole("button", {name: "markNotApplicable"})).toBeInTheDocument();
    });

    it("lets only a directeur waive a guide requirement", () => {
        renderRow(item({required: true, text: {sv: "Utse **kassör**", en: null}}), false);

        expect(screen.getByText("kassör").tagName).toBe("STRONG");
        expect(screen.queryByRole("button", {name: "markNotApplicable"})).toBeNull();
    });

    it("shows a linked guide item in the reader's language, marked when not translated", () => {
        intl.locale = "en";
        renderRow(item({
            guideItem: {
                id: "5",
                key: "lokal",
                type: ITEM_TYPES.REQUIREMENT,
                text: {sv: "Boka **lokal**", en: null},
                version: 1
            }
        }), false);
        intl.locale = "sv";

        expect(screen.getByText("lokal").tagName).toBe("STRONG");
        expect(screen.getByText("notTranslated")).toBeInTheDocument();
    });

    it("shows a waived requirement with its reason and a way to reopen", () => {
        renderRow(item({required: true, state: "NOT_APPLICABLE", reason: "Vi har ingen kassa"}), true);

        expect(screen.getByText("Vi har ingen kassa")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "reopen"})).toBeInTheDocument();
        expect(screen.getByRole("checkbox")).toHaveAttribute("aria-disabled", "true");
    });
});

describe("ChecklistItemDialog", () => {
    it("leaves a deadline out of the update unless it was changed, so a computed one stays computed", async () => {
        render(<ChecklistItemDialog revivalId="3" checklistId="9" item={item({deadline: "2027-11-15"})} members={[]}
                                    open onOpenChange={() => undefined}/>);

        await userEvent.type(screen.getByLabelText("Checklist.comment"), "Ring först");
        await userEvent.click(screen.getByRole("button", {name: "Common.save"}));

        await waitFor(() => expect(updateChecklistItemAction).toHaveBeenCalled());
        expect(vi.mocked(updateChecklistItemAction).mock.calls[0][0].values.deadline).toBeUndefined();
    });
});

describe("checklist filter", () => {
    it("reads only known toggles and flips one at a time", () => {
        const filter = parseChecklistFilter({open: "1", mine: "0", other: "1"});

        expect(filter).toEqual({open: true});
        expect(checklistFilterQuery(filter, "overdue")).toBe("?open=1&overdue=1");
        expect(checklistFilterQuery(filter, "open")).toBe("");
        expect(parseChecklistFilter({})).toBeNull();
    });
});
