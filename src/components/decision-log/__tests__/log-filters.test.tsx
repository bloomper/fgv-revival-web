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

async function pick(filter: string, option: string) {
    fireEvent.click(screen.getByRole("button", {name: new RegExp(`^${filter}`)}));
    fireEvent.click(await screen.findByRole("button", {name: option}));
}

describe("LogFilters", () => {
    it("adds a quick filter to the URL", async () => {
        render(<LogFilters filter={{open: true}} tags={[]} meetings={[]}/>);
        await pick("Log.filter.show", "Log.filter.overdue");

        expect(push).toHaveBeenLastCalledWith("/revivals/1/log?open=1&overdue=1");
    });

    it("removes a selected quick filter", async () => {
        render(<LogFilters filter={{open: true}} tags={[]} meetings={[]}/>);
        await pick("Log.filter.show", "Log.filter.open");

        expect(push).toHaveBeenLastCalledWith("/revivals/1/log");
    });

    it("combines types and tags", async () => {
        render(<LogFilters filter={{types: ["TODO"]}} tags={["lokal", "budget"]} meetings={[]}/>);
        await pick("Log.typeLabel", "Log.type.QUESTION");
        expect(push).toHaveBeenLastCalledWith("/revivals/1/log?type=TODO%2CQUESTION");

        fireEvent.keyDown(document.activeElement ?? document.body, {key: "Escape"});
        await pick("Log.tags", "budget");
        expect(push).toHaveBeenLastCalledWith("/revivals/1/log?type=TODO&tag=budget");
    });

    it("filters by one meeting at a time", async () => {
        render(<LogFilters filter={{open: true, meetingId: "4"}} tags={[]}
                           meetings={[{id: "4", date: "2026-09-01"}, {
                               id: "5",
                               date: "2026-10-19",
                               title: "Direktionsmöte 4"
                           }]}/>);
        await pick("Log.filter.meeting", "2026-10-19 Direktionsmöte 4");

        expect(push).toHaveBeenLastCalledWith("/revivals/1/log?open=1&meeting=5");
    });

    it("searches text", () => {
        render(<LogFilters filter={{}} tags={[]} meetings={[]}/>);
        fireEvent.change(screen.getByLabelText("Log.search", {selector: "input"}), {target: {value: " RunAn "}});
        fireEvent.submit(screen.getByLabelText("Log.search", {selector: "input"}).closest("form")!);

        expect(push).toHaveBeenLastCalledWith("/revivals/1/log?q=RunAn");
    });

    it("resets every filter", () => {
        render(<LogFilters filter={{mine: true, text: "lokal"}} tags={[]} meetings={[]}/>);
        fireEvent.click(screen.getByRole("button", {name: "Common.reset"}));

        expect(push).toHaveBeenLastCalledWith("/revivals/1/log");
    });
});
