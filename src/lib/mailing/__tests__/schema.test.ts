import {describe, expect, it} from "vitest";
import {
    audienceValuesSchema,
    mailingTemplateValuesSchema,
    mailingValuesSchema,
    toAudienceInput,
    toMailingTemplateInput
} from "@/lib/mailing/schema";

describe("audienceValuesSchema", () => {
    it("asks for the position or the event the audience needs", () => {
        const issues = (values: object) => audienceValuesSchema.safeParse(values).error?.issues.map(issue => issue.message) ?? [];

        expect(issues({kind: "PARTICIPANTS", positionId: "", eventId: ""})).toEqual([]);
        expect(issues({kind: "POSITION", positionId: "", eventId: ""})).toEqual(["audiencePositionRequired"]);
        expect(issues({kind: "EVENT_ATTENDEES", positionId: "", eventId: ""})).toEqual(["audienceEventRequired"]);
    });

    it("sends only the position or event the kind uses", () => {
        expect(toAudienceInput({kind: "POSITION", positionId: "T-ORK", eventId: "3"})).toEqual({
            kind: "POSITION",
            positionId: "T-ORK",
            eventId: null
        });
        expect(toAudienceInput({
            kind: "EVENT_ATTENDEES",
            positionId: "T-ORK",
            eventId: "3"
        })).toEqual({kind: "EVENT_ATTENDEES", positionId: null, eventId: "3"});
        expect(toAudienceInput({kind: "HELPERS", positionId: "T-ORK", eventId: "3"})).toEqual({
            kind: "HELPERS",
            positionId: null,
            eventId: null
        });
    });
});

describe("mailingValuesSchema", () => {
    it("needs a subject and a body within their limits", () => {
        const audience = {kind: "CONFIRMED", positionId: "", eventId: ""};
        const issues = (values: object) => mailingValuesSchema.safeParse({audience, ...values}).error?.issues.map(issue => issue.message) ?? [];

        expect(issues({subject: "Allergier", body: "Svara **senast** måndag."})).toEqual([]);
        expect(issues({subject: " ", body: ""})).toEqual(["subjectRequired", "mailingBodyRequired"]);
        expect(issues({
            subject: "x".repeat(201),
            body: "x".repeat(20001)
        })).toEqual(["subjectTooLong", "mailingBodyTooLong"]);
    });
});

describe("mailingTemplateValuesSchema", () => {
    const values = {
        name: {sv: "Allergier", en: ""},
        subject: {sv: "Allergier inför rephelgen", en: "Allergies"},
        body: {sv: "Hej!", en: ""},
        audience: "EVENT_ATTENDEES" as const,
        eventTypeId: "3",
        due: {kind: "WEEKDAY_WEEK_BEFORE" as const, amount: null, weekday: "MONDAY" as const},
    };

    it("turns blank English texts and a blank event type into nulls", () => {
        expect(toMailingTemplateInput(mailingTemplateValuesSchema.parse({...values, eventTypeId: ""}))).toEqual({
            name: {sv: "Allergier", en: null},
            subject: {sv: "Allergier inför rephelgen", en: "Allergies"},
            body: {sv: "Hej!", en: null},
            audience: "EVENT_ATTENDEES",
            eventTypeId: null,
            due: {kind: "WEEKDAY_WEEK_BEFORE", amount: null, weekday: "MONDAY"},
        });
    });

    it("keeps an amount only for day rules", () => {
        expect(toMailingTemplateInput(mailingTemplateValuesSchema.parse({
            ...values,
            due: {kind: "DAYS", amount: -7, weekday: "MONDAY"}
        })).due)
            .toEqual({kind: "DAYS", amount: -7, weekday: null});
    });

    it("needs the Swedish texts", () => {
        const result = mailingTemplateValuesSchema.safeParse({
            ...values,
            name: {sv: "", en: "Allergies"},
            body: {sv: "", en: "Hi"}
        });

        expect(result.error?.issues.map(issue => issue.message)).toEqual(["catalogNameRequired", "mailingBodyRequired"]);
    });
});
