import {useTranslations} from "next-intl";
import type {MinutesRowFieldsFragment} from "@/gql/graphql";
import {OwnerLabel} from "@/components/owner/owner-label";
import {PlainText} from "@/components/plain-text";
import {formatDate} from "@/utils/format";

export type MinutesValue = {
    decisions: MinutesRowFieldsFragment[];
    todos: MinutesRowFieldsFragment[];
    questions: MinutesRowFieldsFragment[];
    closed: MinutesRowFieldsFragment[];
    agendaPoints: string[];
    attendees: { id: string; displayName?: string | null }[];
    othersPresent?: string | null;
    recorder?: { displayName?: string | null } | null;
};

function Section({title, rows, render}: { title: string; rows: MinutesRowFieldsFragment[]; render: (row: MinutesRowFieldsFragment) => React.ReactNode }) {
    if (rows.length === 0) {
        return null;
    }
    return (
        <section className="space-y-1">
            <h3 className="font-medium">{title}</h3>
            <ul className="space-y-1 text-sm">
                {rows.map(row => <li key={row.entryId} className="flex flex-wrap gap-x-2"><span className="font-medium">#{row.number}</span>{render(row)}</li>)}
            </ul>
        </section>
    );
}

/**
 * A closed meeting's minutes, as they were produced (M3 FR-020): rows as text, owners by display name.
 */
export function MinutesView({minutes}: { minutes: MinutesValue }) {
    const t = useTranslations("Meeting");
    const tl = useTranslations("Log");
    const present = minutes.attendees.map(attendee => attendee.displayName).filter(Boolean).join(", ");

    return (
        <div className="space-y-4" aria-label={t("minutes")}>
            <dl className="space-y-1 text-sm">
                <div><dt className="inline font-medium">{t("present")}: </dt><dd className="inline">{[present, minutes.othersPresent].filter(Boolean).join("; ") || "—"}</dd></div>
                {minutes.recorder?.displayName && <div><dt className="inline font-medium">{t("recorder")}: </dt><dd className="inline">{minutes.recorder.displayName}</dd></div>}
                {minutes.agendaPoints.length > 0 && <div><dt className="inline font-medium">{t("agendaPoints")}: </dt><dd className="inline">{minutes.agendaPoints.join(", ")}</dd></div>}
            </dl>
            <Section title={t("decisions")} rows={minutes.decisions} render={row => <>
                <PlainText text={row.text}/>{row.owner && <span>(<OwnerLabel owner={row.owner}/>)</span>}
            </>}/>
            <Section title={t("todos")} rows={minutes.todos} render={row => <>
                <PlainText text={row.text}/>
                <span className="text-muted-foreground">{t("owner")}: <OwnerLabel owner={row.owner}/></span>
                {row.deadline && <span className="text-muted-foreground">{t("deadline")}: {formatDate(row.deadline)}</span>}
            </>}/>
            <Section title={t("questions")} rows={minutes.questions} render={row => <PlainText text={row.text}/>}/>
            <Section title={t("closedRows")} rows={minutes.closed} render={row => <>
                <PlainText text={row.text}/><span className="text-muted-foreground">({tl(`status.${row.status}`)})</span>
            </>}/>
            {minutes.decisions.length + minutes.todos.length + minutes.questions.length + minutes.closed.length === 0 && (
                <p className="text-sm text-muted-foreground">{t("emptyMinutes")}</p>
            )}
        </div>
    );
}
