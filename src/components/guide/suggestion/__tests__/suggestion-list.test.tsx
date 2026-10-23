import {describe, expect, it, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import type {GuideSuggestionFieldsFragment} from "@/gql/graphql";
import {SuggestionList} from "@/components/guide/suggestion/suggestion-list.client";
import {ITEM_TYPES} from "@/components/catalog/__tests__/fixtures";

vi.mock("@/app/(app)/revivals/[id]/guide/actions.server", () => ({withdrawSuggestionAction: vi.fn()}));
vi.mock("next/navigation", () => ({useRouter: () => ({refresh: vi.fn()})}));

const suggestion = (overrides: Partial<GuideSuggestionFieldsFragment> = {}): GuideSuggestionFieldsFragment => ({
    id: "1", kind: "CHANGE", status: "OPEN", version: 0, mine: true, author: "Stina Styrgrupp", chapterKey: "B", chapterTitle: {sv: "Lokaler", en: null}, sectionKey: null, itemKey: "k",
    reason: "Inaktuellt", decidedBy: null, decidedAt: null, decisionReason: null, reopenedAt: null, createdAt: "2026-11-02T10:00:00Z",
    proposedType: null, proposedText: {sv: "Nytt tips.", en: null},
    revival: {id: "1", title: "Ali Baba 2028", year: 2028}, madeOn: {id: "1", label: "v1"}, publishedIn: null,
    item: {chapter: {key: "B", title: {sv: "Lokaler", en: null}}, sectionKey: null, sectionTitle: null, type: ITEM_TYPES.TIP, text: {sv: "Gammalt tips.", en: null}},
    ...overrides,
});

describe("SuggestionList", () => {
    it("shows the item now, the proposal and the reason, and lets the author withdraw", () => {
        render(<SuggestionList suggestions={[suggestion()]}/>);

        expect(screen.getByText("Gammalt tips.")).toBeInTheDocument();
        expect(screen.getByText("Nytt tips.")).toBeInTheDocument();
        expect(screen.getByText("Inaktuellt")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "withdraw"})).toBeInTheDocument();
    });

    it("says which chapter and version it was made on", () => {
        render(<SuggestionList suggestions={[suggestion()]}/>);

        expect(screen.getByText(/where:\{"chapter":"Lokaler","version":"v1"\}/)).toBeInTheDocument();
    });

    it("offers no withdrawal on someone else's or a decided suggestion", () => {
        render(<SuggestionList suggestions={[suggestion({mine: false}), suggestion({id: "2", status: "REJECTED", decisionReason: "Står i D.", decidedBy: "Sara Admin"})]}/>);

        expect(screen.queryByRole("button", {name: "withdraw"})).not.toBeInTheDocument();
        expect(screen.getByText("Står i D.")).toBeInTheDocument();
        expect(screen.getByText("status.REJECTED")).toBeInTheDocument();
    });

    it("says where an accepted suggestion was published and when one was reopened", () => {
        render(<SuggestionList suggestions={[
            suggestion({status: "ACCEPTED", publishedIn: {id: "2", label: "v2"}}),
            suggestion({id: "3", reopenedAt: "2026-11-03T10:00:00Z"}),
        ]}/>);

        expect(screen.getByText('publishedIn:{"label":"v2"}')).toBeInTheDocument();
        expect(screen.getByText("reopened")).toBeInTheDocument();
    });

    it("says when there are none", () => {
        render(<SuggestionList suggestions={[]}/>);

        expect(screen.getByText("none")).toBeInTheDocument();
    });
});
