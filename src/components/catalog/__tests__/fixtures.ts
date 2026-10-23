/**
 * The lists the database starts with (fgv-revival-server migration V3_8), as GraphQL returns them.
 */
export const ITEM_TYPES = {
    TIP: {id: "TIP", kind: "TIP", name: {sv: "Praktiska tips", en: "Tip"}, retired: false},
    REQUIREMENT: {id: "REQUIREMENT", kind: "REQUIREMENT", name: {sv: "Krav", en: "Requirement"}, retired: false},
    QUESTION: {id: "QUESTION", kind: "QUESTION", name: {sv: "Att ta reda på", en: "To find out"}, retired: false},
    TEXT: {id: "TEXT", kind: "TEXT", name: {sv: "Text", en: "Text"}, retired: false},
} as const;

export const CAPABILITIES = {
    FINANCE: {id: "FINANCE", name: {sv: "Ekonomi", en: "Finance"}, retired: false},
    CATERING: {id: "CATERING", name: {sv: "Mat", en: "Catering"}, retired: false},
    STAFFING: {id: "STAFFING", name: {sv: "Bemanning", en: "Staffing"}, retired: false},
    COMMS: {id: "COMMS", name: {sv: "Kommunikation", en: "Communications"}, retired: false},
} as const;
