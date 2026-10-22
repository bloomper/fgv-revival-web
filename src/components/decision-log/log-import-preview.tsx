import {useTranslations} from "next-intl";
import type {LogImportPreview as Preview} from "@/lib/decision-log/log.server";
import {LOG_ENTRY_TYPES} from "@/lib/decision-log/schema";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

export type ImportChoiceState = { owners: Record<string, string | null>; nobelType: (typeof LOG_ENTRY_TYPES)[number] };

/**
 * What an Excel import would do: counts, ignored sheets, warnings, and the owner names to match (M3 FR-040).
 */
export function LogImportPreview({preview, choices, onChange}: {
    preview: Preview;
    choices: ImportChoiceState;
    onChange: (choices: ImportChoiceState) => void;
}) {
    const t = useTranslations("Log");

    return (
        <div className="space-y-4">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
                <dt className="text-muted-foreground">{t("import.layout")}</dt>
                <dd>{t(`import.layouts.${preview.layout}`)}</dd>
                <dt className="text-muted-foreground">{t("import.sheet")}</dt>
                <dd>{preview.sheet}</dd>
                <dt className="text-muted-foreground">{t("import.rows")}</dt>
                <dd>{preview.rowCount} ({t("import.numbers", preview.numbers)})</dd>
                {preview.ignoredSheets.length > 0 && <>
                    <dt className="text-muted-foreground">{t("import.ignored")}</dt>
                    <dd>{preview.ignoredSheets.join(", ")}</dd>
                </>}
            </dl>
            <ul className="flex flex-wrap gap-x-4 text-sm" aria-label={t("import.counts")}>
                {LOG_ENTRY_TYPES.map(type => <li key={type}>{t(`type.${type}`)}: {preview.byType[type]}</li>)}
                {(["OPEN", "WAITING", "DONE", "CANCELLED"] as const).map(status =>
                    <li key={status}>{t(`status.${status}`)}: {preview.byStatus[status]}</li>)}
            </ul>
            {preview.layout === "NOBEL" && (
                <label className="flex items-center gap-2 text-sm">
                    {t("import.nobelType")}
                    <select className="h-8 rounded-md border border-input bg-background px-2" value={choices.nobelType}
                            onChange={event => onChange({...choices, nobelType: event.target.value as ImportChoiceState["nobelType"]})}>
                        {LOG_ENTRY_TYPES.map(type => <option key={type} value={type}>{t(`type.${type}`)}</option>)}
                    </select>
                </label>
            )}
            {preview.owners.length > 0 && (
                <section className="space-y-2">
                    <h3 className="font-medium">{t("import.owners")}</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("import.ownerName")}</TableHead>
                                <TableHead>{t("import.rows")}</TableHead>
                                <TableHead>{t("import.matchTo")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {preview.owners.map(owner => (
                                <TableRow key={owner.name}>
                                    <TableCell>{owner.name}</TableCell>
                                    <TableCell>{owner.rows}</TableCell>
                                    <TableCell>
                                        <select aria-label={t("import.matchOwner", {name: owner.name})}
                                                className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                                                value={choices.owners[owner.name] ?? ""}
                                                onChange={event => onChange({...choices, owners: {...choices.owners, [owner.name]: event.target.value || null}})}>
                                            <option value="">{t("import.keepName")}</option>
                                            {preview.members.map(member => <option key={member.id} value={String(member.id)}>{member.displayName ?? member.id}</option>)}
                                        </select>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </section>
            )}
            <section className="space-y-2">
                <h3 className="font-medium">{t("import.warnings")}</h3>
                {preview.warnings.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("import.noWarnings")}</p>
                ) : (
                    <ul className="list-disc space-y-1 pl-5 text-sm">
                        {preview.warnings.map((warning, index) => (
                            <li key={index}>
                                {warning.sheetRow ? t("import.atRow", {row: warning.sheetRow}) : ""}
                                {t(`import.warning.${warning.code}`)}
                                {warning.detail ? `: ${warning.detail}` : ""}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
            {preview.guideRowsRenumbered > 0 && <p className="text-sm">{t("import.guideRows", {count: preview.guideRowsRenumbered})}</p>}
        </div>
    );
}
