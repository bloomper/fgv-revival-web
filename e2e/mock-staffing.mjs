// The staffing and mailing part of the mock backend (M6b): availability per event day, shift slots with assignments
// and sign-ups, the participant page's additions, mailings with audiences resolved at send time, the mailing plan and
// its templates, with the server's rules (fgv-revival-server/src/main/resources/graphql/staffing.graphqls,
// mailing.graphqls). Recipients are names only; addresses come from the participant mock at send time. Test data is
// fictitious.

const DAY = 24 * 60 * 60 * 1000;
const WEEKDAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

const parse = date => new Date(`${date}T00:00:00Z`);
const format = date => date.toISOString().slice(0, 10);
const addDays = (date, days) => format(new Date(parse(date).getTime() + days * DAY));
const today = () => new Date().toISOString().slice(0, 10);
const isoWeekday = date => (date.getUTCDay() + 6) % 7;

/** As the server's RelativeDeadline.apply and the web's applyRelativeDeadline. */
function applyDue(due, date) {
    const start = parse(date);

    if (due.kind === "DAYS") {
        return addDays(date, due.amount ?? 0);
    }
    if (due.kind === "WORKING_DAYS") {
        const step = (due.amount ?? 0) < 0 ? -1 : 1;
        let result = start;

        for (let remaining = Math.abs(due.amount ?? 0); remaining > 0;) {
            result = new Date(result.getTime() + step * DAY);
            if (isoWeekday(result) < 5) {
                remaining--;
            }
        }
        return format(result);
    }
    const mondayBefore = new Date(start.getTime() - (isoWeekday(start) + 7) * DAY);

    return format(new Date(mondayBefore.getTime() + WEEKDAYS.indexOf(due.weekday ?? "MONDAY") * DAY));
}

export function createStaffingState() {
    return {nextId: 1, availability: [], slots: [], assignments: [], mailings: [], templates: []};
}

export function staffingResolvers(ctx) {
    const {
        GraphQLError,
        forbidden,
        roleIn,
        canSee,
        visibleRevival,
        isSuperAdmin,
        personas,
        participants,
        resolvers
    } = ctx;
    const store = () => ctx.state().staffing;
    const people = () => ctx.state().participant.participants;
    const members = () => ctx.state().members;
    const capabilitiesOf = (persona, revival) => members().find(member => member.revivalId === revival.id && member.sub === persona.sub)?.capabilities ?? [];
    const steering = (persona, revival) => ["DIRECTEUR", "STEERING_GROUP"].includes(roleIn(persona, revival)) && canSee(persona, revival);
    const notArchived = revival => revival.status !== "ARCHIVED";
    const holds = (capability, persona, revival) => steering(persona, revival)
        && (roleIn(persona, revival) === "DIRECTEUR" || capabilitiesOf(persona, revival).includes(capability));
    const badRequest = message => new GraphQLError("BAD_REQUEST", message);
    const conflict = () => new GraphQLError("CONFLICT", "Någon annan har ändrat detta.");

    const permissions = (persona, revival) => ({
        canReadStaffing: isSuperAdmin(persona) || steering(persona, revival),
        canWriteStaffing: holds("STAFFING", persona, revival) && notArchived(revival),
        canReadMailings: isSuperAdmin(persona) || steering(persona, revival),
        canDraftMailings: steering(persona, revival) && notArchived(revival),
        canSendMailings: holds("COMMS", persona, revival) && notArchived(revival),
    });
    const require = (persona, revivalId, permission) => {
        const revival = visibleRevival(persona, revivalId);

        if (!permissions(persona, revival)[permission]) {
            throw forbidden();
        }
        return revival;
    };

    // --- Events, slots and availability ------------------------------------------------------------------------------

    const eventById = id => ctx.state().event.events.find(event => event.id === String(id));
    const eventsOf = revival => ctx.state().event.events.filter(event => event.revivalId === revival.id && !event.cancelled)
        .sort((a, b) => a.startDate.localeCompare(b.startDate));
    const toEvent = event => ({
        __typename: "Event",
        id: event.id,
        revivalId: event.revivalId,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        startTime: event.startTime ?? null,
        endTime: event.endTime ?? null,
        location: event.location ?? null,
    });
    const inEvent = (event, date) => date >= event.startDate && date <= event.endDate;
    const participantById = id => people().find(participant => participant.id === String(id));
    const assignmentsOf = slot => store().assignments.filter(assignment => assignment.slotId === slot.id);
    const toSlot = slot => {
        const assigned = assignmentsOf(slot);

        return {
            __typename: "ShiftSlot",
            id: slot.id,
            event: toEvent(eventById(slot.eventId)),
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            task: slot.task,
            needed: slot.needed,
            comment: slot.comment,
            assigned: assigned.map(assignment => ({
                __typename: "ShiftAssignment", participant: participants.ref(participantById(assignment.participantId)),
                selfSignedUp: assignment.selfSignedUp
            })),
            open: Math.max(0, slot.needed - assigned.length),
            version: slot.version,
        };
    };
    const slotsOf = (revival, eventId) => store().slots
        .filter(slot => eventById(slot.eventId)?.revivalId === revival.id && !eventById(slot.eventId).cancelled && (!eventId || slot.eventId === String(eventId)))
        .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
    const toDay = answer => ({
        __typename: "AvailabilityDay",
        eventId: answer.eventId,
        date: answer.date,
        answer: answer.answer,
        comment: answer.comment
    });
    const availabilityOf = participant => store().availability.filter(answer => answer.participantId === participant.id
        && eventById(answer.eventId) && !eventById(answer.eventId).cancelled);
    const findSlot = (persona, id, version, permission = "canWriteStaffing") => {
        const slot = store().slots.find(candidate => candidate.id === String(id));

        if (!slot) {
            throw new GraphQLError("NOT_FOUND", "Passet finns inte.");
        }
        const revival = require(persona, eventById(slot.eventId).revivalId, permission);

        if (version !== undefined && slot.version !== version) {
            throw conflict();
        }
        return {slot, revival};
    };
    const validSlot = (event, input) => {
        if (!inEvent(event, input.date)) {
            throw badRequest("Dagen ligger inte inom händelsen.");
        }
        if (!/^\d\d:\d\d$/.test(input.startTime) || !/^\d\d:\d\d$/.test(input.endTime) || input.endTime <= input.startTime) {
            throw badRequest("Sluttiden måste vara efter starttiden.");
        }
        if (!input.task?.trim() || input.task.length > 100 || input.needed < 1 || input.needed > 100) {
            throw badRequest("Uppgiften eller antalet är ogiltigt.");
        }
    };
    const overlapping = (participantId, slot) => store().assignments.some(assignment => {
        const other = store().slots.find(candidate => candidate.id === assignment.slotId);

        return assignment.participantId === participantId && other.id !== slot.id && other.date === slot.date
            && other.startTime < slot.endTime && slot.startTime < other.endTime;
    });
    const assign = (slot, participant, selfSignedUp) => {
        if (store().assignments.some(assignment => assignment.slotId === slot.id && assignment.participantId === participant.id)) {
            return;
        }
        if (overlapping(participant.id, slot)) {
            throw badRequest("Personen har redan ett pass som överlappar.");
        }
        store().assignments.push({slotId: slot.id, participantId: participant.id, selfSignedUp});
    };
    const takesShifts = participant => !participant.removedAt && (participant.kind === "HELPER" ? participant.response !== "NO" : ["YES", "MAYBE"].includes(participant.response));

    /** The caller's additions to their Participation (M6B-FR-7): helpers see only the events they hold shifts in. */
    function participationExtras(revival, participant) {
        const held = store().slots.filter(slot => store().assignments.some(assignment => assignment.slotId === slot.id && assignment.participantId === participant.id));
        const heldEvents = new Set(held.map(slot => slot.eventId));
        const events = eventsOf(revival).filter(event => participant.kind !== "HELPER" || heldEvents.has(event.id));
        const mine = slotsOf(revival).filter(slot => held.includes(slot));
        const open = ["YES", "MAYBE"].includes(participant.response)
            ? slotsOf(revival).filter(slot => !held.includes(slot) && assignmentsOf(slot).length < slot.needed)
            : [];

        return {
            events: events.map(toEvent),
            availability: availabilityOf(participant).map(toDay),
            shifts: mine.map(toSlot),
            openShifts: open.map(toSlot)
        };
    }

    const myParticipation = resolvers.MyParticipation;
    const own = (persona, revivalId) => participants.own(persona, revivalId);

    // --- Mailings --------------------------------------------------------------------------------------------------

    const positionOf = id => id ? {
        __typename: "Position",
        id,
        name: {"T-ENS": "Ensemble", "T-ORK": "Orkester", "T-DEK": "Dekor"}[id] ?? id,
        category: null,
        hasRole: false
    } : null;
    const localized = value => ({__typename: "LocalizedText", sv: value.sv, en: value.en ?? null});
    const eventType = id => ctx.state().event.types.find(type => type.id === id);
    const toTemplate = template => ({
        __typename: "MailingTemplate",
        id: template.id,
        name: localized(template.name),
        subject: localized(template.subject),
        body: localized(template.body),
        audience: template.audience,
        eventType: template.eventTypeId ? {
            __typename: "EventType", id: template.eventTypeId, name: localized(eventType(template.eventTypeId).name),
            retired: eventType(template.eventTypeId).retired
        } : null,
        due: {
            __typename: "RelativeDeadline",
            kind: template.due.kind,
            amount: template.due.amount ?? null,
            weekday: template.due.weekday ?? null
        },
        position: template.position,
        retired: template.retired,
        version: template.version,
    });
    const orderedTemplates = () => [...store().templates].sort((a, b) => a.position - b.position);
    const findTemplate = (persona, id, version) => {
        if (!isSuperAdmin(persona)) {
            throw forbidden();
        }
        const template = store().templates.find(candidate => candidate.id === String(id));

        if (!template) {
            throw new GraphQLError("NOT_FOUND", "Utskicket finns inte.");
        }
        if (version !== undefined && template.version !== version) {
            throw conflict();
        }
        return template;
    };
    const templateInput = input => {
        if (!input.name?.sv?.trim() || !input.subject?.sv?.trim() || !input.body?.sv?.trim()) {
            throw badRequest("Skriv namn, ämne och text på svenska.");
        }
        return {
            name: {sv: input.name.sv.trim(), en: input.name.en?.trim() || null},
            subject: {sv: input.subject.sv.trim(), en: input.subject.en?.trim() || null},
            body: {sv: input.body.sv, en: input.body.en || null},
            audience: input.audience,
            eventTypeId: input.eventTypeId ?? null,
            due: {kind: input.due.kind, amount: input.due.amount ?? null, weekday: input.due.weekday ?? null},
        };
    };

    /** Who an audience reaches now (M6B-FR-8), by name, with whether an address can be found. */
    function recipientsOf(revival, audience) {
        const active = participants.activeIn(revival);
        const named = participant => ({
            displayName: participants.ref(participant).displayName,
            hasAddress: !!participants.emailOf(participant),
            participantId: participant.id
        });
        const answered = participant => ["YES", "MAYBE"].includes(participant.response);
        const kinds = {
            PARTICIPANTS: () => active.filter(participant => participant.kind === "PARTICIPANT" && answered(participant)),
            CONFIRMED: () => active.filter(participant => participant.kind === "PARTICIPANT" && participant.response === "YES"),
            POSITION: () => active.filter(participant => participant.kind === "PARTICIPANT" && answered(participant) && participant.positionId === audience.positionId),
            HELPERS: () => active.filter(participant => participant.kind === "HELPER" && participant.response !== "NO"),
            NON_RESPONDERS: () => active.filter(participant => participant.memberId && participant.response === "PENDING"),
            EVENT_ATTENDEES: () => active.filter(participant => store().availability.some(answer => answer.participantId === participant.id
                    && answer.eventId === String(audience.eventId) && ["YES", "MAYBE"].includes(answer.answer))
                || store().assignments.some(assignment => assignment.participantId === participant.id
                    && store().slots.find(slot => slot.id === assignment.slotId)?.eventId === String(audience.eventId))),
        };

        if (audience.kind === "STEERING_GROUP") {
            return members().filter(member => member.revivalId === revival.id && ["DIRECTEUR", "STEERING_GROUP"].includes(member.role) && member.sub)
                .map(member => ({
                    displayName: personas[member.sub]?.name ?? member.email,
                    hasAddress: true,
                    personId: member.sub
                }));
        }
        if ((audience.kind === "POSITION" && !audience.positionId) || (audience.kind === "EVENT_ATTENDEES" && !audience.eventId)) {
            throw badRequest("Välj befattning eller händelse.");
        }
        return kinds[audience.kind]().map(named);
    }

    const personRef = sub => sub ? {__typename: "PersonRef", id: sub, displayName: personas[sub]?.name ?? null} : null;
    const toMailing = (persona, mailing) => {
        const revival = ctx.state().revivals.find(candidate => candidate.id === mailing.revivalId);
        const template = mailing.templateId && store().templates.find(candidate => candidate.id === mailing.templateId);

        return {
            __typename: "Mailing",
            id: mailing.id,
            revivalId: mailing.revivalId,
            audience: {
                __typename: "MailingAudience",
                kind: mailing.audience.kind,
                position: positionOf(mailing.audience.positionId),
                event: mailing.audience.eventId ? toEvent(eventById(mailing.audience.eventId)) : null
            },
            subject: mailing.subject,
            body: mailing.body,
            status: mailing.status,
            plannedFor: template ? planEntry(persona, revival, template, mailing.planEventId ? eventById(mailing.planEventId) : null, false) : null,
            createdBy: personRef(mailing.createdBy),
            createdAt: mailing.createdAt,
            sentBy: personRef(mailing.sentBy),
            sentAt: mailing.sentAt,
            recipients: mailing.recipients.map(recipient => ({
                __typename: "MailingRecipient",
                displayName: recipient.displayName,
                status: recipient.status
            })),
            canSend: mailing.status === "DRAFT" && permissions(persona, revival).canSendMailings,
            version: mailing.version,
        };
    };

    /** One plan entry (M6B-FR-10); the mailing is the latest one made from it that is not cancelled. */
    function planEntry(persona, revival, template, event, withMailing = true) {
        const dueDate = applyDue(template.due, event ? event.startDate : revival.premiereDate);
        const made = store().mailings.filter(mailing => mailing.templateId === template.id && (mailing.planEventId ?? null) === (event?.id ?? null)
            && mailing.status !== "CANCELLED");
        const latest = made.at(-1);

        return {
            __typename: "MailingPlanEntry",
            template: toTemplate(template),
            event: event ? toEvent(event) : null,
            dueDate,
            mailing: withMailing && latest ? toMailing(persona, latest) : null,
            due: !made.some(mailing => mailing.status === "SENT") && dueDate <= addDays(today(), 7),
        };
    }

    function planOf(persona, revival) {
        return orderedTemplates().filter(template => !template.retired).flatMap(template => template.eventTypeId
            ? eventsOf(revival).filter(event => event.typeId === template.eventTypeId).map(event => planEntry(persona, revival, template, event))
            : revival.premiereDate ? [planEntry(persona, revival, template, null)] : [])
            .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    }

    const findMailing = (persona, id, version, permission = "canDraftMailings") => {
        const mailing = store().mailings.find(candidate => candidate.id === String(id));

        if (!mailing) {
            throw new GraphQLError("NOT_FOUND", "Utskicket finns inte.");
        }
        const revival = require(persona, mailing.revivalId, permission);

        if (version !== undefined && mailing.version !== version) {
            throw conflict();
        }
        return {mailing, revival};
    };
    const mailingInput = input => {
        if (!input.subject?.trim() || input.subject.length > 200 || !input.body?.trim() || input.body.length > 20000) {
            throw badRequest("Skriv ett ämne och en text.");
        }
        return {
            audience: {
                kind: input.audience.kind,
                positionId: input.audience.positionId ?? null,
                eventId: input.audience.eventId ?? null
            },
            subject: input.subject.trim(), body: input.body,
        };
    };
    const deliver = (mailing, recipients) => {
        const failOnce = store().failOnce ?? [];

        return recipients.map(recipient => {
            const fails = recipient.hasAddress && failOnce.includes(recipient.displayName);

            store().failOnce = failOnce.filter(name => !fails || name !== recipient.displayName);
            return {...recipient, status: !recipient.hasAddress ? "NO_ADDRESS" : fails ? "FAILED" : "SENT"};
        });
    };

    const operations = {
        // --- Staffing
        Staffing(persona, {id}) {
            const revival = visibleRevival(persona, id);
            const reads = permissions(persona, revival).canReadStaffing;

            return {
                revival: {
                    __typename: "Revival", id: revival.id, title: revival.title, status: revival.status,
                    permissions: {__typename: "RevivalPermissions", ...permissions(persona, revival)}
                },
                events: reads ? eventsOf(revival).map(toEvent) : [],
                shiftSlots: reads ? slotsOf(revival).map(toSlot) : [],
                availability: reads ? participants.activeIn(revival).map(participant => ({
                    __typename: "ParticipantAvailability",
                    participant: participants.ref(participant),
                    days: availabilityOf(participant).map(toDay),
                })).filter(row => row.days.length > 0) : [],
            };
        },
        StaffingCandidates(persona, {revivalId}) {
            return resolvers.Participants(persona, {revivalId, includeRemoved: false});
        },
        ShiftSlotCreate(persona, {input}) {
            const event = eventById(input.eventId);

            if (!event || event.cancelled) {
                throw badRequest("Händelsen finns inte.");
            }
            require(persona, event.revivalId, "canWriteStaffing");
            validSlot(event, input);
            const slot = {
                id: `s${store().nextId++}`,
                eventId: event.id,
                date: input.date,
                startTime: input.startTime,
                endTime: input.endTime,
                task: input.task.trim(),
                needed: input.needed,
                comment: input.comment?.trim() || null,
                version: 0
            };

            store().slots.push(slot);
            return {shiftSlotCreate: toSlot(slot)};
        },
        ShiftSlotUpdate(persona, {id, version, input}) {
            const {slot} = findSlot(persona, id, version);

            validSlot(eventById(slot.eventId), input);
            Object.assign(slot, {
                date: input.date,
                startTime: input.startTime,
                endTime: input.endTime,
                task: input.task.trim(),
                needed: input.needed,
                comment: input.comment?.trim() || null,
                version: slot.version + 1
            });
            return {shiftSlotUpdate: toSlot(slot)};
        },
        ShiftSlotRemove(persona, {id, version}) {
            const {slot} = findSlot(persona, id, version);

            if (assignmentsOf(slot).length > 0) {
                throw badRequest("Passet kan bara tas bort medan ingen har det.");
            }
            store().slots = store().slots.filter(candidate => candidate !== slot);
            return {shiftSlotRemove: null};
        },
        ShiftAssign(persona, {slotId, participantId}) {
            const {slot, revival} = findSlot(persona, slotId);
            const participant = participantById(participantId);

            if (!participant || participant.revivalId !== revival.id || !takesShifts(participant)) {
                throw badRequest("Personen kan inte få pass.");
            }
            assign(slot, participant, false);
            slot.version += 1;
            return {shiftAssign: toSlot(slot)};
        },
        ShiftUnassign(persona, {slotId, participantId}) {
            const {slot} = findSlot(persona, slotId);

            store().assignments = store().assignments.filter(assignment => !(assignment.slotId === slot.id && assignment.participantId === String(participantId)));
            slot.version += 1;
            return {shiftUnassign: toSlot(slot)};
        },
        ShiftSignUp(persona, {slotId}) {
            const slot = store().slots.find(candidate => candidate.id === String(slotId));
            const {revival, participant} = own(persona, eventById(slot?.eventId)?.revivalId);

            if (revival.status !== "OPEN" || !["YES", "MAYBE"].includes(participant.response)) {
                throw badRequest("Svara ja eller kanske först.");
            }
            if (assignmentsOf(slot).length >= slot.needed) {
                throw badRequest("Passet är fullt.");
            }
            assign(slot, participant, true);
            slot.version += 1;
            return {shiftSignUp: toSlot(slot)};
        },
        ShiftWithdraw(persona, {slotId}) {
            const slot = store().slots.find(candidate => candidate.id === String(slotId));
            const {participant} = own(persona, eventById(slot?.eventId)?.revivalId);
            const mine = store().assignments.find(assignment => assignment.slotId === slot.id && assignment.participantId === participant.id);

            if (!mine?.selfSignedUp) {
                throw badRequest("Du kan bara lämna pass du tagit själv.");
            }
            store().assignments = store().assignments.filter(assignment => assignment !== mine);
            slot.version += 1;
            return {shiftWithdraw: toSlot(slot)};
        },
        AvailabilitySet(persona, {input}) {
            const {revival, participant} = own(persona, input.revivalId);
            const event = eventById(input.eventId);

            if (revival.status !== "OPEN" || participant.response === "NO") {
                throw badRequest("Du kan inte svara nu.");
            }
            if (!event || event.cancelled || event.revivalId !== revival.id || !inEvent(event, input.date)) {
                throw badRequest("Dagen ligger inte inom händelsen.");
            }
            if ((input.comment ?? "").length > 255) {
                throw badRequest("Högst 255 tecken.");
            }
            store().availability = store().availability.filter(answer => !(answer.participantId === participant.id && answer.eventId === event.id
                && answer.date === input.date));
            if (input.answer) {
                store().availability.push({
                    participantId: participant.id,
                    eventId: event.id,
                    date: input.date,
                    answer: input.answer,
                    comment: input.comment?.trim() || null
                });
            }
            return {availabilitySet: resolvers.MyParticipation(persona, {revivalId: revival.id}).myParticipation};
        },
        MyParticipation(persona, variables) {
            const result = myParticipation(persona, variables);
            const {revival, participant} = own(persona, variables.revivalId);

            return {myParticipation: {...result.myParticipation, ...participationExtras(revival, participant)}};
        },

        // --- Mailings
        Mailings(persona, {id}) {
            const revival = require(persona, id, "canReadMailings");

            return {
                revival: {
                    __typename: "Revival",
                    id: revival.id,
                    title: revival.title,
                    status: revival.status,
                    permissions: {__typename: "RevivalPermissions", ...permissions(persona, revival)},
                    mailingPlan: planOf(persona, revival)
                },
                mailings: store().mailings.filter(mailing => mailing.revivalId === revival.id).reverse().map(mailing => toMailing(persona, mailing)),
            };
        },
        Mailing(persona, {id, revivalId}) {
            const revival = require(persona, revivalId, "canReadMailings");
            const mailing = store().mailings.find(candidate => candidate.id === String(id) && candidate.revivalId === revival.id);

            return {
                revival: {
                    __typename: "Revival", id: revival.id, title: revival.title, status: revival.status,
                    permissions: {__typename: "RevivalPermissions", ...permissions(persona, revival)}
                },
                mailing: mailing ? toMailing(persona, mailing) : null,
            };
        },
        MailingEditorOptions(persona, {id}) {
            const revival = require(persona, id, "canReadMailings");

            return {
                revival: {
                    __typename: "Revival",
                    id: revival.id,
                    title: revival.title,
                    status: revival.status,
                    permissions: {__typename: "RevivalPermissions", ...permissions(persona, revival)},
                    mailingPlan: planOf(persona, revival)
                },
                events: eventsOf(revival).map(toEvent),
            };
        },
        MailingPositions() {
            return {positions: ["T-ENS", "T-ORK", "T-DEK"].map(positionOf)};
        },
        MailingAudiencePreview(persona, {revivalId, audience}) {
            const revival = require(persona, revivalId, "canReadMailings");

            return {
                mailingAudiencePreview: recipientsOf(revival, audience)
                    .map(recipient => ({
                        __typename: "MailingRecipientPreview",
                        displayName: recipient.displayName,
                        hasAddress: recipient.hasAddress
                    })),
            };
        },
        MailingTemplates(persona, {includeRetired}) {
            return {mailingTemplates: orderedTemplates().filter(template => includeRetired || !template.retired).map(toTemplate)};
        },
        MailingCreate(persona, {input}) {
            const revival = require(persona, input.revivalId, "canDraftMailings");
            const mailing = {
                id: `ml${store().nextId++}`,
                revivalId: revival.id, ...mailingInput(input),
                status: "DRAFT",
                templateId: input.templateId ?? null,
                planEventId: input.eventId ?? null,
                createdBy: persona.sub,
                createdAt: new Date().toISOString(),
                sentBy: null,
                sentAt: null,
                recipients: [],
                version: 0,
            };

            store().mailings.push(mailing);
            return {mailingCreate: toMailing(persona, mailing)};
        },
        MailingUpdate(persona, {id, version, input}) {
            const {mailing} = findMailing(persona, id, version);

            if (mailing.status !== "DRAFT") {
                throw badRequest("Bara utkast kan ändras.");
            }
            Object.assign(mailing, mailingInput(input), {
                templateId: input.templateId ?? mailing.templateId, planEventId: input.eventId ?? mailing.planEventId,
                version: mailing.version + 1
            });
            return {mailingUpdate: toMailing(persona, mailing)};
        },
        MailingCancel(persona, {id, version}) {
            const {mailing} = findMailing(persona, id, version);

            if (mailing.status !== "DRAFT") {
                throw badRequest("Bara utkast kan slängas.");
            }
            Object.assign(mailing, {status: "CANCELLED", version: mailing.version + 1});
            return {mailingCancel: toMailing(persona, mailing)};
        },
        MailingSend(persona, {id, version}) {
            const {mailing, revival} = findMailing(persona, id, version, "canSendMailings");

            if (mailing.status !== "DRAFT") {
                throw badRequest("Utskicket är redan skickat.");
            }
            mailing.recipients = deliver(mailing, recipientsOf(revival, mailing.audience));
            Object.assign(mailing, {
                status: "SENT",
                sentBy: persona.sub,
                sentAt: new Date().toISOString(),
                version: mailing.version + 1
            });
            return {mailingSend: toMailing(persona, mailing)};
        },
        MailingRetry(persona, {id}) {
            const {mailing} = findMailing(persona, id, undefined, "canSendMailings");

            mailing.recipients = [...mailing.recipients.filter(recipient => recipient.status !== "FAILED"),
                ...deliver(mailing, mailing.recipients.filter(recipient => recipient.status === "FAILED"))];
            mailing.version += 1;
            return {mailingRetry: toMailing(persona, mailing)};
        },
        MailingTemplateCreate(persona, {input}) {
            if (!isSuperAdmin(persona)) {
                throw forbidden();
            }
            const template = {
                id: `mt${store().nextId++}`, ...templateInput(input),
                position: store().templates.length,
                retired: false,
                version: 0
            };

            store().templates.push(template);
            return {mailingTemplateCreate: toTemplate(template)};
        },
        MailingTemplateUpdate(persona, {id, version, input}) {
            const template = findTemplate(persona, id, version);

            Object.assign(template, templateInput(input), {version: template.version + 1});
            return {mailingTemplateUpdate: toTemplate(template)};
        },
        MailingTemplateMove(persona, {id, version, position}) {
            const template = findTemplate(persona, id, version);
            const others = orderedTemplates().filter(other => other !== template);

            others.splice(Math.min(Math.max(position, 0), others.length), 0, template);
            others.forEach((other, index) => {
                if (other.position !== index) {
                    Object.assign(other, {position: index, version: other.version + 1});
                }
            });
            return {mailingTemplateMove: others.map(toTemplate)};
        },
        MailingTemplateRetire(persona, {id, version}) {
            const template = findTemplate(persona, id, version);

            Object.assign(template, {retired: true, version: template.version + 1});
            return {mailingTemplateRetire: toTemplate(template)};
        },
        MailingTemplateRestore(persona, {id, version}) {
            const template = findTemplate(persona, id, version);

            Object.assign(template, {retired: false, version: template.version + 1});
            return {mailingTemplateRestore: toTemplate(template)};
        },
    };

    return {
        resolvers: operations,
        permissions,
        /**
         * Revival 1 gets a premiere, a "Rephelg 1" event five days from now (so its allergy mailing is due) with a slot
         * "Biljettkontroll" on its first day, and two mailing templates: the allergy reminder the Monday the week before
         * each "Rephelg 1", and the tickets mailing 14 days before the premiere. {@code capabilities} replaces the
         * steering group member's areas; {@code answered} makes Disa (the "deltagare" persona) answer yes, available on
         * the event's second day, and Anna Andersson answer maybe without saying when she can.
         */
        seed({capabilities, answered = false} = {}) {
            const revival = ctx.state().revivals.find(candidate => candidate.id === "1");
            const start = addDays(today(), 5);
            const event = {
                id: String(900 + store().nextId++),
                revivalId: "1",
                typeId: "3",
                title: "Rephelg 1",
                startDate: start,
                endDate: addDays(start, 1),
                startTime: "10:00",
                endTime: null,
                location: "Kårhuset",
                description: null,
                revivalPays: true,
                cancelled: false,
                checklistId: null,
                version: 0,
            };

            revival.premiereDate = addDays(today(), 60);
            ctx.state().event.events.push(event);
            store().slots.push({
                id: `s${store().nextId++}`,
                eventId: event.id,
                date: start,
                startTime: "18:00",
                endTime: "20:00",
                task: "Biljettkontroll",
                needed: 2,
                comment: null,
                version: 0
            });
            store().templates.push(
                {
                    id: "mt1",
                    name: {sv: "Allergier inför rephelgen", en: "Allergies before the rehearsal weekend"},
                    subject: {sv: "Allergier inför rephelgen", en: "Allergies before the rehearsal weekend"},
                    body: {
                        sv: "Hej!\n\nSvara **senast fredag** om du har allergier.",
                        en: "Hi!\n\nTell us about allergies **by Friday**."
                    },
                    audience: "EVENT_ATTENDEES",
                    eventTypeId: "3",
                    due: {kind: "WEEKDAY_WEEK_BEFORE", amount: null, weekday: "MONDAY"},
                    position: 0,
                    retired: false,
                    version: 0
                },
                {
                    id: "mt2",
                    name: {sv: "Biljetter till föreställningarna", en: null},
                    subject: {sv: "Biljetter", en: null},
                    body: {sv: "Biljetterna släpps nu.", en: null},
                    audience: "PARTICIPANTS",
                    eventTypeId: null,
                    due: {kind: "DAYS", amount: -14, weekday: null},
                    position: 1,
                    retired: false,
                    version: 0
                },
            );
            if (capabilities) {
                members().find(member => member.sub === "p-styrgrupp" && member.revivalId === "1").capabilities = capabilities;
            }
            if (answered) {
                const disa = people().find(participant => participant.memberId === "m-disa");

                Object.assign(disa, {
                    response: "YES",
                    respondedAt: new Date().toISOString(),
                    termsAcceptedAt: new Date().toISOString(),
                    registerConsent: false
                });
                const anna = people().find(participant => participant.spexareId === "501");

                store().availability.push({
                    participantId: disa.id,
                    eventId: event.id,
                    date: addDays(start, 1),
                    answer: "YES",
                    comment: null
                });
                if (anna) {
                    Object.assign(anna, {
                        response: "MAYBE",
                        respondedAt: new Date().toISOString(),
                        registerConsent: false
                    });
                }
            }
        },
    };
}
