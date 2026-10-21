import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {GuideChanges} from "@/components/guide/guide-changes.client";

const snapshot = (phase: "B" | "C", sv: string, type: "TIP" | "REQUIREMENT" = "TIP") => ({
    phase, sectionKey: null, sectionTitle: null, type, text: {sv, en: null},
});

describe("GuideChanges", () => {
    it("groups one change of each kind by chapter", () => {
        render(<GuideChanges changes={{
            from: {id: "1", label: "v1", publishedAt: null},
            to: {id: "2", label: "v2", publishedAt: null},
            introductionChanged: ["sv"],
            chapters: [{phase: "B", renamed: ["en"], before: {sv: "Lokaler", en: "Venues"}, after: {sv: "Lokaler", en: "Rooms"}}],
            sections: [
                {key: "s1", kind: "ADDED", phaseBefore: null, phaseAfter: "B", renamed: [], moved: false, reordered: false, before: null, after: {sv: "Nytt", en: null}},
                {key: "s2", kind: "CHANGED", phaseBefore: "B", phaseAfter: "B", renamed: [], moved: false, reordered: true, before: {sv: "Kalas", en: null}, after: {sv: "Kalas", en: null}},
            ],
            items: [
                {key: "i1", kind: "ADDED", reworded: [], retyped: false, moved: false, before: null, after: snapshot("B", "Nytt tips.")},
                {key: "i2", kind: "REMOVED", reworded: [], retyped: false, moved: false, before: snapshot("B", "Gammalt."), after: null},
                {key: "i3", kind: "CHANGED", reworded: ["sv"], retyped: true, moved: true, before: snapshot("B", "Före."), after: snapshot("C", "Efter.", "REQUIREMENT")},
            ],
        }}/>);

        expect(screen.getByText("introduction")).toBeInTheDocument();
        expect(screen.getByRole("region", {name: 'chapter:{"phase":"B"}'})).toBeInTheDocument();
        expect(screen.getByRole("region", {name: 'chapter:{"phase":"C"}'})).toBeInTheDocument();
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
