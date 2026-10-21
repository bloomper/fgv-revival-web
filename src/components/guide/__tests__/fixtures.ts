import type {GuideVersionFieldsFragment} from "@/gql/graphql";

const PHASES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"] as const;

/**
 * A fictitious published version with one item of each type, some of it in English.
 */
export function guideVersion(overrides: Partial<GuideVersionFieldsFragment> = {}): GuideVersionFieldsFragment {
    return {
        id: "1",
        status: "PUBLISHED",
        label: "v1",
        note: null,
        publishedAt: "2026-11-01T10:00:00Z",
        publishedBy: "Sara Admin",
        version: 0,
        basedOn: null,
        introduction: {sv: "Välkommen till guiden.", en: null},
        chapters: PHASES.map(phase => ({
            id: `c-${phase}`,
            phase,
            title: {sv: `Kapitel ${phase}`, en: phase === "A" ? `Chapter ${phase}` : null},
            version: 0,
            items: phase === "A" ? [
                {id: "i1", key: "k-req", type: "REQUIREMENT", text: {sv: "Ett krav.", en: "A requirement."}, version: 0},
                {id: "i2", key: "k-text", type: "TEXT", text: {sv: "Löptext.", en: null}, version: 0},
            ] : [],
            sections: phase === "B" ? [{
                id: "s1", key: "s-kalas", title: {sv: "Kalaslokal", en: null}, version: 0,
                items: [
                    {id: "i3", key: "k-tip", type: "TIP", text: {sv: "Ett tips.", en: null}, version: 0},
                    {id: "i4", key: "k-question", type: "QUESTION", text: {sv: "En fråga?", en: null}, version: 0},
                ],
            }] : [],
        })),
        ...overrides,
    };
}
