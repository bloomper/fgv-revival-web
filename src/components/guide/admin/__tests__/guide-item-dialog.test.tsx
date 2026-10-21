import {describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {GuideItemDialog} from "@/components/guide/admin/guide-item-dialog.client";
import {Button} from "@/components/ui/button";

vi.mock("next/navigation", () => ({useRouter: () => ({refresh: vi.fn()})}));

describe("GuideItemDialog", () => {
    function open(onSave = vi.fn().mockResolvedValue({ok: true, data: null})) {
        render(
            <GuideItemDialog trigger={<Button/>} heading="Edit" initial={{type: "TIP", text: {sv: "Ett **tips**.", en: null}}} onSave={onSave}>
                Open
            </GuideItemDialog>,
        );
        fireEvent.click(screen.getByRole("button", {name: "Open"}));
        return onSave;
    }

    it("refuses a blank Swedish text", async () => {
        const onSave = open();

        fireEvent.change(screen.getByLabelText("Guide.editor.swedish"), {target: {value: "  "}});
        fireEvent.click(screen.getByRole("button", {name: "Common.save"}));

        expect(await screen.findByText("Validation.guideTextRequired")).toBeInTheDocument();
        expect(onSave).not.toHaveBeenCalled();
    });

    it("saves the type and both texts, clearing a blank English text", async () => {
        const onSave = open();

        fireEvent.change(screen.getByLabelText("Guide.editor.type"), {target: {value: "REQUIREMENT"}});
        fireEvent.click(screen.getByRole("button", {name: "Common.save"}));

        await waitFor(() => expect(onSave).toHaveBeenCalledWith({type: "REQUIREMENT", text: {sv: "Ett **tips**.", en: null}}));
    });

    it("previews the Markdown as readers see it", () => {
        open();

        fireEvent.click(screen.getByRole("tab", {name: "Guide.editor.preview"}));

        expect(screen.getByTestId("guide-item-preview").querySelector("strong")).toHaveTextContent("tips");
    });
});
