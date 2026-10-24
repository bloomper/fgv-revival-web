// The event part of the mock backend (M4): event types, a revival's events with their proposals and checklists, and
// calendar links, with the server's rules (fgv-revival-server/src/main/resources/graphql/event.graphqls). An event
// whose type has a checklist template gets an EVENT checklist through the checklist mock, as EventService does.
import {randomBytes} from "node:crypto";

const DAY = 24 * 60 * 60 * 1000;
const WEB_URL = process.env.WEB_URL || "http://localhost:3101";

const type = (id, sv, en, offsets, days, revivalPays, description) => ({
    id,
    name: {sv, en},
    description,
    rooms: null,
    catering: null,
    offsetMinDays: offsets?.[0] ?? null,
    offsetMaxDays: offsets?.[1] ?? null,
    days,
    revivalPays,
    checklistTemplateId: null,
    position: Number(id) - 1,
    retired: false,
    version: 0,
});

export function createEventState() {
    return {
        nextId: 1,
        types: [
            type("1", "AW", "After work", null, 1, false, {
                sv: "Öl och mat på restaurang. Alla betalar själva.",
                en: "Beer and food at a restaurant. Everyone pays for themselves."
            }),
            type("2", "Kickoff", "Kickoff", [-120, -60], 1, false, null),
            type("3", "Rephelg 1", "Rehearsal weekend 1", [-70, -56], 2, true, null),
            type("4", "Rephelg 2", "Rehearsal weekend 2", [-42, -35], 2, true, null),
            type("5", "Rephelg 3", "Rehearsal weekend 3", [-21, -14], 2, true, null),
            type("6", "Föreställningshelg", "Show weekend", [0, 0], 3, true, null),
            type("7", "Kortafton", "Kortafton", [7, 90], 1, false, null),
        ],
        events: [],
        feeds: [],
    };
}

const addDays = (date, days) => new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY).toISOString().slice(0, 10);
const daysBetween = (from, to) => Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY);
const isSunday = date => new Date(`${date}T00:00:00Z`).getUTCDay() === 0;
const today = () => new Date().toISOString().slice(0, 10);

/**
 * M4-FR-7: the midpoint of the allowed range, rounded toward the earliest, moved to the nearest start whose last day is a
 * Sunday for a type of two days or more.
 */
export function proposalFor(premiere, eventType) {
    const {offsetMinDays: min, offsetMaxDays: max, days} = eventType;
    const mid = Math.floor((min + max) / 2);
    let offset = mid;

    if (days >= 2 && min < max) {
        const sundays = [];

        for (let candidate = min; candidate <= max; candidate++) {
            if (isSunday(addDays(premiere, candidate + days - 1))) {
                sundays.push(candidate);
            }
        }
        sundays.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid) || a - b);
        offset = sundays[0] ?? mid;
    }

    const startDate = addDays(premiere, offset);

    return {
        startDate,
        endDate: addDays(startDate, days - 1),
        earliest: addDays(premiere, min),
        latest: addDays(premiere, max)
    };
}

export function eventResolvers(ctx) {
    const {GraphQLError, forbidden, roleIn, canSee, visibleRevival, isSuperAdmin, resolvers} = ctx;
    const store = () => ctx.state().event;
    const checklists = () => ctx.state().checklist;
    const canWrite = (persona, revival) => ["DIRECTEUR", "STEERING_GROUP"].includes(roleIn(persona, revival))
        && canSee(persona, revival) && revival.status !== "ARCHIVED";
    const canSubscribe = (persona, revival) => !!roleIn(persona, revival) && canSee(persona, revival);
    const localized = value => value ? {__typename: "LocalizedText", en: null, ...value} : null;
    const templateSummary = id => {
        const template = checklists().templates.find(candidate => candidate.id === id);

        return template ? {
            __typename: "ChecklistTemplateSummary",
            id: template.id,
            kind: template.kind,
            chapterKey: null,
            chapterTitle: null,
            name: localized(template.name),
            retired: template.retired
        } : null;
    };
    const toType = eventType => ({
        __typename: "EventType", ...eventType,
        name: localized(eventType.name),
        description: localized(eventType.description),
        rooms: localized(eventType.rooms),
        catering: localized(eventType.catering),
        checklistTemplate: eventType.checklistTemplateId ? templateSummary(eventType.checklistTemplateId) : null,
    });
    const ordered = () => [...store().types].sort((a, b) => a.position - b.position);
    const findType = (id, version) => {
        const found = store().types.find(candidate => candidate.id === String(id));

        if (!found) {
            throw new GraphQLError("NOT_FOUND", "Händelsetypen finns inte.");
        }
        if (version !== undefined && version !== found.version) {
            throw new GraphQLError("CONFLICT", "Någon annan har ändrat detta.");
        }
        return found;
    };
    const checklistSummary = id => {
        const checklist = checklists().checklists.find(candidate => candidate.id === id);

        if (!checklist) {
            return null;
        }
        const items = checklists().items.filter(item => item.checklistId === id);

        return {
            __typename: "ChecklistSummary",
            id,
            kind: "EVENT",
            chapterKey: null,
            chapterTitle: null,
            name: checklist.name,
            date: checklist.date,
            cancelled: checklist.cancelled,
            openCount: items.filter(item => item.state === "OPEN").length,
            overdueCount: 0,
            totalCount: items.length,
            eventId: checklist.eventId ?? null
        };
    };
    const toEvent = event => {
        const revival = ctx.state().revivals.find(candidate => candidate.id === event.revivalId);
        const eventType = event.typeId ? store().types.find(candidate => candidate.id === event.typeId) : null;

        return {
            __typename: "Event", ...event, type: eventType ? toType(eventType) : null,
            daysFromPremiere: revival?.premiereDate ? daysBetween(revival.premiereDate, event.startDate) : null,
            checklist: event.checklistId ? checklistSummary(event.checklistId) : null,
        };
    };
    const sorted = events => [...events].sort((a, b) => a.startDate.localeCompare(b.startDate) || (a.startTime ?? "").localeCompare(b.startTime ?? "")
        || Number(a.id) - Number(b.id));
    const eventsOf = (revival, includeCancelled) => sorted(store().events.filter(event => event.revivalId === revival.id && (includeCancelled || !event.cancelled)));
    const findEvent = (persona, id, version) => {
        const event = store().events.find(candidate => candidate.id === String(id));

        if (!event) {
            throw new GraphQLError("NOT_FOUND", "Händelsen finns inte.");
        }
        const revival = visibleRevival(persona, event.revivalId);

        if (!canWrite(persona, revival)) {
            throw forbidden();
        }
        if (version !== event.version) {
            throw new GraphQLError("CONFLICT", "Någon annan har ändrat detta.");
        }
        return event;
    };
    const time = value => {
        const trimmed = value?.trim() || null;

        if (trimmed && !/^([01]\d|2[0-3]):[0-5]\d$/.test(trimmed)) {
            throw new GraphQLError("BAD_REQUEST", "Ange tiden som TT:MM.");
        }
        return trimmed;
    };
    const validate = event => {
        if (!event.title) {
            throw new GraphQLError("BAD_REQUEST", "Skriv en rubrik.");
        }
        const span = daysBetween(event.startDate, event.endDate);

        if (span < 0 || span > 31) {
            throw new GraphQLError("BAD_REQUEST", "Slutdatumet måste ligga 0–31 dagar efter startdatumet.");
        }
        if (event.endTime && !event.startTime) {
            throw new GraphQLError("BAD_REQUEST", "Ange en starttid om du anger en sluttid.");
        }
    };
    const proposals = revival => {
        if (!revival.premiereDate) {
            return [];
        }
        const held = new Set(store().events.filter(event => event.revivalId === revival.id && !event.cancelled).map(event => event.typeId));

        return ordered().filter(eventType => !eventType.retired && eventType.offsetMinDays !== null && !held.has(eventType.id))
            .map(eventType => ({
                __typename: "EventProposal",
                type: toType(eventType), ...proposalFor(revival.premiereDate, eventType)
            }))
            .sort((a, b) => a.startDate.localeCompare(b.startDate));
    };
    const feedOf = (persona, revival) => store().feeds.find(feed => feed.revivalId === revival.id && feed.sub === persona.sub && !feed.revoked);
    const superAdmin = persona => {
        if (!isSuperAdmin(persona)) {
            throw forbidden();
        }
    };
    const typeInput = (input, self) => {
        const sv = input.name.sv.trim();

        if (!sv) {
            throw new GraphQLError("BAD_REQUEST", "Namnet får inte vara tomt.");
        }
        if (store().types.some(other => other !== self && other.name.sv.toLowerCase() === sv.toLowerCase())) {
            throw new GraphQLError("BAD_REQUEST", `Det finns redan en händelsetyp som heter ${sv}.`);
        }
        if ((input.offsetMinDays == null) !== (input.offsetMaxDays == null) || (input.offsetMinDays != null && input.offsetMinDays > input.offsetMaxDays)) {
            throw new GraphQLError("BAD_REQUEST", "Ange både tidigast och senast, i ordning.");
        }
        const text = value => value?.sv?.trim() ? {sv: value.sv.trim(), en: value.en?.trim() || null} : null;

        return {
            name: {sv, en: input.name.en?.trim() || null},
            description: text(input.description),
            rooms: text(input.rooms),
            catering: text(input.catering),
            offsetMinDays: input.offsetMinDays ?? null,
            offsetMaxDays: input.offsetMaxDays ?? null,
            days: input.days,
            revivalPays: input.revivalPays,
            checklistTemplateId: input.checklistTemplateId ?? null,
        };
    };
    const moveChecklist = (persona, event, changes) => {
        const checklist = checklists().checklists.find(candidate => candidate.id === event.checklistId);

        if (checklist && !checklist.cancelled) {
            resolvers.EventChecklistUpdate(persona, {
                input: {
                    id: checklist.id,
                    version: checklist.version, ...changes
                }
            });
        }
    };

    return {
        EventTypes(persona, {includeRetired}) {
            return {eventTypes: ordered().filter(eventType => includeRetired || !eventType.retired).map(toType)};
        },
        EventTypeCreate(persona, {input}) {
            superAdmin(persona);
            const created = {
                id: `et${store().nextId++}`, ...typeInput(input),
                position: store().types.length,
                retired: false,
                version: 0
            };

            store().types.push(created);
            return {eventTypeCreate: toType(created)};
        },
        EventTypeUpdate(persona, {id, version, input}) {
            superAdmin(persona);
            const found = findType(id, version);

            Object.assign(found, typeInput(input, found), {version: found.version + 1});
            return {eventTypeUpdate: toType(found)};
        },
        EventTypeMove(persona, {id, version, position}) {
            superAdmin(persona);
            const found = findType(id, version);
            const others = ordered().filter(other => other !== found);

            others.splice(Math.min(Math.max(position, 0), others.length), 0, found);
            others.forEach((other, index) => {
                if (other.position !== index) {
                    Object.assign(other, {position: index, version: other.version + 1});
                }
            });
            return {eventTypeMove: others.map(toType)};
        },
        EventTypeRetire(persona, {id, version}) {
            superAdmin(persona);
            const found = findType(id, version);

            Object.assign(found, {retired: true, version: found.version + 1});
            return {eventTypeRetire: toType(found)};
        },
        EventTypeRestore(persona, {id, version}) {
            superAdmin(persona);
            const found = findType(id, version);

            Object.assign(found, {retired: false, version: found.version + 1});
            return {eventTypeRestore: toType(found)};
        },
        RevivalEvents(persona, {id, includeCancelled}) {
            const revival = visibleRevival(persona, id);
            const feed = feedOf(persona, revival);

            return {
                revival: {
                    __typename: "Revival",
                    id: revival.id,
                    title: revival.title,
                    status: revival.status,
                    premiereDate: revival.premiereDate,
                    shows: revival.shows.map(show => ({__typename: "RevivalShow", ...show})),
                    permissions: {
                        __typename: "RevivalPermissions",
                        canWriteLog: canWrite(persona, revival),
                        canSubscribeCalendar: canSubscribe(persona, revival)
                    },
                    eventProposals: proposals(revival),
                    calendarFeed: feed ? {__typename: "CalendarFeed", createdAt: feed.createdAt} : null,
                },
                events: eventsOf(revival, includeCancelled).map(toEvent),
                eventTypes: ordered().filter(eventType => !eventType.retired).map(toType),
                meetings: ctx.state().meeting.meetings.filter(meeting => meeting.revivalId === revival.id)
                    .map(meeting => ({
                        __typename: "MeetingSummary",
                        id: meeting.id,
                        date: meeting.date,
                        title: meeting.title,
                        status: meeting.status
                    })),
            };
        },
        EventCreate(persona, {input}) {
            const revival = visibleRevival(persona, input.revivalId);

            if (!canWrite(persona, revival)) {
                throw forbidden();
            }
            const eventType = input.typeId ? findType(input.typeId) : null;

            if (eventType?.retired) {
                throw new GraphQLError("BAD_REQUEST", "Händelsetypen är avvecklad.");
            }
            const event = {
                id: String(store().nextId++),
                revivalId: revival.id,
                typeId: eventType?.id ?? null,
                title: input.title?.trim() || eventType?.name.sv || "",
                startDate: input.startDate,
                endDate: input.endDate || addDays(input.startDate, (eventType?.days ?? 1) - 1),
                startTime: time(input.startTime),
                endTime: time(input.endTime),
                location: input.location?.trim() || null,
                description: input.description?.trim() || null,
                revivalPays: input.revivalPays ?? eventType?.revivalPays ?? false,
                cancelled: false,
                checklistId: null,
                version: 0,
            };

            validate(event);
            const template = eventType?.checklistTemplateId && checklists().templates.find(candidate => candidate.id === eventType.checklistTemplateId);

            if (template && !template.retired) {
                const created = resolvers.EventChecklistCreate(persona, {
                    input: {
                        revivalId: revival.id,
                        name: event.title,
                        date: event.startDate,
                        templateId: template.id
                    }
                });

                event.checklistId = created.eventChecklistCreate.id;
                checklists().checklists.find(candidate => candidate.id === event.checklistId).eventId = event.id;
            }
            store().events.push(event);
            return {eventCreate: toEvent(event)};
        },
        EventUpdate(persona, {input}) {
            const event = findEvent(persona, input.id, input.version);

            if (event.cancelled) {
                throw new GraphQLError("BAD_REQUEST", "Händelsen är inställd.");
            }
            const next = {
                ...event,
                title: input.title?.trim() || event.title,
                startDate: input.startDate ?? event.startDate,
                endDate: input.endDate ?? event.endDate,
                startTime: input.clearStartTime ? null : input.startTime !== undefined && input.startTime !== null ? time(input.startTime) : event.startTime,
                endTime: input.clearEndTime ? null : input.endTime !== undefined && input.endTime !== null ? time(input.endTime) : event.endTime,
                location: input.clearLocation ? null : input.location?.trim() || event.location,
                description: input.clearDescription ? null : input.description?.trim() || event.description,
                revivalPays: input.revivalPays ?? event.revivalPays,
            };

            validate(next);
            if (next.title !== event.title || next.startDate !== event.startDate) {
                moveChecklist(persona, event, {
                    ...(next.title !== event.title ? {name: next.title} : {}), ...(next.startDate !== event.startDate ? {date: next.startDate} : {}),
                });
            }
            Object.assign(event, next, {version: event.version + 1});
            return {eventUpdate: toEvent(event)};
        },
        EventCancel(persona, {id, version}) {
            const event = findEvent(persona, id, version);
            const checklist = checklists().checklists.find(candidate => candidate.id === event.checklistId);

            if (checklist) {
                Object.assign(checklist, {cancelled: true, version: checklist.version + 1});
            }
            Object.assign(event, {cancelled: true, version: event.version + 1});
            return {eventCancel: toEvent(event)};
        },
        EventRestore(persona, {id, version}) {
            const event = findEvent(persona, id, version);
            const checklist = checklists().checklists.find(candidate => candidate.id === event.checklistId);

            if (checklist) {
                Object.assign(checklist, {cancelled: false, version: checklist.version + 1});
            }
            Object.assign(event, {cancelled: false, version: event.version + 1});
            return {eventRestore: toEvent(event)};
        },
        CalendarFeedCreate(persona, {revivalId}) {
            const revival = visibleRevival(persona, revivalId);

            if (!canSubscribe(persona, revival)) {
                throw forbidden();
            }
            store().feeds.filter(feed => feed.revivalId === revival.id && feed.sub === persona.sub).forEach(feed => {
                feed.revoked = true;
            });
            const token = randomBytes(32).toString("base64url");
            const feed = {
                revivalId: revival.id,
                sub: persona.sub,
                token,
                createdAt: new Date().toISOString(),
                revoked: false
            };

            store().feeds.push(feed);
            return {
                calendarFeedCreate: {
                    __typename: "CalendarFeedLink",
                    url: `${WEB_URL}/api/calendar/${token}.ics`,
                    createdAt: feed.createdAt
                }
            };
        },
        CalendarFeedRevoke(persona, {revivalId}) {
            const revival = visibleRevival(persona, revivalId);

            store().feeds.filter(feed => feed.revivalId === revival.id && feed.sub === persona.sub).forEach(feed => {
                feed.revoked = true;
            });
            return {calendarFeedRevoke: null};
        },
        /** The next three events that have not ended, for RevivalWorkSummary. */
        upcomingEvents(revival) {
            return eventsOf(revival, false).filter(event => event.endDate >= today()).slice(0, 3).map(toEvent);
        },
        /** The event a checklist belongs to, for Checklist.event. */
        eventOfChecklist(checklistId) {
            const event = store().events.find(candidate => candidate.checklistId === checklistId);

            return event ? toEvent(event) : null;
        },
        /** Revival 1 gets a premiere and a show, and "Rephelg 1" an event checklist template with two items. */
        seed() {
            const as = {sub: "p-superadmin", roles: ["USER", "SUPER_ADMIN"]};
            const revival = ctx.state().revivals.find(candidate => candidate.id === "1");

            Object.assign(revival, {
                premiereDate: "2028-03-04",
                shows: [{date: "2028-03-04", time: "19:00", venue: "Kårhuset"}]
            });
            const {checklistTemplateCreate: template} = resolvers.ChecklistTemplateCreate(as, {
                input: {
                    kind: "EVENT",
                    name: {sv: "Övningshelg", en: null}
                }
            });

            resolvers.ChecklistTemplateItemCreate(as, {
                input: {
                    templateId: template.id,
                    text: {sv: "Boka lokaler"},
                    deadline: {kind: "DAYS", amount: -14}
                }
            });
            resolvers.ChecklistTemplateItemCreate(as, {input: {templateId: template.id, text: {sv: "Handla fika"}}});
            store().types.find(candidate => candidate.id === "3").checklistTemplateId = template.id;
        },
        /** The calendar feed for a token, or null when it is unknown, turned off, or no longer the person's. */
        feed(token, lang, personaOf) {
            const feed = store().feeds.find(candidate => candidate.token === token && !candidate.revoked);
            const persona = feed && personaOf(feed.sub);
            const revival = feed && ctx.state().revivals.find(candidate => candidate.id === feed.revivalId);

            if (!feed || !persona || !revival || !canSubscribe(persona, revival)) {
                return null;
            }
            const date = value => value.replaceAll("-", "");
            const lines = [
                "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//FGV//Nyuppsättning//SV", "CALSCALE:GREGORIAN", `X-WR-CALNAME:${revival.title}`,
                ...eventsOf(revival, false).flatMap(event => [
                    "BEGIN:VEVENT", `UID:event-${event.id}@nyuppsattning.fgv.nu`, `DTSTAMP:20261020T100000Z`,
                    `DTSTART;VALUE=DATE:${date(event.startDate)}`, `DTEND;VALUE=DATE:${date(addDays(event.endDate, 1))}`, `SUMMARY:${event.title}`,
                    ...(event.location ? [`LOCATION:${event.location}`] : []), "END:VEVENT",
                ]),
                ...revival.shows.flatMap((show, index) => [
                    "BEGIN:VEVENT", `UID:show-${revival.id}-${index}@nyuppsattning.fgv.nu`, `DTSTAMP:20261020T100000Z`,
                    `DTSTART;VALUE=DATE:${date(show.date)}`, `SUMMARY:${revival.title}: ${lang === "en" ? "Show" : "Föreställning"}`, "END:VEVENT",
                ]),
                "END:VCALENDAR",
            ];

            return `${lines.join("\r\n")}\r\n`;
        },
    };
}
