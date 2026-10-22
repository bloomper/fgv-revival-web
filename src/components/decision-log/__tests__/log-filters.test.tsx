import {describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen} from "@testing-library/react";
import {LogFilters} from "@/components/decision-log/log-filters.client";

const push = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
    useRouter: () => ({push}),
    usePathname: () => "/revivals/1/log",
}));
vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => key,
}));

describe("LogFilters", () => {
    it("adds a toggle to the URL", () => {
        render(<LogFilters filter={{open: true}} tags={[]} meetings={[]}/>);
        fireEvent.click(screen.getByRole("button", {name: "filter.overdue"}));

        expect(push).toHaveBeenLastCalledWith("/revivals/1/log?open=1&overdue=1");
    });

    it("removes a pressed toggle", () => {
        render(<LogFilters filter={{open: true}} tags={[]} meetings={[]}/>);
        expect(screen.getByRole("button", {name: "filter.open"})).toHaveAttribute("aria-pressed", "true");
        fireEvent.click(screen.getByRole("button", {name: "filter.open"}));

        expect(push).toHaveBeenLastCalledWith("/revivals/1/log");
    });

    it("combines types and tags", () => {
        render(<LogFilters filter={{types: ["TODO"]}} tags={["lokal", "budget"]} meetings={[]}/>);
        fireEvent.click(screen.getByRole("button", {name: "type.QUESTION"}));
        expect(push).toHaveBeenLastCalledWith("/revivals/1/log?type=TODO%2CQUESTION");

        fireEvent.click(screen.getByRole("button", {name: "budget"}));
        expect(push).toHaveBeenLastCalledWith("/revivals/1/log?type=TODO&tag=budget");
    });

    it("filters by meeting", () => {
        render(<LogFilters filter={{open: true}} tags={[]} meetings={[{id: "5", date: "2026-10-19", title: "Direktionsmöte 4"}]}/>);
        fireEvent.change(screen.getByRole("combobox"), {target: {value: "5"}});

        expect(push).toHaveBeenLastCalledWith("/revivals/1/log?open=1&meeting=5");
        expect(screen.getByRole("option", {name: "2026-10-19 Direktionsmöte 4"})).toBeInTheDocument();
    });

    it("searches text", () => {
        render(<LogFilters filter={{}} tags={[]} meetings={[]}/>);
        fireEvent.change(screen.getByLabelText("search", {selector: "input"}), {target: {value: " RunAn "}});
        fireEvent.submit(screen.getByLabelText("search", {selector: "input"}).closest("form")!);

        expect(push).toHaveBeenLastCalledWith("/revivals/1/log?q=RunAn");
    });
});
