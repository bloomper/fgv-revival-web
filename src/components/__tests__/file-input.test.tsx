import {describe, expect, it, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {FileInput} from "@/components/file-input.client";

describe("FileInput", () => {
    it("says no file is chosen, then names the chosen file and reports it", async () => {
        const onChange = vi.fn();

        render(<><label htmlFor="cover">Omslag</label><FileInput id="cover" accept="image/*" onChange={onChange}/></>);

        expect(screen.getByText("noFileChosen")).toBeInTheDocument();
        await userEvent.upload(screen.getByLabelText("Omslag"), new File(["x"], "omslag.png", {type: "image/png"}));

        expect(screen.getByText("omslag.png")).toBeInTheDocument();
        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({name: "omslag.png"}));
    });

    it("shows the saved file and a custom label, and opens the picker from its button", async () => {
        render(<FileInput id="f" current="gammal.png" chooseLabel="Byt fil" onChange={vi.fn()}/>);
        const click = vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(() => undefined);

        expect(screen.getByText("gammal.png")).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", {name: "Byt fil"}));

        expect(click).toHaveBeenCalled();
        click.mockRestore();
    });

    it("can be disabled", () => {
        render(<FileInput id="f" disabled onChange={vi.fn()}/>);

        expect(screen.getByRole("button", {name: "chooseFile"})).toBeDisabled();
    });
});
