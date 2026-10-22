import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {PlainText} from "@/components/plain-text";

describe("PlainText", () => {
    it("shows HTML and Markdown literally", () => {
        const {container} = render(<PlainText text={"<script>alert(1)</script> **fet** <b>x</b>"}/>);

        expect(container.querySelector("script")).toBeNull();
        expect(container.querySelector("b")).toBeNull();
        expect(container.querySelector("strong")).toBeNull();
        expect(container.textContent).toBe("<script>alert(1)</script> **fet** <b>x</b>");
    });

    it("makes http links clickable and safe", () => {
        render(<PlainText text="Se https://example.org/plan"/>);

        const link = screen.getByRole("link", {name: "https://example.org/plan"});

        expect(link).toHaveAttribute("href", "https://example.org/plan");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("does not link javascript URLs", () => {
        render(<PlainText text="javascript:alert(1)"/>);

        expect(screen.queryByRole("link")).toBeNull();
    });
});
