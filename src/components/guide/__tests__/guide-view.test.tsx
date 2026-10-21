import {afterEach, describe, expect, it, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import {GuideView} from "@/components/guide/guide-view.client";
import {guideVersion} from "@/components/guide/__tests__/fixtures";

const useLocale = vi.hoisted(() => vi.fn(() => "sv"));

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => key,
    useLocale,
}));

describe("GuideView", () => {
    afterEach(() => {
        useLocale.mockReturnValue("sv");
    });

    it("shows the introduction and every chapter with an anchor", () => {
        const {container} = render(<GuideView version={guideVersion()}/>);

        expect(screen.getByText("Välkommen till guiden.")).toBeInTheDocument();
        expect(container.querySelectorAll("section[id^='chapter-']")).toHaveLength(10);
        expect(screen.getByRole("heading", {name: "A. Kapitel A"})).toBeInTheDocument();
        expect(screen.getByRole("heading", {name: "Kalaslokal"})).toBeInTheDocument();
    });

    it("labels every item type except plain text", () => {
        render(<GuideView version={guideVersion()}/>);

        expect(screen.getByText("REQUIREMENT")).toBeInTheDocument();
        expect(screen.getByText("TIP")).toBeInTheDocument();
        expect(screen.getByText("QUESTION")).toBeInTheDocument();
        expect(screen.queryByText("TEXT")).not.toBeInTheDocument();
    });

    it("lists the chapters in an index", () => {
        render(<GuideView version={guideVersion()}/>);

        const index = screen.getByRole("navigation", {name: "chapters"});

        expect(index.querySelectorAll("a")).toHaveLength(10);
        expect(index.querySelector("a")).toHaveAttribute("href", "#chapter-A");
    });

    it("adds the given controls to items and places", () => {
        render(<GuideView version={guideVersion()}
                          itemActions={item => <button>suggest {item.key}</button>}
                          placeActions={place => <button>add to {place.phase}{place.sectionKey ? ` ${place.sectionKey}` : ""}</button>}/>);

        expect(screen.getByRole("button", {name: "suggest k-tip"})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "add to B s-kalas"})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "add to J"})).toBeInTheDocument();
    });

    it("marks titles shown in Swedish to an English reader as not translated", () => {
        useLocale.mockReturnValue("en");
        render(<GuideView version={guideVersion()}/>);

        const translated = screen.getByRole("heading", {name: "A. Chapter A"});
        const chapter = screen.getByRole("heading", {name: "B. Kapitel B"});
        const section = screen.getByRole("heading", {name: "Kalaslokal"});

        expect(translated.parentElement).not.toHaveTextContent("notTranslated");
        expect(chapter.parentElement).toHaveTextContent("notTranslated");
        expect(section.parentElement).toHaveTextContent("notTranslated");
    });

    it("marks no title in Swedish", () => {
        render(<GuideView version={guideVersion()}/>);

        expect(screen.getByRole("heading", {name: "B. Kapitel B"}).parentElement).not.toHaveTextContent("notTranslated");
    });
});
