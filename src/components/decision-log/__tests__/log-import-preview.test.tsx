import {describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen} from "@testing-library/react";
import {LogImportPreview} from "@/components/decision-log/log-import-preview";
import type {LogImportPreview as Preview} from "@/lib/decision-log/log.server";

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Record<string, unknown>) => values ? `${key} ${JSON.stringify(values)}` : key,
}));

const preview = (layout: "ALI_BABA" | "NOBEL"): Preview => ({
    fileName: "logg.xlsx", layout, sheet: "Logg", ignoredSheets: ["Checklistor"], rowCount: 12,
    byType: {DECISION: 7, TODO: 4, QUESTION: 1}, byStatus: {OPEN: 5, DONE: 7, WAITING: 0, CANCELLED: 0},
    numbers: {first: 1, last: 12},
    owners: [{name: "Kim", rows: 8, suggestedPersonId: 11}, {name: "Robin", rows: 4, suggestedPersonId: null}],
    members: [{id: 11, displayName: "Kim Svensson"}, {id: 12, displayName: "Dana Directeur"}],
    warnings: [{code: "DEADLINE_NOT_A_DATE", sheetRow: 7, detail: "v 12"}, {code: "EXTRA_COLUMNS", sheetRow: null, detail: "I"}],
    guideRowsRenumbered: 0,
});

describe("LogImportPreview", () => {
    it("shows counts, ignored sheets and warnings with their rows", () => {
        render(<LogImportPreview preview={preview("ALI_BABA")} choices={{owners: {Kim: "11", Robin: null}, nobelType: "TODO"}} onChange={() => {}}/>);

        expect(screen.getByText("type.DECISION: 7")).toBeInTheDocument();
        expect(screen.getByText("status.DONE: 7")).toBeInTheDocument();
        expect(screen.getByText("Checklistor")).toBeInTheDocument();
        expect(screen.getByText(/import.warning.DEADLINE_NOT_A_DATE: v 12/)).toHaveTextContent('import.atRow {"row":7}');
        expect(screen.getByText(/import.warning.EXTRA_COLUMNS: I/)).toBeInTheDocument();
        expect(screen.queryByText("import.nobelType")).toBeNull();
    });

    it("preselects suggested members and changes a match", () => {
        const onChange = vi.fn();

        render(<LogImportPreview preview={preview("ALI_BABA")} choices={{owners: {Kim: "11", Robin: null}, nobelType: "TODO"}} onChange={onChange}/>);

        expect(screen.getByLabelText('import.matchOwner {"name":"Kim"}')).toHaveValue("11");
        expect(screen.getByLabelText('import.matchOwner {"name":"Robin"}')).toHaveValue("");
        fireEvent.change(screen.getByLabelText('import.matchOwner {"name":"Robin"}'), {target: {value: "12"}});

        expect(onChange).toHaveBeenCalledWith({owners: {Kim: "11", Robin: "12"}, nobelType: "TODO"});
    });

    it("asks for the type of every row in the Nobel layout", () => {
        const onChange = vi.fn();

        render(<LogImportPreview preview={preview("NOBEL")} choices={{owners: {}, nobelType: "TODO"}} onChange={onChange}/>);
        fireEvent.change(screen.getByRole("combobox", {name: "import.nobelType"}), {target: {value: "DECISION"}});

        expect(onChange).toHaveBeenCalledWith({owners: {}, nobelType: "DECISION"});
    });
});
