import {describe, expect, it} from "vitest";
import {CombinedError} from "@urql/core";
import {GraphQLError} from "graphql";
import {auditReason, GraphQLRequestError, toActionResult, toRequestError} from "@/lib/graphql.server";

const error = (classification?: string, message = "Uppsättningen finns inte.") =>
    new CombinedError({graphQLErrors: [new GraphQLError(message, {extensions: classification ? {classification} : {}})]});

describe("GraphQL errors", () => {
    it("keep the server's code and message", () => {
        const result = toRequestError(error("NOT_FOUND"));

        expect(result.code).toBe("NOT_FOUND");
        expect(result.message).toBe("Uppsättningen finns inte.");
    });

    it("are internal errors when the code is unknown or missing", () => {
        expect(toRequestError(error("SOMETHING_NEW")).code).toBe("INTERNAL_ERROR");
        expect(toRequestError(error()).code).toBe("INTERNAL_ERROR");
        expect(toRequestError(error("MAIL_UNAVAILABLE")).code).toBe("MAIL_UNAVAILABLE");
        expect(toRequestError(new CombinedError({networkError: new Error("ECONNREFUSED")})).code).toBe("INTERNAL_ERROR");
    });

    it("become action results, while other errors are thrown", async () => {
        expect(await toActionResult(async () => 7)).toEqual({ok: true, data: 7});
        expect(await toActionResult(async () => {
            throw new GraphQLRequestError("CONFLICT", "Någon annan har ändrat detta.");
        })).toEqual({ok: false, code: "CONFLICT", message: "Någon annan har ändrat detta."});
        await expect(toActionResult(async () => {
            throw new TypeError("bug");
        })).rejects.toThrow("bug");
    });
});

describe("auditReason", () => {
    it("sends the reason encoded in a header, and nothing without one", () => {
        expect(auditReason("Rättade stavfel")).toEqual({fetchOptions: {headers: {"X-Audit-Reason": "R%C3%A4ttade%20stavfel"}}});
        expect(auditReason("")).toBeUndefined();
        expect(auditReason(null)).toBeUndefined();
    });
});
