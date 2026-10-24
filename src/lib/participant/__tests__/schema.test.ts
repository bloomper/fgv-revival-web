import {describe, expect, it} from "vitest";
import {
    participantEditSchemaFor,
    participantUpdateSchema,
    participationSettingsValuesSchema,
    pendingPersonValuesSchema,
    type RespondValues,
    respondValuesSchema,
} from "@/lib/participant/schema";

const messages = (result: { success: boolean; error?: { issues: { message: string; path: PropertyKey[] }[] } }) =>
    result.success ? [] : result.error!.issues.map(issue => `${String(issue.path[0])}:${issue.message}`);

const answer = (values: Partial<RespondValues>) => respondValuesSchema.safeParse({
    response: "", preferredPositionId: "", comment: "", termsAccepted: false, registerConsent: "", ...values,
});

describe("respondValuesSchema", () => {
    it("asks for an answer", () => {
        expect(messages(answer({}))).toEqual(["response:responseRequired"]);
    });

    it("requires accepting the terms and answering the consent question for yes", () => {
        expect(messages(answer({response: "YES"}))).toEqual(["termsAccepted:termsRequired", "registerConsent:registerConsentRequired"]);
        expect(messages(answer({response: "YES", termsAccepted: true, registerConsent: "no"}))).toEqual([]);
    });

    it("asks the consent question but not the terms for maybe", () => {
        expect(messages(answer({response: "MAYBE"}))).toEqual(["registerConsent:registerConsentRequired"]);
        expect(messages(answer({response: "MAYBE", registerConsent: "yes"}))).toEqual([]);
    });

    it("asks nothing more for no", () => {
        expect(messages(answer({response: "NO"}))).toEqual([]);
    });

    it("limits the comment to 1000 characters", () => {
        expect(messages(answer({response: "NO", comment: "x".repeat(1001)}))).toEqual(["comment:participantCommentTooLong"]);
    });
});

describe("pendingPersonValuesSchema", () => {
    const person = {kind: "PARTICIPANT" as const, firstName: "Disa", lastName: "Deltagare", email: "", phone: "", positionId: "", compensationPerShift: ""};

    it("requires an email address for a participant", () => {
        expect(messages(pendingPersonValuesSchema.safeParse(person))).toEqual(["email:participantEmailRequired"]);
        expect(messages(pendingPersonValuesSchema.safeParse({...person, email: "disa@example.org"}))).toEqual([]);
    });

    it("takes email or phone for a helper", () => {
        expect(messages(pendingPersonValuesSchema.safeParse({...person, kind: "HELPER"}))).toEqual(["phone:helperContactRequired"]);
        expect(messages(pendingPersonValuesSchema.safeParse({...person, kind: "HELPER", phone: "070-123 45 67"}))).toEqual([]);
    });

    it("checks names, the email address and the compensation", () => {
        expect(messages(pendingPersonValuesSchema.safeParse({...person, firstName: " ", email: "nope"})))
            .toEqual(["firstName:firstNameRequired", "email:emailInvalid"]);
        expect(messages(pendingPersonValuesSchema.safeParse({...person, kind: "HELPER", phone: "0701234567", compensationPerShift: "150 000"})))
            .toEqual(["compensationPerShift:amountOutOfRange"]);
    });
});

describe("participationSettingsValuesSchema", () => {
    const settings = {swishNumber: "", whatsappLink: "", terms: ""};

    it("takes ten digits as the Swish number, with spaces and dashes", () => {
        expect(messages(participationSettingsValuesSchema.safeParse({...settings, swishNumber: "123 456-78 90"}))).toEqual([]);
        expect(messages(participationSettingsValuesSchema.safeParse({...settings, swishNumber: "12345"}))).toEqual(["swishNumber:swishNumberInvalid"]);
    });

    it("takes only WhatsApp group invite links", () => {
        expect(messages(participationSettingsValuesSchema.safeParse({...settings, whatsappLink: "https://chat.whatsapp.com/AbC123"}))).toEqual([]);
        expect(messages(participationSettingsValuesSchema.safeParse({...settings, whatsappLink: "https://example.org/group"})))
            .toEqual(["whatsappLink:whatsappLinkInvalid"]);
    });
});

describe("participantEditSchemaFor", () => {
    const values = {
        positionId: "", roleName: "", vocalPartId: "", fee: "", revivalFee: true, compensationPerShift: "",
        firstName: "Disa", lastName: "Deltagare", email: "disa@example.org", phone: "",
    };

    it("lets a pending person's email or phone be cleared while the contact rule holds", () => {
        expect(messages(participantEditSchemaFor("PARTICIPANT", true).safeParse({...values, email: ""}))).toEqual(["email:participantEmailRequired"]);
        expect(messages(participantEditSchemaFor("HELPER", true).safeParse({...values, email: "", phone: "070-123 45 67"}))).toEqual([]);
        expect(messages(participantEditSchemaFor("HELPER", true).safeParse({...values, email: "", phone: ""}))).toEqual(["phone:helperContactRequired"]);
        // A spexare's contact details are not edited here
        expect(messages(participantEditSchemaFor("PARTICIPANT", false).safeParse({...values, firstName: "", lastName: "", email: ""}))).toEqual([]);
    });

    it("checks the same on the server side", () => {
        const input = {revivalId: "1", id: "p1", version: 0, pending: true, kind: "PARTICIPANT" as const, hasRole: false};

        expect(participantUpdateSchema.safeParse({...input, values: {...values, email: ""}}).error?.issues.map(issue => issue.path.join(".")))
            .toEqual(["values.email"]);
        expect(participantUpdateSchema.safeParse({...input, values}).success).toBe(true);
    });
});
