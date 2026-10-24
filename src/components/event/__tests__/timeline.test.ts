import {describe, expect, it} from "vitest";
import {
    buildTimeline,
    defaultEndDate,
    formatEventDates,
    offsetRange,
    premiereDistance
} from "@/components/event/timeline";
import {addDays, daysBetween} from "@/lib/event/dates";

const event = (id: string, startDate: string, extra: Partial<Parameters<typeof buildTimeline>[0]["events"][number]> = {}) => ({
    id, title: `Händelse ${id}`, startDate, endDate: startDate, cancelled: false, ...extra,
});

describe("dates", () => {
    it("adds days across months and years", () => {
        expect(addDays("2027-12-31", 1)).toBe("2028-01-01");
        expect(addDays("2028-03-04", -70)).toBe("2027-12-25");
        expect(daysBetween("2028-03-04", "2027-12-25")).toBe(-70);
    });

    it("gives the default last day from the type's length", () => {
        expect(defaultEndDate("2028-01-01", 2)).toBe("2028-01-02");
        expect(defaultEndDate("2028-01-01", 1)).toBe("2028-01-01");
        expect(defaultEndDate("2028-01-01", 0)).toBe("2028-01-01");
    });
});

describe("formatEventDates", () => {
    it("shows one day, a range, and times when set", () => {
        expect(formatEventDates({startDate: "2028-01-01", endDate: "2028-01-01"})).toBe("2028-01-01");
        expect(formatEventDates({
            startDate: "2028-01-01",
            endDate: "2028-01-01",
            startTime: "18:00"
        })).toBe("2028-01-01 18:00");
        expect(formatEventDates({
            startDate: "2028-01-01",
            endDate: "2028-01-01",
            startTime: "18:00",
            endTime: "21:00"
        })).toBe("2028-01-01 18:00–21:00");
        expect(formatEventDates({startDate: "2028-01-01", endDate: "2028-01-02"})).toBe("2028-01-01 – 2028-01-02");
        expect(formatEventDates({startDate: "2028-01-01", endDate: "2028-01-02", startTime: "10:00", endTime: "16:00"}))
            .toBe("2028-01-01 10:00 – 2028-01-02 16:00");
    });
});

describe("premiereDistance", () => {
    it("rounds to whole weeks before and after the premiere", () => {
        expect(premiereDistance(null)).toBeNull();
        expect(premiereDistance(0)).toEqual({key: "premiereDay"});
        expect(premiereDistance(-3)).toEqual({key: "premiereWeek"});
        expect(premiereDistance(3)).toEqual({key: "premiereWeek"});
        expect(premiereDistance(-56)).toEqual({key: "weeksBefore", weeks: 8});
        expect(premiereDistance(-60)).toEqual({key: "weeksBefore", weeks: 9});
        expect(premiereDistance(14)).toEqual({key: "weeksAfter", weeks: 2});
    });
});

describe("offsetRange", () => {
    it("describes a type's offsets in weeks", () => {
        expect(offsetRange(null, null)).toEqual({key: "offsetNone"});
        expect(offsetRange(0, 0)).toEqual({key: "offsetPremiere"});
        expect(offsetRange(-120, -60)).toEqual({key: "offsetBefore", from: 17, to: 9});
        expect(offsetRange(7, 90)).toEqual({key: "offsetAfter", from: 1, to: 13});
        expect(offsetRange(-14, 14)).toEqual({key: "offsetAround", before: 2, after: 2});
    });
});

describe("buildTimeline", () => {
    it("groups events, shows, meetings and the premiere by month in date order", () => {
        const months = buildTimeline({
            premiereDate: "2028-03-04",
            events: [event("2", "2028-03-04", {
                startTime: "12:00",
                daysFromPremiere: 0
            }), event("1", "2028-01-01", {daysFromPremiere: -63})],
            shows: [{date: "2028-03-04", time: "19:00", venue: "Kårhuset"}, {
                date: "2028-03-05",
                time: null,
                venue: null
            }],
            meetings: [
                {id: "m1", date: "2028-01-15", title: "Direktionsmöte 4", status: "CLOSED"},
                {id: "m2", date: "2028-01-20", title: null, status: "CANCELLED"},
            ],
        });

        expect(months.map(month => month.month)).toEqual(["2028-01", "2028-03"]);
        expect(months[0].items.map(item => item.key)).toEqual(["event-1", "meeting-m1"]);
        expect(months[1].items.map(item => item.key)).toEqual(["premiere", "show-0", "event-2", "show-1"]);
        expect(months[0].items[1].daysFromPremiere).toBe(-49);
        expect(months[1].items[3].daysFromPremiere).toBe(1);
    });

    it("works without a premiere, with no distances", () => {
        const months = buildTimeline({
            events: [event("1", "2027-11-02")],
            shows: [],
            meetings: [{id: "m1", date: "2027-11-01", status: "PLANNED"}]
        });

        expect(months).toHaveLength(1);
        expect(months[0].items.map(item => [item.key, item.daysFromPremiere])).toEqual([["meeting-m1", null], ["event-1", null]]);
    });
});
