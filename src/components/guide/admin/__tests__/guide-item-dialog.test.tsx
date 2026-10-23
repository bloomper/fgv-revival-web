import {describe, expect, it, vi} from "vitest";
import {cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import {GuideItemDialog} from "@/components/guide/admin/guide-item-dialog.client";
import {Button} from "@/components/ui/button";
import {CatalogProvider} from "@/components/catalog/catalog-provider.client";
import {ITEM_TYPES} from "@/components/catalog/__tests__/fixtures";

vi.mock("next/navigation", () => ({useRouter: () => ({refresh: vi.fn()})}));

const retired = {id: "OLD", kind: "TIP", name: {sv: "Gammal typ", en: null}, retired: true} as const;
const types = [ITEM_TYPES.TIP, ITEM_TYPES.REQUIREMENT, ITEM_TYPES.QUESTION, ITEM_TYPES.TEXT, retired];

describe("GuideItemDialog", () => {
    function open(onSave = vi.fn().mockResolvedValue({ok: true, data: null})) {
        render(
            <CatalogProvider itemTypes={types}>
                <GuideItemDialog trigger={<Button/>} heading="Edit" initial={{type: ITEM_TYPES.TIP, text: {sv: "Ett **tips**.", en: null}}} onSave={onSave}>
                    Open
                </GuideItemDialog>
            </CatalogProvider>,
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

    it("opens blank again after adding an item", async () => {
        const onSave = vi.fn().mockResolvedValue({ok: true, data: null});
        render(<CatalogProvider itemTypes={types}><GuideItemDialog trigger={<Button/>} heading="Add" onSave={onSave}>Open</GuideItemDialog></CatalogProvider>);

        fireEvent.click(screen.getByRole("button", {name: "Open"}));
        fireEvent.change(screen.getByLabelText("Guide.editor.type"), {target: {value: "REQUIREMENT"}});
        fireEvent.change(screen.getByLabelText("Guide.editor.swedish"), {target: {value: "Första"}});
        fireEvent.click(screen.getByRole("button", {name: "Common.save"}));
        await waitFor(() => expect(screen.queryByLabelText("Guide.editor.swedish")).not.toBeInTheDocument());

        fireEvent.click(screen.getByRole("button", {name: "Open"}));

        expect(screen.getByLabelText("Guide.editor.swedish")).toHaveValue("");
        expect(screen.getByLabelText("Guide.editor.type")).toHaveValue("TIP");
    });

    it("offers the active types, and a retired one only to the item that has it", () => {
        open();

        expect([...(screen.getByLabelText("Guide.editor.type") as HTMLSelectElement).options].map(option => option.textContent))
            .toEqual(["Praktiska tips", "Krav", "Att ta reda på", "Text"]);
        cleanup();

        render(
            <CatalogProvider itemTypes={types}>
                <GuideItemDialog trigger={<Button/>} heading="Edit" initial={{type: retired, text: {sv: "Gammalt.", en: null}}} onSave={vi.fn()}>Open</GuideItemDialog>
            </CatalogProvider>,
        );
        fireEvent.click(screen.getByRole("button", {name: "Open"}));

        const select = screen.getByLabelText("Guide.editor.type") as HTMLSelectElement;

        expect(select).toHaveValue("OLD");
        expect([...select.options].map(option => option.textContent)).toContain('retiredName:{"name":"Gammal typ"}');
    });

    it("previews the Markdown as readers see it", () => {
        open();

        fireEvent.click(screen.getByRole("tab", {name: "Guide.editor.preview"}));

        expect(screen.getByTestId("guide-item-preview").querySelector("strong")).toHaveTextContent("tips");
    });
});
