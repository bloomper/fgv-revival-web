import {describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen} from "@testing-library/react";
import {OwnerLabel} from "@/components/owner/owner-label";
import {OwnerField} from "@/components/owner/owner-field.client";

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => key,
}));

const members = [{id: "11", displayName: "Kim Svensson"}, {id: "12", displayName: "Robin Ek"}];

describe("OwnerLabel", () => {
    it("shows a member by display name", () => {
        render(<OwnerLabel owner={{person: {id: "11", displayName: "Kim Svensson", active: true}}}/>);

        expect(screen.getByText("Kim Svensson")).toBeInTheDocument();
        expect(screen.queryByText("formerMember")).toBeNull();
    });

    it("marks a former member", () => {
        render(<OwnerLabel owner={{person: {id: "11", displayName: "Kim Svensson", active: false}}}/>);

        expect(screen.getByText("formerMember")).toBeInTheDocument();
    });

    it("marks a free-text name as not a member", () => {
        render(<OwnerLabel owner={{name: "Sam på lokalen"}}/>);

        expect(screen.getByText("Sam på lokalen")).toBeInTheDocument();
        expect(screen.getByText("notMember")).toBeInTheDocument();
    });

    it("shows no owner", () => {
        render(<OwnerLabel owner={null}/>);

        expect(screen.getByText("none")).toBeInTheDocument();
    });
});

describe("OwnerField", () => {
    it("picks a member", () => {
        const onChange = vi.fn();

        render(<OwnerField members={members} value={null} onChange={onChange}/>);
        fireEvent.change(screen.getByLabelText("label"), {target: {value: "12"}});

        expect(onChange).toHaveBeenCalledWith({personId: "12"});
    });

    it("clears the owner", () => {
        const onChange = vi.fn();

        render(<OwnerField members={members} value={{personId: "12"}} onChange={onChange}/>);
        fireEvent.change(screen.getByLabelText("label"), {target: {value: ""}});

        expect(onChange).toHaveBeenCalledWith(null);
    });

    it("takes a free-text name of at most 100 characters", () => {
        const onChange = vi.fn();
        const {rerender} = render(<OwnerField members={members} value={null} onChange={onChange}/>);

        fireEvent.change(screen.getByLabelText("label"), {target: {value: "__other"}});
        expect(onChange).toHaveBeenLastCalledWith({name: ""});

        rerender(<OwnerField members={members} value={{name: ""}} onChange={onChange}/>);
        const input = screen.getByLabelText("name");

        expect(input).toHaveAttribute("maxLength", "100");
        fireEvent.change(input, {target: {value: "Sam"}});
        expect(onChange).toHaveBeenLastCalledWith({name: "Sam"});
    });
});
