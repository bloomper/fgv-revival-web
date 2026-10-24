import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {PrintButton} from "@/components/staffing/print-button.client";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getStaffing} from "@/lib/staffing/staffing.server";
import {compareSlots, eventDays, slotsByDay, weekdayOf} from "@/lib/staffing/staffing";
import {formatDate} from "@/utils/format";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";

async function load(id: string) {
    try {
        return await getStaffing(id);
    } catch (error) {
        if (error instanceof GraphQLRequestError && (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")) {
            return null;
        }
        throw error;
    }
}

/**
 * Printable staffing (M6b, M6B-FR-15: the web prints, the server makes no PDF): `?event=` gives an event's schedule
 * day by day with everyone's names, `?person=` one person's shifts across the revival. The app's frame, the tabs and
 * the print button are left out of the print by print CSS.
 */
export default async function StaffingPrintPage({params, searchParams}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const {id} = await params;
    const query = await searchParams;

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const staffing = await load(id);

        if (!staffing?.revival.permissions.canReadStaffing) {
            notFound();
        }

        const t = await getTranslations("Staffing");
        const weekdays = await getTranslations("ChecklistTemplate.deadline.weekdays");
        const weekday = (date: string) => weekdays(weekdayOf(date));
        const {revival, events, slots} = staffing;
        const event = typeof query.event === "string" ? events.find(candidate => candidate.id === query.event) : undefined;
        const personId = typeof query.person === "string" ? query.person : null;

        if (event) {
            const byDay = new Map(slotsByDay(slots.filter(slot => slot.event.id === event.id)));

            return (
                <article className="flex flex-col gap-6 print:text-black">
                    <header className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h3 className="text-xl font-bold">{t("printScheduleTitle", {event: event.title})}</h3>
                            <p className="text-sm text-muted-foreground tabular-nums">
                                {[revival.title, `${formatDate(event.startDate)}${event.endDate !== event.startDate ? ` – ${formatDate(event.endDate)}` : ""}`, event.location]
                                    .filter(Boolean).join(" · ")}
                            </p>
                        </div>
                        <PrintButton/>
                    </header>
                    {eventDays(event).map(date => {
                        const daySlots = byDay.get(date) ?? [];

                        return (
                            <section key={date} className="break-inside-avoid">
                                <h4 className="mb-2 font-semibold"><span
                                    className="capitalize">{weekday(date)}</span> {formatDate(date)}</h4>
                                {daySlots.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">{t("noSlots")}</p>
                                ) : (
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                        <tr className="border-b text-left">
                                            <th scope="col" className="w-28 py-1 pr-3 font-medium">{t("time")}</th>
                                            <th scope="col" className="py-1 pr-3 font-medium">{t("task")}</th>
                                            <th scope="col" className="w-20 py-1 pr-3 font-medium">{t("needed")}</th>
                                            <th scope="col" className="py-1 font-medium">{t("people")}</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {daySlots.map(slot => (
                                            <tr key={slot.id} className="border-b align-top">
                                                <td className="py-1 pr-3 tabular-nums">{slot.startTime}–{slot.endTime}</td>
                                                <td className="py-1 pr-3">{slot.task}{slot.comment && <span
                                                    className="block text-xs text-muted-foreground">{slot.comment}</span>}</td>
                                                <td className="py-1 pr-3 tabular-nums">{slot.assigned.length}/{slot.needed}</td>
                                                <td className="py-1">{slot.assigned.map(assignment => assignment.participant.displayName).join(", ") || "—"}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                )}
                            </section>
                        );
                    })}
                </article>
            );
        }

        const held = personId ? slots.filter(slot => slot.assigned.some(assignment => assignment.participant.id === personId)).sort(compareSlots) : [];
        const name = held[0]?.assigned.find(assignment => assignment.participant.id === personId)?.participant.displayName;

        if (!personId || !name) {
            notFound();
        }

        return (
            <article className="flex flex-col gap-6 print:text-black">
                <header className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold">{t("printPersonTitle", {name})}</h3>
                        <p className="text-sm text-muted-foreground">{revival.title}</p>
                    </div>
                    <PrintButton/>
                </header>
                <table className="w-full border-collapse text-sm">
                    <thead>
                    <tr className="border-b text-left">
                        <th scope="col" className="py-1 pr-3 font-medium">{t("day")}</th>
                        <th scope="col" className="w-28 py-1 pr-3 font-medium">{t("time")}</th>
                        <th scope="col" className="py-1 pr-3 font-medium">{t("task")}</th>
                        <th scope="col" className="py-1 font-medium">{t("event")}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {held.map(slot => (
                        <tr key={slot.id} className="border-b align-top">
                            <td className="py-1 pr-3 tabular-nums"><span
                                className="capitalize">{weekday(slot.date)}</span> {formatDate(slot.date)}</td>
                            <td className="py-1 pr-3 tabular-nums">{slot.startTime}–{slot.endTime}</td>
                            <td className="py-1 pr-3">{slot.task}</td>
                            <td className="py-1">{[slot.event.title, slot.event.location].filter(Boolean).join(" · ")}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </article>
        );
    });
}
