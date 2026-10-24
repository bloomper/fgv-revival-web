import {describe, expect, it} from "vitest";
import {render, screen, within} from "@testing-library/react";
import {MyMaterials} from "@/components/participation/my-materials";

describe("MyMaterials", () => {
    it("groups the materials by category in a fixed order, with the service or the host, opening in a new tab", () => {
        render(<MyMaterials materials={[
            {id: "1", title: "Inspelning 1988", url: "https://www.youtube.com/watch?v=1", service: {name: {sv: "YouTube", en: null}}, category: "RECORDING"},
            {id: "2", title: "Manus", url: "https://example.org/manus.pdf", category: "SCRIPT", comment: "Version 3"},
        ]}/>);

        expect(screen.getAllByRole("heading", {level: 4}).map(heading => heading.textContent)).toEqual(["categories.SCRIPT", "categories.RECORDING"]);
        const recording = screen.getByRole("link", {name: /Inspelning 1988/});

        expect(recording).toHaveAttribute("target", "_blank");
        expect(recording).toHaveAttribute("rel", "noopener noreferrer");
        expect(within(recording).getByText("YouTube")).toBeInTheDocument();
        expect(within(screen.getByRole("link", {name: /Manus/})).getByText("example.org")).toBeInTheDocument();
        expect(screen.getByText("Version 3")).toBeInTheDocument();
    });

    it("says when there is nothing for the participant", () => {
        render(<MyMaterials materials={[]}/>);

        expect(screen.getByText("mineNone")).toBeInTheDocument();
    });
});
