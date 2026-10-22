import {describe, expect, it} from "vitest";
import {filterRevivals, REVIVAL_STATUSES} from "@/components/revival/revival-filter.client";
import {revivalDetail} from "@/components/revival/__tests__/fixtures";
import type {RevivalStatus} from "@/gql/graphql";

const aliBaba = revivalDetail({id: "1", title: "Ali Baba 2028", year: 2028, status: "ORGANISING"});
const sesam = revivalDetail({id: "2", title: "Sesam 2031", year: 2031, status: "PROPOSED",
    spex: {id: "2", title: "Ali Baba", year: 1956, available: true}});
const all = new Set<RevivalStatus>(REVIVAL_STATUSES);

describe("filterRevivals", () => {
    it("matches every word in the titles and years, ignoring case", () => {
        expect(filterRevivals([aliBaba, sesam], "baba 2028", all)).toEqual([aliBaba]);
        expect(filterRevivals([aliBaba, sesam], "ALI 1987", all)).toEqual([aliBaba]);
        expect(filterRevivals([aliBaba, sesam], "ali baba", all)).toEqual([aliBaba, sesam]);
    });

    it("keeps only the selected statuses", () => {
        expect(filterRevivals([aliBaba, sesam], "", new Set<RevivalStatus>(["PROPOSED"]))).toEqual([sesam]);
        expect(filterRevivals([aliBaba, sesam], "", new Set<RevivalStatus>())).toEqual([]);
    });
});
