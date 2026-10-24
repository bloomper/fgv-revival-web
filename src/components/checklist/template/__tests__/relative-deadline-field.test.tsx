import {describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen} from "@testing-library/react";
import {RelativeDeadlineField} from "@/components/checklist/template/relative-deadline-field.client";
import {
    applyRelativeDeadline,
    type RelativeDeadlineValue,
    validRelativeDeadline
} from "@/lib/checklist/relative-deadline";

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Record<string, unknown>) => values ? `${key} ${JSON.stringify(values)}` : key,
    useFormatter: () => ({dateTime: (date: Date) => date.toISOString().slice(0, 10)}),
}));

describe("applyRelativeDeadline", () => {
    it.each([
        [{kind: "DAYS", amount: -14}, "2027-11-20", "2027-11-06"],
        [{kind: "DAYS", amount: -1}, "2028-03-01", "2028-02-29"],
        [{kind: "WORKING_DAYS", amount: -5}, "2027-11-20", "2027-11-15"],
        [{kind: "WORKING_DAYS", amount: 1}, "2027-12-31", "2028-01-03"],
        [{kind: "WEEKDAY_WEEK_BEFORE", weekday: "MONDAY"}, "2027-11-20", "2027-11-08"],
        [{kind: "WEEKDAY_WEEK_BEFORE", weekday: "SUNDAY"}, "2027-11-20", "2027-11-14"],
        [{kind: "WEEKDAY_WEEK_BEFORE", weekday: "MONDAY"}, "2027-01-04", "2026-12-28"],
    ] as [RelativeDeadlineValue, string, string][])("%o from %s is %s, as on the server", (deadline, date, expected) => {
        expect(applyRelativeDeadline(deadline, date)).toBe(expected);
    });

    it("checks the combination as the server does", () => {
        expect(validRelativeDeadline({kind: "DAYS", amount: 366})).toBe(false);
        expect(validRelativeDeadline({kind: "WEEKDAY_WEEK_BEFORE", amount: 1, weekday: "MONDAY"})).toBe(false);
        expect(validRelativeDeadline({kind: "WORKING_DAYS", amount: -365})).toBe(true);
    });
});

describe("RelativeDeadlineField", () => {
    it("shows a live example for the rule", () => {
        render(<RelativeDeadlineField value={{kind: "WEEKDAY_WEEK_BEFORE", weekday: "MONDAY"}}
                                      onChange={() => undefined} exampleDate="2027-11-20"/>);

        expect(screen.getByText('example {"date":"2027-11-20 2027-11-20","deadline":"2027-11-08 2027-11-08"}')).toBeInTheDocument();
    });

    it("keeps the sign from before or after when the amount changes", () => {
        const onChange = vi.fn();

        render(<RelativeDeadlineField value={{kind: "DAYS", amount: -3, weekday: null}} onChange={onChange}
                                      exampleDate="2027-11-20"/>);
        fireEvent.change(screen.getByLabelText("amount"), {target: {value: "14"}});
        expect(onChange).toHaveBeenLastCalledWith({kind: "DAYS", amount: -14, weekday: null});

        fireEvent.change(screen.getByLabelText("direction"), {target: {value: "after"}});
        expect(onChange).toHaveBeenLastCalledWith({kind: "DAYS", amount: 3, weekday: null});
    });

    it("switches kinds and clears the rule", () => {
        const onChange = vi.fn();

        render(<RelativeDeadlineField value={null} onChange={onChange}/>);
        expect(screen.queryByLabelText("amount")).toBeNull();

        fireEvent.change(screen.getByLabelText("kind"), {target: {value: "WEEKDAY_WEEK_BEFORE"}});
        expect(onChange).toHaveBeenLastCalledWith({kind: "WEEKDAY_WEEK_BEFORE", amount: null, weekday: "MONDAY"});
    });
});
