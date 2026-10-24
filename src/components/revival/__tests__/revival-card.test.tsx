import {describe, expect, it} from "vitest";
import {render, screen} from "@testing-library/react";
import {RevivalCard} from "@/components/revival/revival-card.client";
import {revivalDetail} from "@/components/revival/__tests__/fixtures";

describe("RevivalCard", () => {
    it("shows the year once, and the spex with its original year", () => {
        render(<RevivalCard revival={revivalDetail({spex: {id: "1", title: "Ali Baba", year: 1987, available: true}})} role={null}/>);

        expect(screen.getByText("2028")).toBeInTheDocument();
        expect(screen.getByText("Ali Baba").closest("[data-slot=card-title]")).toHaveTextContent("Ali Baba (1987)");
        expect(screen.getByRole("link")).toHaveAccessibleName(expect.stringContaining("Ali Baba 2028"));
    });

    it("shows that the premiere is not set", () => {
        render(<RevivalCard revival={revivalDetail({premiereDate: null})} role={null}/>);

        expect(screen.getByText("Revival.notSet")).toBeInTheDocument();
    });

    it("links the steering group to the revival and counts only its active members", () => {
        render(<RevivalCard revival={revivalDetail()} role="STEERING_GROUP"/>);

        expect(screen.getByRole("link")).toHaveAttribute("href", "/revivals/1");
        expect(screen.getByText(/Revival.memberCount/)).toBeInTheDocument();
    });

    it.each(["PARTICIPANT", "HELPER"] as const)("links a %s straight to their own page, without the member count", role => {
        render(<RevivalCard revival={revivalDetail()} role={role}/>);

        expect(screen.getByRole("link")).toHaveAttribute("href", "/revivals/1/me");
        expect(screen.queryByText(/Revival.memberCount/)).not.toBeInTheDocument();
        expect(screen.getByText(`Role.${role}`)).toBeInTheDocument();
    });
});
