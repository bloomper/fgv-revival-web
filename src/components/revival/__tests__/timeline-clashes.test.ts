import {describe, expect, it} from "vitest";
import {buildCrossTimeline, isoWeek} from "@/components/revival/timeline-clashes";

describe("isoWeek", () => {
    it("numbers weeks from Monday, with week 1 holding the first Thursday", () => {
        expect(isoWeek("2028-03-04")).toBe("2028-W09");
        expect(isoWeek("2028-03-05")).toBe("2028-W09");
        expect(isoWeek("2028-03-06")).toBe("2028-W10");
        expect(isoWeek("2027-01-01")).toBe("2026-W53");
        expect(isoWeek("2024-12-30")).toBe("2025-W01");
    });
});

describe("buildCrossTimeline", () => {
    const aliBaba = {
        id: "1",
        title: "Ali Baba 2028",
        status: "OPEN",
        shows: [{date: "2028-03-04", time: "19:00", venue: "Kårhuset"}, {date: "2028-03-11"}]
    };
    const snorre = {id: "3", title: "Snorre 2028", status: "ORGANISING", shows: [{date: "2028-03-05"}]};
    const nobel = {id: "2", title: "Nobel 2028", status: "REJECTED", shows: [{date: "2028-03-11"}]};

    it("flags two revivals playing the same show weekend", () => {
        const {months, clashes} = buildCrossTimeline([aliBaba, snorre], []);

        expect(clashes).toEqual([{week: "2028-W09", revivals: ["Ali Baba 2028", "Snorre 2028"], spex: []}]);
        expect(months).toHaveLength(1);
        expect(months[0].items.map(item => [item.date, item.clash])).toEqual([["2028-03-04", true], ["2028-03-05", true], ["2028-03-11", false]]);
    });

    it("flags a revival playing when the Chalmersspex does, not two shows of one revival", () => {
        const {clashes} = buildCrossTimeline([aliBaba], [{
            id: "s1",
            date: "2028-03-10",
            label: "Chalmersspexet: premiär"
        }]);

        expect(clashes).toEqual([{week: "2028-W10", revivals: ["Ali Baba 2028"], spex: ["Chalmersspexet: premiär"]}]);
    });

    it("leaves out rejected revivals and groups by month in date order", () => {
        const {months, clashes} = buildCrossTimeline([nobel, aliBaba], [{
            id: "s2",
            date: "2028-02-20",
            label: "Chalmersspexet"
        }]);

        expect(clashes).toEqual([]);
        expect(months.map(month => month.month)).toEqual(["2028-02", "2028-03"]);
        expect(months[1].items.every(item => item.kind === "show" && item.revivalId === "1")).toBe(true);
    });
});
