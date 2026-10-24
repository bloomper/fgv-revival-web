import {useTranslations} from "next-intl";
import {Check, CircleHelp, X} from "lucide-react";
import type {AvailabilityAnswer, ParticipantKind} from "@/gql/graphql";
import {answerFor, type AvailabilityDayValue, eventDays} from "@/lib/staffing/staffing";
import {formatDate} from "@/utils/format";
import {cn} from "@/utils/utils";

const ICONS = {YES: Check, MAYBE: CircleHelp, NO: X} as const;
const TONES: Record<AvailabilityAnswer, string> = {
    YES: "text-emerald-700 dark:text-emerald-400",
    MAYBE: "text-amber-700 dark:text-amber-400",
    NO: "text-muted-foreground",
};

type MatrixRow = {
    participant: { id: string; displayName: string; kind: ParticipantKind; position?: { name: string } | null };
    days: AvailabilityDayValue[];
};

/**
 * Everyone's availability for one event (M6b): a row per person who answered, a column per day, each cell the answer
 * as an icon and a word with the comment below it. Days nobody answered are blank.
 */
export function AvailabilityMatrix({event, availability}: {
    event: { id: string; title: string; startDate: string; endDate: string };
    availability: MatrixRow[];
}) {
    const t = useTranslations();
    const days = eventDays(event);
    const rows = availability.filter(row => row.days.some(day => day.eventId === event.id))
        .sort((a, b) => a.participant.displayName.localeCompare(b.participant.displayName, "sv"));

    if (rows.length === 0) {
        return <p className="text-sm text-muted-foreground">{t("Staffing.noAvailability")}</p>;
    }
    return (
        <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
                <caption className="sr-only">{t("Staffing.matrixCaption", {event: event.title})}</caption>
                <thead>
                <tr className="border-b bg-muted/50">
                    <th scope="col" className="px-3 py-2 text-left font-medium">{t("Staffing.person")}</th>
                    {days.map(day => <th key={day} scope="col"
                                         className="px-3 py-2 text-left font-medium tabular-nums whitespace-nowrap">{formatDate(day)}</th>)}
                </tr>
                </thead>
                <tbody>
                {rows.map(row => (
                    <tr key={row.participant.id} className="border-b last:border-0">
                        <th scope="row" className="px-3 py-2 text-left font-normal">
                            <span className="font-medium">{row.participant.displayName}</span>
                            {(row.participant.position || row.participant.kind === "HELPER") && (
                                <span className="block text-xs text-muted-foreground">
                                        {row.participant.kind === "HELPER" ? t("Participants.kinds.HELPER") : row.participant.position?.name}
                                    </span>
                            )}
                        </th>
                        {days.map(day => {
                            const answer = answerFor(row.days, event.id, day);

                            if (!answer) {
                                return <td key={day} className="px-3 py-2 text-muted-foreground"><span
                                    className="sr-only">{t("Staffing.noAnswer")}</span>—</td>;
                            }
                            const Icon = ICONS[answer.answer];

                            return (
                                <td key={day} className="px-3 py-2 align-top">
                                        <span
                                            className={cn("inline-flex items-center gap-1 font-medium", TONES[answer.answer])}>
                                            <Icon className="size-4"
                                                  aria-hidden/>{t(`Availability.answers.${answer.answer}`)}
                                        </span>
                                    {answer.comment && <span
                                        className="block max-w-48 text-xs text-muted-foreground">{answer.comment}</span>}
                                </td>
                            );
                        })}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
