import {describe, expect, it, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import {GuideItem} from "@/components/guide/guide-item";
import {pickText} from "@/components/guide/localized";

const useLocale = vi.hoisted(() => vi.fn(() => "sv"));

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => key,
    useLocale,
}));

const item = (en: string | null = null) => ({
    id: "1",
    key: "k1",
    type: "REQUIREMENT" as const,
    text: {sv: "Budget ska upprättas.", en},
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

        expect(screen.getByText("REQUIREMENT")).toBeInTheDocument();
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
        render(<GuideItem item={{...item(), type: "TEXT"}}/>);

        expect(screen.queryByText("TEXT")).not.toBeInTheDocument();
    });
});
