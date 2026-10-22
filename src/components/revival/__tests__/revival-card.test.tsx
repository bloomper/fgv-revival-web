import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {RevivalCard} from "@/components/revival/revival-card.client";
import {revivalDetail} from "@/components/revival/__tests__/fixtures";

describe("RevivalCard", () => {
    it("shows the year once and the title without it", () => {
        render(<RevivalCard revival={revivalDetail({spex: {id: "1", title: "Ali Baba", year: 1987, available: true}})} role={null}/>);

        expect(screen.getByText("2028")).toBeInTheDocument();
        expect(screen.getByText("Ali Baba (1987)")).toBeInTheDocument();
        expect(screen.getByRole("link")).toHaveAccessibleName(expect.stringContaining("Ali Baba 2028"));
    });

    it("names the spex when the working title differs", () => {
        render(<RevivalCard revival={revivalDetail({workingTitle: "Sesam 2028", spex: {id: "1", title: "Ali Baba", year: 1987, available: true}})}
                            role={null}/>);

        expect(screen.getByText("Sesam")).toBeInTheDocument();
        expect(screen.getByText("Ali Baba").closest("[data-slot=card-description]")).toHaveTextContent("Ali Baba (1987)");
    });

    it("shows that the premiere is not set", () => {
        render(<RevivalCard revival={revivalDetail({premiereDate: null})} role={null}/>);

        expect(screen.getByText("Revival.notSet")).toBeInTheDocument();
    });
});
