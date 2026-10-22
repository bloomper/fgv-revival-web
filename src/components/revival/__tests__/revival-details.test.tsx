import {describe, expect, it, vi} from "vitest";
import {render, screen} from "@testing-library/react";
import {RevivalDetails} from "@/components/revival/revival-details.client";
import {revivalDetail} from "@/components/revival/__tests__/fixtures";

vi.mock("@/app/(app)/revivals/[id]/actions.server", () => ({updateDetailsAction: vi.fn()}));
vi.mock("next/navigation", () => ({useRouter: () => ({refresh: vi.fn()})}));

describe("RevivalDetails", () => {
    it("has no edit controls without canEditDetails", () => {
        render(<RevivalDetails revival={revivalDetail()}/>);

        expect(screen.queryByRole("button", {name: "Revival.editDetails"})).not.toBeInTheDocument();
        expect(screen.getByText("Chalmers kårhus")).toBeInTheDocument();
    });

    it("offers editing with canEditDetails", () => {
        const revival = revivalDetail();

        render(<RevivalDetails revival={{...revival, permissions: {...revival.permissions, canEditDetails: true}}}/>);

        expect(screen.getByRole("button", {name: "Revival.editDetails"})).toBeInTheDocument();
    });

    it("shows that Spexregister is unavailable", () => {
        render(<RevivalDetails revival={revivalDetail({spex: {id: "1", title: null, year: null, available: false}})}/>);

        expect(screen.getByText("spexUnavailable")).toBeInTheDocument();
    });
});
