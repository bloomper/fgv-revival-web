import {z} from "zod";
import type {LibraryEntryInput, LibraryEntryKind} from "@/gql/graphql";
import {parseHttpsUrl} from "@/lib/material/hosts";

export const MAX_LIBRARY_NAME = 100;
export const MAX_LIBRARY_TEXT = 4000;
export const MAX_LIBRARY_URL = 500;

export const LIBRARY_KINDS = ["VENUE", "TICKET_SERVICE", "ROLE_DESCRIPTION", "CONTACT_ROLE"] as const satisfies readonly LibraryEntryKind[];

/**
 * The texts an entry of each kind has, in the order they are shown and edited.
 */
export const LIBRARY_TEXTS: Record<LibraryEntryKind, readonly LibraryTextKey[]> = {
    VENUE: ["description", "pros", "cons", "booking", "prices"],
    TICKET_SERVICE: ["description", "pros", "cons", "prices"],
    ROLE_DESCRIPTION: ["description"],
    CONTACT_ROLE: ["description", "contact"],
};

export type LibraryTextKey = "description" | "pros" | "cons" | "booking" | "prices" | "contact";

const id = z.string().min(1);
const localized = z.object({
    sv: z.string().trim().max(MAX_LIBRARY_TEXT, "libraryTextTooLong"),
    en: z.string().trim().max(MAX_LIBRARY_TEXT, "libraryTextTooLong"),
});

/**
 * The library entry sheet. Texts the kind does not have are sent empty, so they are cleared.
 */
export const libraryEntryValuesSchema = z.object({
    kind: z.enum(LIBRARY_KINDS),
    name: z.object({
        sv: z.string().trim().min(1, "catalogNameRequired").max(MAX_LIBRARY_NAME, "catalogNameTooLong"),
        en: z.string().trim().max(MAX_LIBRARY_NAME, "catalogNameTooLong"),
    }),
    description: localized,
    pros: localized,
    cons: localized,
    booking: localized,
    prices: localized,
    contact: localized,
    url: z.union([z.literal(""), z.string().trim().max(MAX_LIBRARY_URL, "libraryUrlTooLong")
        .refine(value => parseHttpsUrl(value) !== null, "urlHttpsRequired")]),
}).superRefine((values, ctx) => {
    for (const key of LIBRARY_TEXTS[values.kind]) {
        if (values[key].en && !values[key].sv) {
            ctx.addIssue({code: "custom", message: "swedishRequired", path: [key, "sv"]});
        }
    }
});

export type LibraryEntryValues = z.infer<typeof libraryEntryValuesSchema>;

export const libraryEntryCreateSchema = z.object({values: libraryEntryValuesSchema});
export const libraryEntryUpdateSchema = z.object({id, version: z.number().int().nonnegative(), values: libraryEntryValuesSchema});
export const libraryEntryTransitionSchema = z.object({id, version: z.number().int().nonnegative()});

/**
 * The GraphQL input: only the texts the kind has, each null without Swedish text.
 */
export function toLibraryEntryInput(values: LibraryEntryValues): LibraryEntryInput {
    const kept = LIBRARY_TEXTS[values.kind];
    const text = (key: LibraryTextKey) => kept.includes(key) && values[key].sv ? {sv: values[key].sv, en: values[key].en || null} : null;

    return {
        kind: values.kind,
        name: {sv: values.name.sv, en: values.name.en || null},
        description: text("description"),
        pros: text("pros"),
        cons: text("cons"),
        booking: text("booking"),
        prices: text("prices"),
        contact: text("contact"),
        url: values.url || null,
    };
}
