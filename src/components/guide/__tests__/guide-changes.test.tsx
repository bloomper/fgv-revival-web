import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {GuideChanges} from "@/components/guide/guide-changes.client";
import {ITEM_TYPES} from "@/components/catalog/__tests__/fixtures";

const chapter = (key: "B" | "C") => ({key, title: {sv: key === "B" ? "Lokaler" : "Budget", en: null}});
const snapshot = (key: "B" | "C", sv: string, type: "TIP" | "REQUIREMENT" = "TIP") => ({
    chapter: chapter(key), sectionKey: null, sectionTitle: null, type: ITEM_TYPES[type], text: {sv, en: null},
});

describe("GuideChanges", () => {
    it("groups one change of each kind by chapter", () => {
        render(<GuideChanges changes={{
            from: {id: "1", label: "v1", publishedAt: null},
            to: {id: "2", label: "v2", publishedAt: null},
            introductionChanged: ["sv"],
            chapters: [
                {key: "B", kind: "CHANGED", renamed: ["en"], moved: true, before: {sv: "Lokaler", en: "Venues"}, after: {sv: "Lokaler", en: "Rooms"}},
                {key: "X", kind: "REMOVED", renamed: [], moved: false, before: {sv: "Turné", en: null}, after: null},
            ],
            sections: [
                {key: "s1", kind: "ADDED", chapterBefore: null, chapterAfter: chapter("B"), renamed: [], moved: false, reordered: false, before: null, after: {sv: "Nytt", en: null}},
                {key: "s2", kind: "CHANGED", chapterBefore: chapter("B"), chapterAfter: chapter("B"), renamed: [], moved: false, reordered: true, before: {sv: "Kalas", en: null}, after: {sv: "Kalas", en: null}},
            ],
            items: [
                {key: "i1", kind: "ADDED", reworded: [], retyped: false, moved: false, before: null, after: snapshot("B", "Nytt tips.")},
                {key: "i2", kind: "REMOVED", reworded: [], retyped: false, moved: false, before: snapshot("B", "Gammalt."), after: null},
                {key: "i3", kind: "CHANGED", reworded: ["sv"], retyped: true, moved: true, before: snapshot("B", "Före."), after: snapshot("C", "Efter.", "REQUIREMENT")},
            ],
        }}/>);

        expect(screen.getByText("introduction")).toBeInTheDocument();
        expect(screen.getByRole("region", {name: 'chapter:{"title":"Lokaler"}'})).toBeInTheDocument();
        expect(screen.getByRole("region", {name: 'chapter:{"title":"Budget"}'})).toBeInTheDocument();
        expect(screen.getByTestId("chapter-change-B")).toHaveTextContent("chapterKind.CHANGED");
        expect(screen.getByTestId("chapter-change-B")).toHaveTextContent("moved");
        expect(screen.getByTestId("chapter-change-X")).toHaveTextContent("chapterKind.REMOVED");
        expect(screen.getByTestId("chapter-change-X")).toHaveTextContent("chapterRemovedChecklists");
        expect(screen.getByText("reordered")).toBeInTheDocument();
        expect(screen.getByTestId("change-i3")).toHaveTextContent("Före.");
        expect(screen.getByTestId("change-i3")).toHaveTextContent("Efter.");
        expect(screen.getByTestId("change-i3")).toHaveTextContent("retyped");
        expect(screen.getByTestId("change-i2")).toHaveTextContent("kind.REMOVED");
    });

    it("says so when nothing changed", () => {
        render(<GuideChanges changes={{
            from: {id: "1", label: "v1", publishedAt: null}, to: {id: "2", label: "v2", publishedAt: null},
            introductionChanged: [], chapters: [], sections: [], items: [],
        }}/>);

        expect(screen.getByText("none")).toBeInTheDocument();
    });
});
