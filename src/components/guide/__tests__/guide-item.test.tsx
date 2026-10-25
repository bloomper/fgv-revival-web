import {describe, expect, it, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import {GuideItem} from "@/components/guide/guide-item";
import {pickText} from "@/components/guide/localized";
import {ITEM_TYPES} from "@/components/catalog/__tests__/fixtures";

const useLocale = vi.hoisted(() => vi.fn(() => "sv"));

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => key,
    useLocale,
}));

const item = (en: string | null = null) => ({
    id: "1",
    key: "k1",
    type: ITEM_TYPES.REQUIREMENT,
    text: {sv: "Budget ska upprättas.", en},
    libraryEntries: [] as { id: string; kind: "VENUE" | "TICKET_SERVICE" | "ROLE_DESCRIPTION" | "CONTACT_ROLE"; name: { sv: string; en: string | null }; retired: boolean }[],
    version: 0,
});

describe("pickText", () => {
    it("falls back to Swedish in English when there is no English text", () => {
        expect(pickText({sv: "Hej", en: null}, "en")).toEqual({text: "Hej", translated: false});
        expect(pickText({sv: "Hej", en: "Hi"}, "en")).toEqual({text: "Hi", translated: true});
        expect(pickText({sv: "Hej", en: "Hi"}, "sv")).toEqual({text: "Hej", translated: true});
    });
});

describe("GuideItem", () => {
    it("shows the type and the Swedish text", () => {
        render(<GuideItem item={item()}/>);

        expect(screen.getByText("Krav")).toBeInTheDocument();
        expect(screen.getByText("Budget ska upprättas.")).toBeInTheDocument();
        expect(screen.queryByText("notTranslated")).not.toBeInTheDocument();
    });

    it("marks Swedish text as not translated in English", () => {
        useLocale.mockReturnValue("en");
        render(<GuideItem item={item()}/>);

        expect(screen.getByText("Budget ska upprättas.")).toBeInTheDocument();
        expect(screen.getByText("notTranslated")).toBeInTheDocument();
    });

    it("shows English text in English when there is one", () => {
        useLocale.mockReturnValue("en");
        render(<GuideItem item={item("A budget must be set.")}/>);

        expect(screen.getByText("A budget must be set.")).toBeInTheDocument();
        expect(screen.queryByText("notTranslated")).not.toBeInTheDocument();
    });

    it("has no type badge for plain text", () => {
        useLocale.mockReturnValue("sv");
        render(<GuideItem item={{...item(), type: ITEM_TYPES.TEXT}}/>);

        expect(screen.queryByText("Text")).not.toBeInTheDocument();
    });

    it("links to the library entries it names", () => {
        useLocale.mockReturnValue("sv");
        render(<GuideItem item={{...item(), libraryEntries: [{id: "7", kind: "VENUE", name: {sv: "RunAn", en: null}, retired: false}]}}/>);

        expect(screen.getByRole("link", {name: /RunAn/})).toHaveAttribute("href", "/library#entry-7");
    });
});
