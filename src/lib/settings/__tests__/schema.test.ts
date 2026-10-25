import {describe, expect, it} from "vitest";
import {applicationSettingsValuesSchema, toApplicationSettingsInput} from "@/lib/settings/schema";

describe("application settings", () => {
    it("reads the fee as typed, and none when blank", () => {
        expect(toApplicationSettingsInput({terms: {sv: "", en: ""}, defaultParticipationFee: "1 200,50"}))
            .toEqual({terms: null, defaultParticipationFee: "1200.50"});
        expect(toApplicationSettingsInput({terms: {sv: "Villkor", en: ""}, defaultParticipationFee: ""}))
            .toEqual({terms: {sv: "Villkor", en: null}, defaultParticipationFee: null});
    });

    it("refuses English terms without Swedish ones, and a fee that is not an amount", () => {
        expect(applicationSettingsValuesSchema.safeParse({terms: {sv: "", en: "Terms"}, defaultParticipationFee: ""}).success).toBe(false);
        expect(applicationSettingsValuesSchema.safeParse({terms: {sv: "", en: ""}, defaultParticipationFee: "tolv"}).success).toBe(false);
    });
});
