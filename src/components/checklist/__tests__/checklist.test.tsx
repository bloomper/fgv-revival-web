import {describe, expect, it, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import {ChecklistItemRow} from "@/components/checklist/checklist-item-row.client";
import {checklistFilterQuery, parseChecklistFilter} from "@/lib/checklist/schema";
import type {ChecklistItemFieldsFragment} from "@/gql/graphql";

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Record<string, unknown>) => values ? `${key} ${JSON.stringify(values)}` : key,
    useLocale: () => "sv",
}));
vi.mock("@/app/(app)/revivals/[id]/checklists/actions.server", () => ({setChecklistItemStateAction: vi.fn()}));
vi.mock("@/hooks/use-action-feedback", () => ({useActionFeedback: () => () => true}));

const item = (overrides: Partial<ChecklistItemFieldsFragment> = {}): ChecklistItemFieldsFragment => ({
    id: "1", required: false, text: {sv: "Boka lokal", en: null}, state: "OPEN", stateChangedBy: null, stateChangedAt: null,
    reason: null, owner: null, deadline: null, deadlineManual: false, overdue: false, comment: null, guideItem: null,
    defaultCapability: null, logEntries: [], checklist: {id: "9", kind: "PHASE", phase: "B", name: null}, version: 0,
    ...overrides,
});

function renderRow(value: ChecklistItemFieldsFragment, canWaive: boolean) {
    render(<ul><ChecklistItemRow revivalId="3" item={value} canWrite canWaive={canWaive} onEdit={() => undefined} onNotApplicable={() => undefined}/></ul>);
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

    it("shows a waived requirement with its reason and a way to reopen", () => {
        renderRow(item({required: true, state: "NOT_APPLICABLE", reason: "Vi har ingen kassa"}), true);

        expect(screen.getByText("Vi har ingen kassa")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "reopen"})).toBeInTheDocument();
        expect(screen.getByRole("checkbox")).toBeDisabled();
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
