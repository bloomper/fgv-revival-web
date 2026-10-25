import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {GuideMarkdown} from "@/components/guide/guide-markdown";

describe("GuideMarkdown", () => {
    it("shows raw HTML as text, never as elements", () => {
        const {container} = render(<GuideMarkdown>{"Se <b>här</b> och <script>alert(1)</script>"}</GuideMarkdown>);

        expect(container.querySelector("b")).toBeNull();
        expect(container.querySelector("script")).toBeNull();
        expect(container.textContent).toContain("<b>");
        expect(container.textContent).toContain("<script>");
    });

    it("drops images", () => {
        const {container} = render(<GuideMarkdown>{"Före ![x](https://example.org/x.png) efter"}</GuideMarkdown>);

        expect(container.querySelector("img")).toBeNull();
        expect(container.innerHTML).not.toContain("example.org");
    });

    it("renders headings and code as plain text", () => {
        const {container} = render(<GuideMarkdown>{"# Rubrik\n\n`kod`"}</GuideMarkdown>);

        expect(container.querySelector("h1")).toBeNull();
        expect(container.querySelector("code")).toBeNull();
        expect(container.textContent).toContain("Rubrik");
        expect(container.textContent).toContain("kod");
    });

    it("renders emphasis, lists and links", () => {
        const {container} = render(
            <GuideMarkdown>{"**Krav** och *tips*\n\n- ett\n- två\n\n[fgv.nu](https://fgv.example.org)"}</GuideMarkdown>,
        );

        expect(container.querySelector("strong")).toHaveTextContent("Krav");
        expect(container.querySelector("em")).toHaveTextContent("tips");
        expect(container.querySelectorAll("li")).toHaveLength(2);
        expect(screen.getByRole("link", {name: "fgv.nu"})).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("shows links that are not http(s) or mailto as text", () => {
        const {container} = render(
            <GuideMarkdown>{"[ett](javascript:alert(1)) [två](data:text/html,x) [tre](/relativ) [fyra](mailto:a@example.org)"}</GuideMarkdown>,
        );

        expect(container.querySelectorAll("a")).toHaveLength(1);
        expect(screen.getByRole("link", {name: "fyra"})).toHaveAttribute("href", "mailto:a@example.org");
        expect(container.innerHTML).not.toContain("javascript:");
        expect(container.innerHTML).not.toContain("data:");
        expect(container.textContent).toContain("ett");
    });
});
