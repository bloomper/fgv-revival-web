import {useTranslations} from "next-intl";
import type {GuideDraftQuery} from "@/gql/graphql";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

type Report = NonNullable<NonNullable<GuideDraftQuery["guideDraft"]>["importReport"]>;

/**
 * What the import recognised, per chapter and type, and what needs review (FR-027).
 */
export function GuideImportReport({report}: { report: Report }) {
    const t = useTranslations("Guide.import");
    const columns = ["sections", "tips", "requirements", "questions", "texts"] as const;

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t("reportOf", {fileName: report.fileName})}</p>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("chapter")}</TableHead>
                            {columns.map(column => <TableHead key={column} className="text-right">{t(`counts.${column}`)}</TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {report.chapters.map(chapter => (
                            <TableRow key={chapter.phase}>
                                <TableCell>{chapter.phase}</TableCell>
                                {columns.map(column => <TableCell key={column} className="text-right">{chapter.counts[column]}</TableCell>)}
                            </TableRow>
                        ))}
                        <TableRow className="font-medium">
                            <TableCell>{t("total")}</TableCell>
                            {columns.map(column => <TableCell key={column} className="text-right">{report.totals[column]}</TableCell>)}
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
            <div className="space-y-2">
                <h4 className="font-medium">{t("warnings")}</h4>
                {report.warnings.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("noWarnings")}</p>
                ) : (
                    <ul className="list-disc space-y-1 pl-5 text-sm">
                        {report.warnings.map((warning, index) => (
                            <li key={index}>
                                {t(`warning.${warning.code}`, {detail: warning.detail ?? ""})}
                                {" "}
                                <span className="text-muted-foreground">
                                    {warning.phase ? t("where", {phase: warning.phase, section: warning.sectionTitle ?? "–"}) : t("beforeChapterA")}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
