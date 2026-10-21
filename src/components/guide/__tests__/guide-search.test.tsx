import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {act, fireEvent, render, screen} from "@testing-library/react";
import {GuideSearch} from "@/components/guide/guide-search.client";

const searchGuideAction = vi.hoisted(() => vi.fn());

vi.mock("@/app/(app)/guide/actions.server", () => ({searchGuideAction}));

const hit = {
    kind: "ITEM", phase: "B", chapterTitle: {sv: "Boka lokaler", en: null}, sectionKey: "s-kalas", sectionTitle: {sv: "Kalaslokal", en: null},
    itemKey: "k-tip", itemType: "TIP", snippet: "Kontrollera sprittillstånd i vald lokal.", matchedLanguage: "sv",
};

describe("GuideSearch", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        searchGuideAction.mockReset();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    async function type(value: string) {
        fireEvent.change(screen.getByRole("searchbox", {name: "placeholder"}), {target: {value}});
        await act(async () => {
            await vi.advanceTimersByTimeAsync(350);
        });
    }

    it("lists hits with their place, linking to the item", async () => {
        searchGuideAction.mockResolvedValue({ok: true, data: [hit]});
        render(<GuideSearch versionId="1"/>);

        await type("sprit");

        expect(searchGuideAction).toHaveBeenCalledWith("1", "sprit");
        expect(screen.getByRole("link", {name: /sprittillstånd/})).toHaveAttribute("href", "#item-k-tip");
        expect(screen.getByText("B. Boka lokaler")).toBeInTheDocument();
        expect(screen.getByText("› Kalaslokal")).toBeInTheDocument();
    });

    it("says so when nothing matches", async () => {
        searchGuideAction.mockResolvedValue({ok: true, data: []});
        render(<GuideSearch versionId="1"/>);

        await type("finns inte");

        expect(screen.getByText("noHits")).toBeInTheDocument();
    });

    it("does not search for a single character", async () => {
        render(<GuideSearch versionId="1"/>);

        await type("a");

        expect(searchGuideAction).not.toHaveBeenCalled();
    });
});
