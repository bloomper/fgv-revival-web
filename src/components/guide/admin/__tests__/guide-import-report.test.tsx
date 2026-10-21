import {describe, expect, it} from "vitest";
import {render, screen, within} from "@testing-library/react";
import {GuideImportReport} from "@/components/guide/admin/guide-import-report";

const counts = (sections: number, tips: number) => ({sections, tips, requirements: 1, questions: 0, texts: 2});

const report = (warnings: { code: "IMAGE" | "TABLE" | "UNKNOWN_LABEL", phase: "A" | "B" | null, sectionTitle: string | null, detail: string | null }[]) => ({
    fileName: "guide.docx",
    createdAt: "2026-10-21T10:00:00Z",
    totals: counts(3, 5),
    chapters: [{phase: "A" as const, counts: counts(1, 2)}, {phase: "B" as const, counts: counts(2, 3)}],
    warnings,
});

describe("GuideImportReport", () => {
    it("shows the counts per chapter and in total", () => {
        render(<GuideImportReport report={report([])}/>);

        const rows = screen.getAllByRole("row");

        expect(rows).toHaveLength(4);
        expect(within(rows[1]).getAllByRole("cell").map(cell => cell.textContent)).toEqual(["A", "1", "2", "1", "0", "2"]);
        expect(within(rows[3]).getAllByRole("cell").map(cell => cell.textContent)).toEqual(["total", "3", "5", "1", "0", "2"]);
        expect(screen.getByText("noWarnings")).toBeInTheDocument();
    });

    it("names each warning with its chapter and section", () => {
        render(<GuideImportReport report={report([
            {code: "IMAGE", phase: "B", sectionTitle: "Tidslinjen", detail: null},
            {code: "TABLE", phase: "A", sectionTitle: null, detail: null},
            {code: "UNKNOWN_LABEL", phase: "B", sectionTitle: "Kalaslokal", detail: "Checklista för mötet"},
            {code: "IMAGE", phase: null, sectionTitle: null, detail: null},
        ])}/>);

        const warnings = screen.getAllByRole("listitem").map(item => item.textContent);

        expect(warnings).toEqual([
            `warning.IMAGE:{"detail":""} where:{"phase":"B","section":"Tidslinjen"}`,
            `warning.TABLE:{"detail":""} where:{"phase":"A","section":"–"}`,
            `warning.UNKNOWN_LABEL:{"detail":"Checklista för mötet"} where:{"phase":"B","section":"Kalaslokal"}`,
            `warning.IMAGE:{"detail":""} beforeChapterA`,
        ]);
        expect(screen.queryByText("noWarnings")).not.toBeInTheDocument();
    });
});
