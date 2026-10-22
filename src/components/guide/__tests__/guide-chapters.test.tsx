import {describe, expect, it} from "vitest";
import {fireEvent, render, screen, within} from "@testing-library/react";
import {chapterNumbers, navChapters} from "@/components/guide/chapters";
import {GuideChapterNav} from "@/components/guide/guide-chapter-nav.client";
import {GuideChapterPager} from "@/components/guide/guide-chapter-pager";
import {GuideOverview} from "@/components/guide/guide-overview";
import {guideVersion} from "@/components/guide/__tests__/fixtures";

describe("the guide's chapters", () => {
    it("are listed on the start page after the introduction, each linking to its page", () => {
        render(<GuideOverview version={guideVersion()} basePath="/guide" query="?version=1"/>);

        const list = screen.getByRole("region", {name: "chapters"});

        expect(screen.getByText("Välkommen till guiden.")).toBeInTheDocument();
        expect(within(list).getAllByRole("link")).toHaveLength(10);
        expect(within(list).getByRole("link", {name: /Kapitel B/})).toHaveAttribute("href", "/guide/B?version=1");
        expect(within(list).getByRole("link", {name: /Kapitel B/})).toHaveTextContent('chapterContents:{"sections":1,"items":2}');
    });

    it("say so when there are none", () => {
        render(<GuideOverview version={guideVersion({chapters: []})} basePath="/guide"/>);

        expect(screen.getByText("noChapters")).toBeInTheDocument();
    });

    it("are numbered by their place", () => {
        expect(chapterNumbers(guideVersion())).toMatchObject({A: 1, B: 2, J: 10});
    });

    it("are in a list beside the text, with the current chapter's sections, and in a bar on phones", () => {
        render(<GuideChapterNav chapters={navChapters(guideVersion())} current="B" basePath="/revivals/7/guide"/>);

        const beside = screen.getByRole("navigation", {name: "chapters"});

        expect(within(beside).getAllByRole("link")).toHaveLength(11);
        expect(within(beside).getByRole("link", {current: "page"})).toHaveAttribute("href", "/revivals/7/guide/B");
        expect(within(beside).getByRole("link", {name: "Kalaslokal"})).toHaveAttribute("href", "#section-s-kalas");
        expect(screen.getByRole("button", {name: /chapterOf.*Kapitel B/})).toHaveTextContent('chapterOf:{"number":2,"count":10}');
    });

    it("open from the bar on phones", async () => {
        render(<GuideChapterNav chapters={navChapters(guideVersion())} current="B" basePath="/guide"/>);

        fireEvent.click(screen.getByRole("button", {name: /chapterOf/}));

        const sheet = await screen.findByRole("dialog");

        expect(within(sheet).getAllByRole("link", {name: /Kapitel/})).toHaveLength(10);
    });

    it("lead to the previous and the next one", () => {
        const chapters = navChapters(guideVersion());
        const {rerender} = render(<GuideChapterPager chapters={chapters} current="B" basePath="/guide"/>);

        expect(screen.getByRole("link", {name: /previousChapter/})).toHaveAttribute("href", "/guide/A");
        expect(screen.getByRole("link", {name: /nextChapter/})).toHaveAttribute("href", "/guide/C");

        rerender(<GuideChapterPager chapters={chapters} current="J" basePath="/guide"/>);
        expect(screen.queryByRole("link", {name: /nextChapter/})).not.toBeInTheDocument();
    });
});
