import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {CalendarClock, Grid3x3} from "lucide-react";
import {ViewLink} from "@/components/view-link";
import {AvailabilityMatrix} from "@/components/staffing/availability-matrix";
import {StaffingBoard} from "@/components/staffing/staffing-board.client";
import {StaffingEventPicker} from "@/components/staffing/staffing-event-picker.client";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {participantName} from "@/lib/participant/contact";
import {getStaffing, getStaffingCandidates} from "@/lib/staffing/staffing.server";
import type {StaffingCandidate} from "@/lib/staffing/staffing";
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

type Person = Omit<StaffingCandidate, "answer" | "comment">;

/**
 * Who may be given a shift (M6B-FR-3): participants who said yes or maybe and helpers who did not say no. Names come
 * from Spexregister; without it, those who answered for a day are still offered, by the names the answers carry.
 */
async function loadCandidates(id: string, fallback: Person[]): Promise<{ people: Person[]; unavailable: boolean }> {
    try {
        const participants = await getStaffingCandidates(id);

        return {
            people: participants
                .filter(participant => !participant.removed && (participant.kind === "HELPER"
                    ? participant.response !== "NO"
                    : participant.response === "YES" || participant.response === "MAYBE"))
                .map(participant => ({id: participant.id, name: participantName(participant), kind: participant.kind, position: participant.position?.name ?? null})),
            unavailable: false,
        };
    } catch (error) {
        if (error instanceof GraphQLRequestError && (error.code === "SPEXREGISTER_UNAVAILABLE" || error.code === "FORBIDDEN")) {
            return {people: fallback, unavailable: error.code === "SPEXREGISTER_UNAVAILABLE"};
        }
        throw error;
    }
}

/**
 * A revival's staffing (M6b, 5.7): pick an event, then per day its shift slots with who holds them, or everyone's
 * availability as a matrix. Writers (the directeur, or STAFFING) add, change and remove slots and assign people.
 */
export default async function StaffingPage({params, searchParams}: {
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
        const {revival, events, slots, availability} = staffing;
        const event = events.find(candidate => candidate.id === query.event) ?? events[0] ?? null;
        const matrix = query.view === "matrix";
        const base = `/revivals/${revival.id}/staffing`;
        const href = (view: "slots" | "matrix") => `${base}?${new URLSearchParams({...(event ? {event: event.id} : {}), ...(view === "matrix" ? {view} : {})})}`;
        const answered: Person[] = availability.map(row => ({id: row.participant.id, name: row.participant.displayName, kind: row.participant.kind,
            position: row.participant.position?.name ?? null}));
        const {people, unavailable} = revival.permissions.canWriteStaffing && !matrix ? await loadCandidates(revival.id, answered) : {people: [], unavailable: false};

        return (
            <div className="flex flex-1 flex-col gap-4">
                <h3 className="sr-only">{t("title")}</h3>
                {events.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("noEvents")}</p>
                ) : (
                    <>
                        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                            <StaffingEventPicker events={events} selected={event?.id ?? ""} view={matrix ? "matrix" : null}/>
                            <nav aria-label={t("views")} className="flex w-fit gap-1 rounded-lg bg-muted p-1">
                                <ViewLink href={href("slots")} active={!matrix} icon={CalendarClock}>{t("slotsView")}</ViewLink>
                                <ViewLink href={href("matrix")} active={matrix} icon={Grid3x3}>{t("matrixView")}</ViewLink>
                            </nav>
                        </div>
                        {event && (matrix ? (
                            <AvailabilityMatrix event={event} availability={availability}/>
                        ) : (
                            <StaffingBoard revivalId={revival.id} event={event} slots={slots.filter(slot => slot.event.id === event.id)}
                                           availability={availability} people={people} peopleUnavailable={unavailable}
                                           canWrite={revival.permissions.canWriteStaffing}/>
                        ))}
                    </>
                )}
            </div>
        );
    });
}
