import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {MessageCircle} from "lucide-react";
import {buttonVariants} from "@/components/ui/button";
import {CalendarLinkDialog} from "@/components/event/calendar-link-dialog.client";
import {RevivalPoster} from "@/components/revival/revival-poster.client";
import {ContactForm} from "@/components/participation/contact-form.client";
import {DietaryForm} from "@/components/participation/dietary-form.client";
import {FeeDetails} from "@/components/participation/fee-details.client";
import {MyMaterials} from "@/components/participation/my-materials";
import {ParticipationSection} from "@/components/participation/participation-section";
import {ReferralForm} from "@/components/participation/referral-form.client";
import {ResponseForm} from "@/components/participation/response-form.client";
import {AvailabilityForm} from "@/components/participation/availability-form.client";
import {Schedule} from "@/components/participation/schedule";
import {ShiftList} from "@/components/participation/shift-list.client";
import {GraphQLRequestError} from "@/lib/graphql.server";
import {getMyParticipation, getPositions} from "@/lib/participant/participant.server";
import {participantName} from "@/lib/participant/contact";
import {formatDate} from "@/utils/format";
import {Policies} from "@/utils/policy.server";
import {withPolicyPage} from "@/utils/route.server";
import {cn} from "@/utils/utils";

async function load(id: string) {
    try {
        return await getMyParticipation(id);
    } catch (error) {
        if (error instanceof GraphQLRequestError && (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")) {
            return null;
        }
        throw error;
    }
}

// Positions come from Spexregister; without them the preferred position is simply not asked
async function loadPositions() {
    try {
        return (await getPositions()).positions;
    } catch (error) {
        if (error instanceof GraphQLRequestError) {
            return [];
        }
        throw error;
    }
}

/**
 * The participant's (or helper's) own page (M6a, 5.6), made for a phone: the revival, their answer with the terms and
 * consent, contact details, dietary needs, the fee with Swish, the WhatsApp group, the steering group, a referral form
 * and the calendar link. Each section is its own component so later milestones can add theirs. M6b adds the schedule,
 * availability per event day, the caller's shifts and the open shifts they may sign up for. M8 adds the materials meant
 * for them: those for every participant and those for their position.
 */
export default async function MyParticipationPage({params}: { params: Promise<{ id: string }> }) {
    const {id} = await params;

    return withPolicyPage(Policies.app.requireAccess, async () => {
        const [participation, positions] = await Promise.all([load(id), loadPositions()]);

        if (!participation) {
            notFound();
        }

        const t = await getTranslations("Participation");
        const {participant, revival} = participation;
        const isHelper = participant.kind === "HELPER";
        const contactEditable = participant.pending || participant.registerConsent === true;
        // Participants answer for every event day unless they said no (M6B-FR-1); helpers are only given shifts
        const asksAvailability = !isHelper && participant.response !== "NO" && participation.events.length > 0;
        const takesShifts = participant.response === "YES" || participant.response === "MAYBE";

        return (
            <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4">
                <section aria-labelledby="participation-title" className="flex gap-4">
                    <RevivalPoster revivalId={revival.id} className="h-32 w-24 shrink-0 rounded-md border"/>
                    <div className="flex min-w-0 flex-col gap-1">
                        <h2 id="participation-title" className="text-xl font-bold tracking-tight">{revival.title}</h2>
                        <p className="text-sm text-muted-foreground">
                            {t(isHelper ? "welcomeHelper" : "welcome", {name: participantName(participant)})}
                        </p>
                        <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                            <dt className="text-muted-foreground">{t("premiere")}</dt>
                            <dd className="tabular-nums">{formatDate(revival.premiereDate) ?? t("notSet")}</dd>
                            {revival.shows.length > 0 && (
                                <>
                                    <dt className="text-muted-foreground">{t("shows")}</dt>
                                    <dd>
                                        <ul>
                                            {revival.shows.map(show => (
                                                <li key={`${show.date}-${show.time ?? ""}-${show.venue ?? ""}`}
                                                    className="tabular-nums">
                                                    {[formatDate(show.date), show.time, show.venue].filter(Boolean).join(" · ")}
                                                </li>
                                            ))}
                                        </ul>
                                    </dd>
                                </>
                            )}
                        </dl>
                    </div>
                </section>

                <ParticipationSection id="participation-response" title={t("responseTitle")}
                                      description={t("responseDescription")}>
                    <ResponseForm revivalId={revival.id} participant={participant} terms={participation.terms}
                                  positions={positions} isHelper={isHelper}/>
                </ParticipationSection>

                <ParticipationSection id="participation-schedule" title={t("scheduleTitle")}
                                      description={t("scheduleDescription")}>
                    <Schedule events={participation.events} shows={isHelper ? [] : revival.shows}
                              shifts={participation.shifts}/>
                </ParticipationSection>

                {asksAvailability && (
                    <ParticipationSection id="participation-availability" title={t("availabilityTitle")}
                                          description={t("availabilityDescription")}>
                        {participation.events.map(event => (
                            <AvailabilityForm key={event.id} revivalId={revival.id} event={event}
                                              answers={participation.availability}/>
                        ))}
                    </ParticipationSection>
                )}

                {(participation.shifts.length > 0 || takesShifts || isHelper) && (
                    <ParticipationSection id="participation-shifts" title={t("shiftsTitle")}
                                          description={t("shiftsDescription")}>
                        <ShiftList revivalId={revival.id} participantId={participant.id} slots={participation.shifts}
                                   mode="mine"/>
                    </ParticipationSection>
                )}

                {takesShifts && (
                    <ParticipationSection id="participation-open-shifts" title={t("openShiftsTitle")}
                                          description={t("openShiftsDescription")}>
                        <ShiftList revivalId={revival.id} participantId={participant.id}
                                   slots={participation.openShifts} mode="open"/>
                    </ParticipationSection>
                )}

                <ParticipationSection id="participation-materials" title={t("materialsTitle")}
                                      description={t("materialsDescription")}>
                    <MyMaterials materials={participation.materials}/>
                </ParticipationSection>

                <ParticipationSection id="participation-contact" title={t("contactTitle")}
                                      description={participant.pending ? t("contactPendingDescription") : t("contactDescription")}>
                    <ContactForm revivalId={revival.id} contact={participation.contact ?? null}
                                 editable={contactEditable}/>
                </ParticipationSection>

                <ParticipationSection id="participation-dietary" title={t("dietaryTitle")}>
                    <DietaryForm revivalId={revival.id} dietary={participation.dietary ?? null}/>
                </ParticipationSection>

                {participant.fee != null && (
                    <ParticipationSection id="participation-fee" title={t("feeTitle")}
                                          description={t("feeDescription")}>
                        <FeeDetails revivalId={revival.id} fee={participant.fee} paid={participant.feePaid}
                                    paidAt={participant.feePaidAt}
                                    swish={participation.swish ?? null}/>
                    </ParticipationSection>
                )}

                {participation.whatsappLink && (
                    <ParticipationSection id="participation-whatsapp" title={t("whatsappTitle")}
                                          description={t("whatsappDescription")}>
                        <a href={participation.whatsappLink} target="_blank" rel="noopener noreferrer"
                           className={cn(buttonVariants({size: "lg"}), "h-11 w-full sm:w-auto sm:self-start")}>
                            <MessageCircle/>{t("whatsappJoin")}
                        </a>
                    </ParticipationSection>
                )}

                <ParticipationSection id="participation-steering-group" title={t("steeringGroupTitle")}
                                      description={t("steeringGroupDescription")}>
                    {participation.steeringGroup.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t("steeringGroupNone")}</p>
                    ) : (
                        <ul className="flex flex-col gap-1">
                            {participation.steeringGroup.map(person => <li
                                key={person.id}>{person.displayName ?? t("unnamed")}</li>)}
                        </ul>
                    )}
                </ParticipationSection>

                <ParticipationSection id="participation-referral" title={t("referralTitle")}
                                      description={t("referralDescription")}>
                    <ReferralForm revivalId={revival.id}/>
                </ParticipationSection>

                {revival.permissions.canSubscribeCalendar && (
                    <ParticipationSection id="participation-calendar" title={t("calendarTitle")}
                                          description={t("calendarDescription")}>
                        <div>
                            <CalendarLinkDialog revivalId={revival.id} feed={revival.calendarFeed ?? null}
                                                triggerClassName="h-11 w-full sm:w-auto"/>
                        </div>
                    </ParticipationSection>
                )}
            </div>
        );
    });
}
