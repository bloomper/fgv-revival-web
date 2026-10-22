import {afterEach, describe, expect, it, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import {GuideChapterView} from "@/components/guide/guide-view.client";
import {guideVersion} from "@/components/guide/__tests__/fixtures";

const useLocale = vi.hoisted(() => vi.fn(() => "sv"));

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => key,
    useLocale,
}));

const chapter = (key: string) => guideVersion().chapters.find(candidate => candidate.key === key)!;

describe("GuideChapterView", () => {
    afterEach(() => {
        useLocale.mockReturnValue("sv");
    });

    it("shows one chapter, numbered, with its sections as anchors", () => {
        const {container} = render(<GuideChapterView chapter={chapter("B")} number={2}/>);

        expect(screen.getByRole("heading", {name: "2. Kapitel B"})).toBeInTheDocument();
        expect(screen.getByRole("heading", {name: "Kalaslokal"})).toBeInTheDocument();
        expect(container.querySelector("section#section-s-kalas")).not.toBeNull();
        expect(container.querySelector("#item-k-tip")).not.toBeNull();
        expect(screen.queryByText("Ett krav.")).not.toBeInTheDocument();
    });

    it("labels every item type except plain text", () => {
        render(<><GuideChapterView chapter={chapter("A")} number={1}/><GuideChapterView chapter={chapter("B")} number={2}/></>);

        expect(screen.getByText("REQUIREMENT")).toBeInTheDocument();
        expect(screen.getByText("TIP")).toBeInTheDocument();
        expect(screen.getByText("QUESTION")).toBeInTheDocument();
        expect(screen.queryByText("TEXT")).not.toBeInTheDocument();
    });

    it("adds the given controls to items and places", () => {
        render(<GuideChapterView chapter={chapter("B")} number={2}
                                 itemActions={item => <button>suggest {item.key}</button>}
                                 placeActions={place => <button>add to {place.chapterKey}{place.sectionKey ? ` ${place.sectionKey}` : ""}</button>}/>);

        expect(screen.getByRole("button", {name: "suggest k-tip"})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "add to B s-kalas"})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "add to B"})).toBeInTheDocument();
    });

    it("marks titles shown in Swedish to an English reader as not translated", () => {
        useLocale.mockReturnValue("en");
        render(<><GuideChapterView chapter={chapter("A")} number={1}/><GuideChapterView chapter={chapter("B")} number={2}/></>);

        expect(screen.getByRole("heading", {name: "1. Chapter A"}).parentElement).not.toHaveTextContent("notTranslated");
        expect(screen.getByRole("heading", {name: "2. Kapitel B"}).parentElement).toHaveTextContent("notTranslated");
        expect(screen.getByRole("heading", {name: "Kalaslokal"}).parentElement).toHaveTextContent("notTranslated");
    });

    it("marks no title in Swedish", () => {
        render(<GuideChapterView chapter={chapter("B")} number={2}/>);

        expect(screen.getByRole("heading", {name: "2. Kapitel B"}).parentElement).not.toHaveTextContent("notTranslated");
    });
});
